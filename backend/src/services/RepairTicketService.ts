import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { priorityOfSeverity } from "../constants/Priority";
import { requiredSkillOf } from "../constants/SkillTag";
import type { CallRegisterPayload, DispatchPayload, RestorePayload } from "../types/RepairTicketPayload";
import type { FaultReport } from "../models/FaultReport";
import type { RepairTicket, TicketEvent } from "../models/RepairTicket";
import { DomainError } from "../utils/errors";
import { isoNow } from "../utils/formatters";
import { writeAudit } from "../utils/audit";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { findMergeTarget } from "./callMergePolicy";
import { assertDispatchable, checkCrewEligible, findCrewActiveTicket } from "./dispatchPolicy";
import { createRepairTicketView, type RepairTicketView } from "../constructors/RepairTicketViewFactory";
import { createCrewCandidateView, type CrewCandidateView } from "../constructors/CrewCandidateFactory";

const pushEvent = (ticket: RepairTicket, event: TicketEvent): void => {
  ticket.events.push(event);
};

const syncMergedReportsStatus = (ticket: RepairTicket, status: FaultReport["status"]): void => {
  for (const reportId of ticket.merged_report_ids) {
    faultReportRepository.update(reportId, { status, ticket_id: null, merged_into_ticket_id: ticket.id });
  }
  faultReportRepository.update(ticket.fault_report_id, { status });
};

const requireTicket = (id: number): RepairTicket => {
  const ticket = repairTicketRepository.findById(id);
  if (!ticket) throw new DomainError("TICKET_NOT_FOUND", 404, `工单 #${id} 不存在`);
  return ticket;
};

const assertStatus = (ticket: RepairTicket, allowed: string[]): void => {
  if (!allowed.includes(ticket.status)) {
    throw new DomainError("ILLEGAL_STATUS_FLOW", 409, `工单 #${ticket.id} 当前为 ${ticket.status}，不允许该操作`);
  }
};

export const repairTicketService = {
  listViews(): RepairTicketView[] {
    return repairTicketRepository
      .findAll()
      .map((ticket) =>
        createRepairTicketView(ticket, faultReportRepository.findAll(), ticket.team_id ? crewRepository.findById(ticket.team_id) ?? null : null)
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getView(id: number): RepairTicketView {
    const ticket = requireTicket(id);
    return createRepairTicketView(ticket, faultReportRepository.findAll(), ticket.team_id ? crewRepository.findById(ticket.team_id) ?? null : null);
  },

  // 值班员来电登记：同线路同故障 30 分钟内并入最早一张待处理单；否则新建
  registerCall(payload: Partial<CallRegisterPayload>, actor: string): { merged: boolean; ticket_id: number; view: RepairTicketView } {
    if (!payload.phone || !payload.reporter_name || !payload.asset_id || !payload.fault_type) {
      throw new DomainError("VALIDATION_FAILED", 400, "来电登记缺少必填字段（号码、报修人、资产、故障类型）");
    }
    const asset = gridAssetRepository.findById(Number(payload.asset_id));
    if (!asset) throw new DomainError("ASSET_NOT_FOUND", 404, `资产 #${payload.asset_id} 不存在`);

    const reportedAt = payload.reported_at ?? isoNow();
    const mergeTarget = findMergeTarget(
      { asset, fault_type: payload.fault_type, reported_at: reportedAt },
      repairTicketRepository.findAll(),
      faultReportRepository.findAll()
    );

    const report: FaultReport = {
      id: faultReportRepository.nextId(),
      reporter_name: payload.reporter_name,
      phone: payload.phone,
      asset_id: asset.id,
      fault_type: payload.fault_type,
      address_desc: payload.address_desc ?? asset.location_desc,
      severity: payload.severity ?? "MEDIUM",
      report_channel: payload.report_channel ?? "PHONE",
      status: "PENDING",
      ticket_id: null,
      merged_into_ticket_id: null,
      reported_at: reportedAt
    };
    faultReportRepository.insert(report);

    if (mergeTarget) {
      const { ticket, reason } = mergeTarget;
      ticket.merged_report_ids = [...ticket.merged_report_ids, report.id];
      const mappedStatus: Record<string, FaultReport["status"]> = {
        WAIT_DISPATCH: "MERGED",
        ASSIGNED: "ASSIGNED",
        ARRIVED: "REPAIRING",
        REPAIRING: "REPAIRING",
        RESTORED: "RESTORED",
        CLOSED: "CLOSED"
      };
      faultReportRepository.update(report.id, { status: mappedStatus[ticket.status] ?? "MERGED", ticket_id: null, merged_into_ticket_id: ticket.id });
      pushEvent(ticket, { type: "MERGE", at: reportedAt, note: `${report.phone} ${reason}，号码集中保留` });
      writeAudit(actor, LOG_TEMPLATES.FaultReport[4], { reportId: report.id, ticketId: ticket.id }, "FaultReport", report.id);
      return { merged: true, ticket_id: ticket.id, view: this.getView(ticket.id) };
    }

    const ticketId = repairTicketRepository.nextId();
    const ticket: RepairTicket = {
      id: ticketId,
      fault_report_id: report.id,
      team_id: null,
      dispatcher_id: 1,
      priority: priorityOfSeverity(report.severity),
      status: "WAIT_DISPATCH",
      feeder_line: asset.feeder_line,
      fault_type: report.fault_type,
      address_desc: report.address_desc,
      merged_report_ids: [],
      created_at: reportedAt,
      assigned_at: null,
      arrived_at: null,
      restored_at: null,
      closed_at: null,
      restore_result: null,
      conflict_team_id: null,
      conflict_ticket_id: null,
      conflict_reason: null,
      events: []
    };
    repairTicketRepository.insert(ticket);
    faultReportRepository.update(report.id, { status: "PENDING", ticket_id: ticketId });
    pushEvent(ticket, { type: "CREATE", at: reportedAt, note: `值班员接听 ${report.phone} 来电话务，新建待处理工单` });
    writeAudit(actor, LOG_TEMPLATES.FaultReport[5], { phone: report.phone, ticketId }, "RepairTicket", ticketId);
    return { merged: false, ticket_id: ticketId, view: this.getView(ticketId) };
  },

  // 派工候选：当班 + 技能匹配；标注被占用班组及冲突工单
  listCandidates(id: number): CrewCandidateView[] {
    const ticket = requireTicket(id);
    const requiredSkill = requiredSkillOf(ticket.fault_type);
    return crewRepository.findAll().map((crew) => {
      const { eligible } = checkCrewEligible(crew, ticket.fault_type);
      const activeTicket = findCrewActiveTicket(crew, repairTicketRepository.findAll());
      let rejectReason: string | null = null;
      if (crew.duty_status !== "ON_DUTY") rejectReason = "非当班";
      else if (!crew.skill_tags.includes(requiredSkill)) rejectReason = `缺少技能 ${requiredSkill}`;
      else if (activeTicket) rejectReason = `被工单 #${activeTicket.id}（${activeTicket.priority}）占用`;
      return createCrewCandidateView(crew, eligible && !activeTicket, activeTicket, rejectReason);
    });
  },

  // 派工：只从当班且技能匹配班组选择；若被更紧急任务占用，退回待派并标出冲突
  dispatch(id: number, payload: Partial<DispatchPayload>, actor: string): RepairTicketView {
    const ticket = requireTicket(id);
    assertStatus(ticket, ["WAIT_DISPATCH"]);
    if (!payload.team_id) throw new DomainError("VALIDATION_FAILED", 400, "派工必须选择班组");

    const crew = crewRepository.findById(Number(payload.team_id));
    if (!crew) throw new DomainError("CREW_NOT_FOUND", 404, `班组 #${payload.team_id} 不存在`);

    const requiredSkill = requiredSkillOf(ticket.fault_type);
    const activeTicket = findCrewActiveTicket(crew, repairTicketRepository.findAll());

    try {
      assertDispatchable(crew, ticket, activeTicket, requiredSkill);
    } catch (err) {
      if (err instanceof DomainError && err.code === "CREW_CONFLICT" && activeTicket) {
        // 派工退回待派：保留原状态，并标出冲突工单与占用原因
        repairTicketRepository.update(id, {
          status: "WAIT_DISPATCH",
          team_id: null,
          conflict_team_id: crew.id,
          conflict_ticket_id: activeTicket.id,
          conflict_reason: err.message
        });
        pushEvent(ticket, {
          type: "DISPATCH_CONFLICT",
          at: isoNow(),
          note: `派工退回待派：${err.message}（冲突工单 #${activeTicket.id}）`
        });
        writeAudit(
          actor,
          LOG_TEMPLATES.RepairTicket[5],
          { ticketId: id, teamId: crew.id, conflictTicketId: activeTicket.id, reason: activeTicket.priority },
          "RepairTicket",
          id
        );
      }
      throw err;
    }

    const assignedAt = isoNow();
    repairTicketRepository.update(id, {
      status: "ASSIGNED",
      team_id: crew.id,
      dispatcher_id: payload.dispatcher_id ?? ticket.dispatcher_id,
      assigned_at: assignedAt,
      conflict_team_id: null,
      conflict_ticket_id: null,
      conflict_reason: null
    });
    crewRepository.update(crew.id, { current_ticket_id: ticket.id });
    syncMergedReportsStatus(ticket, "ASSIGNED");
    pushEvent(ticket, { type: "DISPATCH", at: assignedAt, note: `派工给「${crew.name}」（技能 ${requiredSkill} 匹配，当班中）` });
    writeAudit(actor, LOG_TEMPLATES.RepairTicket[4], { ticketId: id, teamId: crew.id }, "RepairTicket", id);
    return this.getView(id);
  },

  // 到场：先记录到场，随后合并报修一起进入处理中
  arrive(id: number, actor: string): RepairTicketView {
    const ticket = requireTicket(id);
    assertStatus(ticket, ["ASSIGNED"]);
    const arrivedAt = isoNow();
    repairTicketRepository.update(id, { status: "ARRIVED", arrived_at: arrivedAt });
    pushEvent(ticket, { type: "ARRIVE", at: arrivedAt, note: "班组已到达现场" });
    writeAudit(actor, LOG_TEMPLATES.RepairTicket[6], { ticketId: id }, "RepairTicket", id);

    repairTicketRepository.update(id, { status: "REPAIRING" });
    syncMergedReportsStatus(ticket, "REPAIRING");
    pushEvent(ticket, {
      type: "REPAIRING",
      at: arrivedAt,
      note: `合并报修 ${ticket.merged_report_ids.length + 1} 起一起进入处理中`
    });
    writeAudit(actor, LOG_TEMPLATES.RepairTicket[7], { ticketId: id, count: ticket.merged_report_ids.length + 1 }, "RepairTicket", id);
    return this.getView(id);
  },

  // 复电：统一登记复电时间和结果（主单与合并报修同一次登记）
  restore(id: number, payload: Partial<RestorePayload>, actor: string): RepairTicketView {
    const ticket = requireTicket(id);
    assertStatus(ticket, ["REPAIRING"]);
    if (!payload.restore_result || !payload.restore_result.trim()) {
      throw new DomainError("INVALID_RESTORE_RESULT", 400, "复电必须登记处理结果");
    }
    const restoredAt = payload.restored_at ?? isoNow();
    repairTicketRepository.update(id, { status: "RESTORED", restored_at: restoredAt, restore_result: payload.restore_result.trim() });
    syncMergedReportsStatus(ticket, "RESTORED");
    if (ticket.team_id) crewRepository.update(ticket.team_id, { current_ticket_id: null });
    pushEvent(ticket, { type: "RESTORE", at: restoredAt, note: `统一复电：${payload.restore_result.trim()}` });
    writeAudit(actor, LOG_TEMPLATES.RepairTicket[8], { ticketId: id }, "RepairTicket", id);
    return this.getView(id);
  },

  close(id: number, actor: string): RepairTicketView {
    const ticket = requireTicket(id);
    assertStatus(ticket, ["RESTORED"]);
    repairTicketRepository.update(id, { status: "CLOSED", closed_at: isoNow() });
    syncMergedReportsStatus(ticket, "CLOSED");
    pushEvent(ticket, { type: "CLOSE", at: isoNow(), note: "工单归档，合并报修一并关闭" });
    writeAudit(actor, LOG_TEMPLATES.RepairTicket[9], { ticketId: id }, "RepairTicket", id);
    return this.getView(id);
  }
};
