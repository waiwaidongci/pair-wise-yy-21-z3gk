import { crewRepository } from "../repositories/CrewRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { createCrewResponse } from "../constructors/CrewDtoFactory";
import { createRepairTicketDto } from "../constructors/RepairTicketDtoFactory";
import { createFaultReportDto } from "../constructors/FaultReportDtoFactory";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ServiceError } from "../utils/ServiceError";
import { toAuditTarget } from "../utils/formatters";
import type { Crew } from "../models/Crew";
import type { UrgentOccupyPayload } from "../types/CrewPayload";

export const crewService = {
  list: () => {
    return crewRepository.findAll().map((crew) => {
      const occupant = crew.current_ticket_id ? repairTicketRepository.findById(crew.current_ticket_id) : undefined;
      return createCrewResponse(crew, {
        occupied_ticket_priority: occupant?.priority ?? null,
        occupied_ticket_status: occupant?.status ?? null
      });
    });
  },

  // 班组刚被更紧急任务占用：自动登记一笔紧急来电并生成 ASSIGNED 工单挂到该班组，
  // 随后对该班组的普通派工会命中 DISPATCH_CONFLICT 而退回待派。
  urgentOccupy: (crewId: number, payload: UrgentOccupyPayload) => {
    const crew = crewRepository.findById(crewId);
    if (!crew) {
      throw new ServiceError(ERROR_CODES.CREW_NOT_FOUND, ERROR_MESSAGES.CREW_NOT_FOUND, 404);
    }
    if (crew.duty_status !== "ON_DUTY") {
      throw new ServiceError(ERROR_CODES.CREW_NOT_ON_DUTY, ERROR_MESSAGES.CREW_NOT_ON_DUTY, 409);
    }
    if (crew.current_ticket_id > 0) {
      throw new ServiceError(ERROR_CODES.CREW_OCCUPIED, ERROR_MESSAGES.CREW_OCCUPIED, 409, {
        occupied_ticket_id: crew.current_ticket_id
      });
    }
    const priority = payload.priority ?? "URGENT";
    const faultType = payload.fault_type || "OUTAGE";
    const now = new Date().toISOString();

    const report = faultReportRepository.save(
      createFaultReportDto({
        id: faultReportRepository.nextId(),
        reporter_name: "紧急来电",
        phone: "110",
        asset_id: 0,
        fault_type: faultType,
        address_desc: payload.address_desc,
        severity: priority,
        report_channel: "110联动",
        status: "MERGED",
        reported_at: now
      })
    );
    const ticket = repairTicketRepository.save(
      createRepairTicketDto({
        id: repairTicketRepository.nextId(),
        fault_report_id: report.id,
        team_id: crew.id,
        dispatcher_id: 1,
        priority,
        status: "ASSIGNED",
        assigned_at: now,
        fault_type: faultType,
        feeder_line: "紧急任务",
        address_desc: payload.address_desc,
        caller_phones: ["110"],
        merged_report_ids: [report.id]
      })
    );
    faultReportRepository.update(report.id, { merged_ticket_id: ticket.id });
    crewRepository.update(crew.id, { current_ticket_id: ticket.id, occupied_reason: payload.address_desc });

    auditLogRepository.save({
      actor: "dispatcher",
      action: renderLog(LOG_TEMPLATES.Crew[6], `${crew.name} 被紧急工单#${ticket.id} 占用：${payload.address_desc}`),
      target_type: "Crew",
      target_id: toAuditTarget("Crew", crew.id)
    });
    return { crew: createCrewResponse(crewRepository.findById(crew.id) as Crew), ticket };
  }
};
