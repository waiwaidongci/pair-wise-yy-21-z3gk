import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { createRepairTicketResponse } from "../constructors/RepairTicketDtoFactory";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { priorityRank } from "../constants/TicketPriority";
import { ServiceError } from "../utils/ServiceError";
import { toAuditTarget } from "../utils/formatters";
import type { RepairTicket } from "../models/RepairTicket";
import type { Crew } from "../models/Crew";
import type { DispatchTicketPayload, RestoreTicketPayload } from "../types/RepairTicketPayload";

const ticketLog = (template: string, ticketId: number, detail: string) =>
  auditLogRepository.save({ actor: "dispatcher", action: renderLog(template, detail), target_type: "RepairTicket", target_id: toAuditTarget("RepairTicket", ticketId) });

const crewLog = (template: string, crewId: number, detail: string) =>
  auditLogRepository.save({ actor: "dispatcher", action: renderLog(template, detail), target_type: "Crew", target_id: toAuditTarget("Crew", crewId) });

const requireTicket = (id: number): RepairTicket => {
  const ticket = repairTicketRepository.findById(id);
  if (!ticket) {
    throw new ServiceError(ERROR_CODES.TICKET_NOT_FOUND, ERROR_MESSAGES.TICKET_NOT_FOUND, 404);
  }
  return ticket;
};

const skillMatch = (crew: Crew, faultType: string): boolean =>
  crew.skill_tags.split(",").map((tag) => tag.trim()).includes(faultType);

// 合并报修随主单一同流转状态。
const moveMergedReports = (ticket: RepairTicket, status: string) => {
  for (const reportId of ticket.merged_report_ids) {
    faultReportRepository.update(reportId, { status });
  }
};

export const repairTicketService = {
  list: () => repairTicketRepository.findAll().map((ticket) => createRepairTicketResponse(ticket)),

  // 派工候选：仅当班且技能匹配班组可选；占用班组返回占用信息供前端标注。
  candidates: (ticketId: number) => {
    const ticket = requireTicket(ticketId);
    return crewRepository.findAll().map((crew) => {
      const onDuty = crew.duty_status === "ON_DUTY";
      const matched = skillMatch(crew, ticket.fault_type);
      const occupant = crew.current_ticket_id ? repairTicketRepository.findById(crew.current_ticket_id) : undefined;
      return {
        crew_id: crew.id,
        name: crew.name,
        contact_phone: crew.contact_phone,
        skills: crew.skill_tags,
        on_duty: onDuty,
        skill_match: matched,
        occupied: crew.current_ticket_id > 0,
        eligible: onDuty && matched && crew.current_ticket_id === 0,
        occupied_ticket_id: crew.current_ticket_id || null,
        occupied_priority: occupant?.priority ?? null,
        occupied_reason: crew.occupied_reason ?? occupant?.address_desc ?? null
      };
    });
  },

  dispatch: (ticketId: number, payload: DispatchTicketPayload, dispatcherId = 1) => {
    const ticket = requireTicket(ticketId);
    if (ticket.status !== "WAIT_DISPATCH") {
      throw new ServiceError(ERROR_CODES.TICKET_STATUS_INVALID, ERROR_MESSAGES.TICKET_STATUS_INVALID, 409);
    }
    const crew = crewRepository.findById(Number(payload.crew_id));
    if (!crew) {
      throw new ServiceError(ERROR_CODES.CREW_NOT_FOUND, ERROR_MESSAGES.CREW_NOT_FOUND, 404);
    }
    if (crew.duty_status !== "ON_DUTY") {
      throw new ServiceError(ERROR_CODES.CREW_NOT_ON_DUTY, ERROR_MESSAGES.CREW_NOT_ON_DUTY, 409);
    }
    if (!skillMatch(crew, ticket.fault_type)) {
      throw new ServiceError(ERROR_CODES.CREW_SKILL_MISMATCH, ERROR_MESSAGES.CREW_SKILL_MISMATCH, 409);
    }

    if (crew.current_ticket_id > 0) {
      const occupant = repairTicketRepository.findById(crew.current_ticket_id);
      const conflictRank = occupant ? priorityRank(occupant.priority) : 0;
      // 班组刚被更紧急任务占用：本次派工退回待派，并标出冲突工单和占用原因。
      if (conflictRank > priorityRank(ticket.priority)) {
        const reason = `${crew.name} 已被工单#${occupant?.id}（${occupant?.priority}）占用：${crew.occupied_reason ?? occupant?.address_desc ?? ""}`;
        repairTicketRepository.update(ticket.id, { conflict_ticket_id: occupant?.id ?? null, conflict_reason: reason });
        ticketLog(LOG_TEMPLATES.RepairTicket[6], ticket.id, `派工退回待派：${reason}`);
        throw new ServiceError(ERROR_CODES.DISPATCH_CONFLICT, ERROR_MESSAGES.DISPATCH_CONFLICT, 409, {
          conflict_ticket_id: occupant?.id ?? null,
          conflict_ticket_priority: occupant?.priority ?? null,
          conflict_ticket_address: occupant?.address_desc ?? null,
          occupied_reason: crew.occupied_reason ?? occupant?.address_desc ?? null,
          crew_id: crew.id,
          crew_name: crew.name,
          ticket: repairTicketRepository.findById(ticket.id)
        });
      }
      throw new ServiceError(ERROR_CODES.CREW_OCCUPIED, ERROR_MESSAGES.CREW_OCCUPIED, 409, {
        occupied_ticket_id: occupant?.id ?? null,
        occupied_priority: occupant?.priority ?? null,
        occupied_reason: crew.occupied_reason ?? occupant?.address_desc ?? null
      });
    }

    const now = new Date().toISOString();
    const updated = repairTicketRepository.update(ticket.id, {
      status: "ASSIGNED",
      team_id: crew.id,
      dispatcher_id: dispatcherId,
      assigned_at: now,
      conflict_ticket_id: null,
      conflict_reason: null
    }) as RepairTicket;
    crewRepository.update(crew.id, { current_ticket_id: ticket.id, occupied_reason: ticket.address_desc });
    ticketLog(LOG_TEMPLATES.RepairTicket[5], ticket.id, `派工给${crew.name}，状态 ASSIGNED`);
    crewLog(LOG_TEMPLATES.Crew[4], crew.id, `承接工单#${ticket.id}`);
    return createRepairTicketResponse(updated);
  },

  // 到场：主单 ARRIVED，合并报修一起进入处理中（PROCESSING）。
  arrive: (ticketId: number) => {
    const ticket = requireTicket(ticketId);
    if (ticket.status !== "ASSIGNED") {
      throw new ServiceError(ERROR_CODES.TICKET_STATUS_INVALID, ERROR_MESSAGES.TICKET_STATUS_INVALID, 409);
    }
    const updated = repairTicketRepository.update(ticket.id, { status: "ARRIVED", arrived_at: new Date().toISOString() }) as RepairTicket;
    moveMergedReports(updated, "PROCESSING");
    ticketLog(LOG_TEMPLATES.RepairTicket[7], ticket.id, `班组到场，${updated.merged_report_ids.length} 笔合并报修进入处理中`);
    faultReportRepository
      .findByTicket(ticket.id)
      .forEach((report) =>
        auditLogRepository.save({ actor: "crew", action: renderLog(LOG_TEMPLATES.FaultReport[5], `报修#${report.id} 随工单#${ticket.id} 进入处理中`), target_type: "FaultReport", target_id: toAuditTarget("FaultReport", report.id) })
      );
    return createRepairTicketResponse(updated);
  },

  startRepair: (ticketId: number) => {
    const ticket = requireTicket(ticketId);
    if (ticket.status !== "ARRIVED") {
      throw new ServiceError(ERROR_CODES.TICKET_STATUS_INVALID, ERROR_MESSAGES.TICKET_STATUS_INVALID, 409);
    }
    const updated = repairTicketRepository.update(ticket.id, { status: "REPAIRING" }) as RepairTicket;
    ticketLog(LOG_TEMPLATES.RepairTicket[2], ticket.id, "开始抢修，状态 REPAIRING");
    return createRepairTicketResponse(updated);
  },

  // 复电：统一登记复电时间与结果，合并报修一并复电，班组释放。
  restore: (ticketId: number, payload: RestoreTicketPayload) => {
    const ticket = requireTicket(ticketId);
    if (ticket.status !== "REPAIRING" && ticket.status !== "ARRIVED") {
      throw new ServiceError(ERROR_CODES.TICKET_STATUS_INVALID, ERROR_MESSAGES.TICKET_STATUS_INVALID, 409);
    }
    if (!payload.restore_result) {
      throw new ServiceError(ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }
    const restoredAt = payload.restored_at || new Date().toISOString();
    const updated = repairTicketRepository.update(ticket.id, {
      status: "RESTORED",
      restored_at: restoredAt,
      restore_result: payload.restore_result
    }) as RepairTicket;
    moveMergedReports(updated, "RESTORED");
    if (ticket.team_id > 0) {
      crewRepository.update(ticket.team_id, { current_ticket_id: 0, occupied_reason: null });
      crewLog(LOG_TEMPLATES.Crew[5], ticket.team_id, `工单#${ticket.id} 复电，班组释放`);
    }
    ticketLog(LOG_TEMPLATES.RepairTicket[8], ticket.id, `复电时间 ${restoredAt}，结果：${payload.restore_result}`);
    faultReportRepository
      .findByTicket(ticket.id)
      .forEach((report) =>
        auditLogRepository.save({ actor: "crew", action: renderLog(LOG_TEMPLATES.FaultReport[6], `报修#${report.id} 随工单#${ticket.id} 复电`), target_type: "FaultReport", target_id: toAuditTarget("FaultReport", report.id) })
      );
    return createRepairTicketResponse(updated);
  },

  close: (ticketId: number) => {
    const ticket = requireTicket(ticketId);
    if (ticket.status !== "RESTORED") {
      throw new ServiceError(ERROR_CODES.TICKET_STATUS_INVALID, ERROR_MESSAGES.TICKET_STATUS_INVALID, 409);
    }
    const updated = repairTicketRepository.update(ticket.id, { status: "CLOSED" }) as RepairTicket;
    ticketLog(LOG_TEMPLATES.RepairTicket[2], ticket.id, "工单归档 CLOSED");
    return createRepairTicketResponse(updated);
  }
};
