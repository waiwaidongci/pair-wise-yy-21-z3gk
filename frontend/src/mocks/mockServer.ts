import { buildMockData, type MockData } from "./seedData";
import type { RepairTicket, TicketEvent } from "../types/RepairTicket";
import type { FaultReport } from "../types/FaultReport";
import type { Crew } from "../types/Crew";
import type { GridAsset } from "../types/GridAsset";
import type { CallRegisterPayload, CallRegisterResult, CrewCandidate, RepairTicketView, RestorePayload } from "../types/dispatch";
import { isMoreUrgent, SeverityPriorityMap } from "../constants/Priority";
import { requiredSkillOf } from "../constants/SkillTag";
import { dedupePhones, isWithinMergeWindow, isoNow } from "../utils/formatters";

export class MockApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public conflict_ticket_id?: number,
    public conflict_reason?: string
  ) {
    super(message);
  }
}

const PENDING_TICKET_STATUS = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING"];
const ACTIVE_TICKET_STATUS = ["ASSIGNED", "ARRIVED", "REPAIRING"];

export class MockTicketServer {
  private data: MockData = buildMockData();

  reset(): void {
    this.data = buildMockData();
  }

  listAssets(): GridAsset[] {
    return this.data.gridAsset;
  }

  listReports(): FaultReport[] {
    return this.data.faultReport;
  }

  listCrew(): Crew[] {
    return this.data.crew;
  }

  private getTicket(id: number): RepairTicket {
    const ticket = this.data.repairTicket.find((row) => row.id === id);
    if (!ticket) throw new MockApiError(404, "TICKET_NOT_FOUND", `工单 #${id} 不存在`);
    return ticket;
  }

  private getCrew(id: number): Crew {
    const crew = this.data.crew.find((row) => row.id === id);
    if (!crew) throw new MockApiError(404, "CREW_NOT_FOUND", `班组 #${id} 不存在`);
    return crew;
  }

  private activeTicketOf(crew: Crew): RepairTicket | null {
    if (crew.current_ticket_id == null) return null;
    const ticket = this.data.repairTicket.find((row) => row.id === crew.current_ticket_id);
    return ticket && ACTIVE_TICKET_STATUS.includes(ticket.status) ? ticket : null;
  }

  private syncReportsStatus(ticket: RepairTicket, status: FaultReport["status"]): void {
    const memberIds = [ticket.fault_report_id, ...ticket.merged_report_ids];
    for (const report of this.data.faultReport) {
      if (memberIds.includes(report.id)) report.status = status;
    }
  }

  private toView(ticket: RepairTicket): RepairTicketView {
    const memberIds = [ticket.fault_report_id, ...ticket.merged_report_ids];
    const members = this.data.faultReport.filter((report) => memberIds.includes(report.id));
    const primary = members.find((report) => report.id === ticket.fault_report_id) ?? members[0];
    const merged = members.filter((report) => report.id !== ticket.fault_report_id).map((report) => ({ ...report }));
    const events = [...ticket.events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const crew = ticket.team_id ? this.data.crew.find((row) => row.id === ticket.team_id) ?? null : null;
    return {
      ...ticket,
      events,
      primary_report: primary ? { ...primary, is_primary: true } : ({} as FaultReport),
      merged_reports: merged.map((report) => ({ ...report, is_primary: false })),
      phones: dedupePhones(members.map((report) => report.phone)),
      report_count: members.length,
      team: crew ? { ...crew, skill_tags: [...crew.skill_tags] } : null
    };
  }

  listTickets(): RepairTicketView[] {
    return this.data.repairTicket
      .map((ticket) => this.toView(ticket))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  registerCall(payload: CallRegisterPayload): CallRegisterResult {
    const asset = this.data.gridAsset.find((row) => row.id === Number(payload.asset_id));
    if (!asset) throw new MockApiError(404, "ASSET_NOT_FOUND", `资产 #${payload.asset_id} 不存在`);

    const reportedAt = isoNow();
    const target = this.data.repairTicket
      .filter((ticket) => PENDING_TICKET_STATUS.includes(ticket.status))
      .filter((ticket) => ticket.feeder_line === asset.feeder_line)
      .filter((ticket) => ticket.fault_type === payload.fault_type)
      .filter((ticket) => isWithinMergeWindow(ticket.created_at, reportedAt))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

    const reportId = this.data.faultReport.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const report: FaultReport = {
      id: reportId,
      reporter_name: payload.reporter_name,
      phone: payload.phone,
      asset_id: asset.id,
      fault_type: payload.fault_type,
      address_desc: payload.address_desc || asset.location_desc,
      severity: payload.severity || "MEDIUM",
      report_channel: payload.report_channel || "PHONE",
      status: "PENDING",
      ticket_id: null,
      merged_into_ticket_id: null,
      reported_at: reportedAt
    };
    this.data.faultReport.push(report);

    if (target) {
      target.merged_report_ids = [...target.merged_report_ids, reportId];
      const mapped: Record<string, FaultReport["status"]> = {
        WAIT_DISPATCH: "MERGED", ASSIGNED: "ASSIGNED", ARRIVED: "REPAIRING",
        REPAIRING: "REPAIRING", RESTORED: "RESTORED", CLOSED: "CLOSED"
      };
      report.status = mapped[target.status] ?? "MERGED";
      report.merged_into_ticket_id = target.id;
      const event: TicketEvent = {
        type: "MERGE",
        at: reportedAt,
        note: `${report.phone} 同线路（${target.feeder_line}）同故障 30 分钟内已有待处理工单 #${target.id}，号码集中保留`
      };
      target.events.push(event);
      return { merged: true, ticket_id: target.id, ticket: this.toView(target) };
    }

    const ticketId = this.data.repairTicket.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const ticket: RepairTicket = {
      id: ticketId, fault_report_id: reportId, team_id: null, dispatcher_id: 1,
      priority: SeverityPriorityMap[report.severity] ?? "P3", status: "WAIT_DISPATCH",
      feeder_line: asset.feeder_line, fault_type: report.fault_type, address_desc: report.address_desc,
      merged_report_ids: [], created_at: reportedAt, assigned_at: null, arrived_at: null,
      restored_at: null, closed_at: null, restore_result: null,
      conflict_team_id: null, conflict_ticket_id: null, conflict_reason: null,
      events: [{ type: "CREATE", at: reportedAt, note: `值班员接听 ${report.phone} 来电话务，新建待处理工单` }]
    };
    this.data.repairTicket.push(ticket);
    report.status = "PENDING";
    report.ticket_id = ticketId;
    return { merged: false, ticket_id: ticketId, ticket: this.toView(ticket) };
  }

  listCandidates(ticketId: number): CrewCandidate[] {
    const ticket = this.getTicket(ticketId);
    const requiredSkill = requiredSkillOf(ticket.fault_type);
    return this.data.crew.map((crew) => {
      const active = this.activeTicketOf(crew);
      const skillMatch = crew.skill_tags.includes(requiredSkill);
      const onDuty = crew.duty_status === "ON_DUTY";
      let rejectReason: string | null = null;
      if (!onDuty) rejectReason = "非当班";
      else if (!skillMatch) rejectReason = `缺少技能 ${requiredSkill}`;
      else if (active) rejectReason = `被工单 #${active.id}（${active.priority}）占用`;
      return {
        crew: { ...crew, skill_tags: [...crew.skill_tags] },
        eligible: onDuty && skillMatch && !active,
        busy: active !== null,
        occupied_by_ticket: active ? { ...active } : null,
        reject_reason: rejectReason
      };
    });
  }

  dispatch(ticketId: number, teamId: number): RepairTicketView {
    const ticket = this.getTicket(ticketId);
    if (ticket.status !== "WAIT_DISPATCH") {
      throw new MockApiError(409, "ILLEGAL_STATUS_FLOW", `工单 #${ticketId} 当前为 ${ticket.status}，不允许派工`);
    }
    const crew = this.getCrew(teamId);
    const requiredSkill = requiredSkillOf(ticket.fault_type);
    const active = this.activeTicketOf(crew);

    if (crew.duty_status !== "ON_DUTY") {
      throw new MockApiError(400, "CREW_NOT_ON_DUTY", `班组「${crew.name}」当前不在当班状态`);
    }
    if (!crew.skill_tags.includes(requiredSkill)) {
      throw new MockApiError(400, "CREW_SKILL_MISMATCH", `班组「${crew.name}」缺少技能 ${requiredSkill}，无法处理该故障`);
    }
    if (active && isMoreUrgent(active.priority, ticket.priority)) {
      const reason = `班组「${crew.name}」正抢修更紧急工单 #${active.id}（${active.priority}，${active.feeder_line}）`;
      // 派工退回待派：标出冲突工单和占用原因
      ticket.status = "WAIT_DISPATCH";
      ticket.team_id = null;
      ticket.conflict_team_id = crew.id;
      ticket.conflict_ticket_id = active.id;
      ticket.conflict_reason = reason;
      ticket.events.push({ type: "DISPATCH_CONFLICT", at: isoNow(), note: `派工退回待派：${reason}（冲突工单 #${active.id}）` });
      throw new MockApiError(409, "CREW_CONFLICT", reason, active.id, reason);
    }
    if (active) {
      throw new MockApiError(409, "CREW_BUSY", `班组「${crew.name}」正执行工单 #${active.id}（${active.priority}），紧急度不高于本单，可改派其他班组`);
    }

    const assignedAt = isoNow();
    ticket.status = "ASSIGNED";
    ticket.team_id = crew.id;
    ticket.assigned_at = assignedAt;
    ticket.conflict_team_id = null;
    ticket.conflict_ticket_id = null;
    ticket.conflict_reason = null;
    crew.current_ticket_id = ticket.id;
    this.syncReportsStatus(ticket, "ASSIGNED");
    ticket.events.push({ type: "DISPATCH", at: assignedAt, note: `派工给「${crew.name}」（技能 ${requiredSkill} 匹配，当班中）` });
    return this.toView(ticket);
  }

  arrive(ticketId: number): RepairTicketView {
    const ticket = this.getTicket(ticketId);
    if (ticket.status !== "ASSIGNED") {
      throw new MockApiError(409, "ILLEGAL_STATUS_FLOW", `工单 #${ticketId} 当前为 ${ticket.status}，未派工无法到场`);
    }
    const at = isoNow();
    ticket.status = "ARRIVED";
    ticket.arrived_at = at;
    ticket.events.push({ type: "ARRIVE", at, note: "班组已到达现场" });
    // 到场后合并报修一起进入处理中
    ticket.status = "REPAIRING";
    this.syncReportsStatus(ticket, "REPAIRING");
    ticket.events.push({ type: "REPAIRING", at, note: `合并报修 ${ticket.merged_report_ids.length + 1} 起一起进入处理中` });
    return this.toView(ticket);
  }

  restore(ticketId: number, payload: RestorePayload): RepairTicketView {
    const ticket = this.getTicket(ticketId);
    if (ticket.status !== "REPAIRING") {
      throw new MockApiError(409, "ILLEGAL_STATUS_FLOW", `工单 #${ticketId} 当前为 ${ticket.status}，未在处理中`);
    }
    if (!payload.restore_result?.trim()) {
      throw new MockApiError(400, "INVALID_RESTORE_RESULT", "复电必须登记处理结果");
    }
    const at = isoNow();
    ticket.status = "RESTORED";
    ticket.restored_at = at;
    ticket.restore_result = payload.restore_result.trim();
    this.syncReportsStatus(ticket, "RESTORED");
    const crew = ticket.team_id ? this.data.crew.find((row) => row.id === ticket.team_id) : null;
    if (crew) crew.current_ticket_id = null;
    ticket.events.push({ type: "RESTORE", at, note: `统一复电：${payload.restore_result.trim()}` });
    return this.toView(ticket);
  }

  close(ticketId: number): RepairTicketView {
    const ticket = this.getTicket(ticketId);
    if (ticket.status !== "RESTORED") {
      throw new MockApiError(409, "ILLEGAL_STATUS_FLOW", `工单 #${ticketId} 复电后才能归档`);
    }
    ticket.status = "CLOSED";
    ticket.closed_at = isoNow();
    this.syncReportsStatus(ticket, "CLOSED");
    ticket.events.push({ type: "CLOSE", at: isoNow(), note: "工单归档，合并报修一并关闭" });
    return this.toView(ticket);
  }
}

// 单例：会话内保持状态，页面操作在离线时也可完整流转
export const mockTicketServer = new MockTicketServer();
