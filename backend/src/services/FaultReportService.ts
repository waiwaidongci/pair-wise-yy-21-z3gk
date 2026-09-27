import { faultReportRepository } from "../repositories/FaultReportRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { gridAssetRepository } from "../repositories/GridAssetRepository";
import { auditLogRepository } from "../repositories/AuditLogRepository";
import { createFaultReportDto } from "../constructors/FaultReportDtoFactory";
import { createRepairTicketDto } from "../constructors/RepairTicketDtoFactory";
import { LOG_TEMPLATES, renderLog } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ServiceError } from "../utils/ServiceError";
import { toAuditTarget } from "../utils/formatters";
import type { CreateFaultReportPayload } from "../types/FaultReportPayload";
import type { FaultReport } from "../models/FaultReport";
import type { RepairTicket } from "../models/RepairTicket";

// 同线路、同故障类型、半小时内的重复报修并入最早一张待派工单。
const MERGE_WINDOW_MS = 30 * 60 * 1000;

// 报修严重度映射为工单优先级。
const SEVERITY_TO_PRIORITY: Record<string, string> = { LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH", URGENT: "URGENT" };

const reportLog = (action: string, detail: string) =>
  auditLogRepository.save({ actor: "dispatcher", action: renderLog(action, detail), target_type: "FaultReport", target_id: detail });

const findMergeTarget = (faultType: string, feederLine: string, reportedAt: number): RepairTicket | undefined => {
  return repairTicketRepository
    .findAll()
    .filter((ticket) => ticket.status === "WAIT_DISPATCH" && ticket.fault_type === faultType && ticket.feeder_line === feederLine)
    .filter((ticket) => {
      // 以主单上最早一条报修的时间为窗口起点。
      const firstReport = faultReportRepository.findById(ticket.fault_report_id);
      const windowStart = firstReport ? new Date(firstReport.reported_at).getTime() : reportedAt;
      return reportedAt - windowStart <= MERGE_WINDOW_MS;
    })
    .sort((a, b) => a.id - b.id)[0];
};

export const faultReportService = {
  list: () => faultReportRepository.findAll(),

  // 值班员登记来电：命中合并窗口则并入最早待派工单并集中保留来电号码，否则生成新工单。
  register: (payload: CreateFaultReportPayload) => {
    if (!payload.reporter_name || !payload.phone || !payload.asset_id || !payload.fault_type) {
      throw new ServiceError(ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED, 400);
    }
    const asset = gridAssetRepository.findById(Number(payload.asset_id));
    if (!asset) {
      throw new ServiceError(ERROR_CODES.ASSET_NOT_FOUND, ERROR_MESSAGES.ASSET_NOT_FOUND, 404);
    }
    const reportedAt = Date.now();
    const report: FaultReport = faultReportRepository.save(
      createFaultReportDto({
        id: faultReportRepository.nextId(),
        reporter_name: payload.reporter_name,
        phone: payload.phone,
        asset_id: asset.id,
        fault_type: payload.fault_type,
        address_desc: payload.address_desc || asset.location_desc,
        severity: payload.severity || "MEDIUM",
        report_channel: payload.report_channel || "95598热线",
        reported_at: new Date(reportedAt).toISOString()
      })
    );
    reportLog(LOG_TEMPLATES.FaultReport[0], `报修#${report.id} ${report.reporter_name} ${report.phone}`);

    const target = findMergeTarget(report.fault_type, asset.feeder_line, reportedAt);
    if (target) {
      const phones = new Set(target.caller_phones);
      phones.add(report.phone);
      const mergedIds = [...target.merged_report_ids, report.id];
      repairTicketRepository.update(target.id, { caller_phones: [...phones], merged_report_ids: mergedIds });
      faultReportRepository.update(report.id, { status: "MERGED", merged_ticket_id: target.id });
      reportLog(LOG_TEMPLATES.FaultReport[4], `报修#${report.id} 并入工单#${target.id}，来电号码集中保留`);
      auditLogRepository.save({
        actor: "dispatcher",
        action: renderLog(LOG_TEMPLATES.RepairTicket[4], `工单#${target.id} 合并报修#${report.id}`),
        target_type: "RepairTicket",
        target_id: toAuditTarget("RepairTicket", target.id)
      });
      return { merged: true, report, ticket: repairTicketRepository.findById(target.id) };
    }

    const ticket: RepairTicket = repairTicketRepository.save(
      createRepairTicketDto({
        id: repairTicketRepository.nextId(),
        fault_report_id: report.id,
        priority: SEVERITY_TO_PRIORITY[report.severity] ?? "MEDIUM",
        fault_type: report.fault_type,
        feeder_line: asset.feeder_line,
        address_desc: report.address_desc,
        caller_phones: [report.phone],
        merged_report_ids: [report.id]
      })
    );
    faultReportRepository.update(report.id, { status: "MERGED", merged_ticket_id: ticket.id });
    auditLogRepository.save({
      actor: "dispatcher",
      action: renderLog(LOG_TEMPLATES.RepairTicket[0], `工单#${ticket.id} 由报修#${report.id} 生成，待派工`),
      target_type: "RepairTicket",
      target_id: toAuditTarget("RepairTicket", ticket.id)
    });
    return { merged: false, report, ticket };
  }
};
