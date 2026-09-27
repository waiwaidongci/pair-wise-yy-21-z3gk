import { isWithinMergeWindow } from "../utils/formatters";
import type { FaultReport } from "../models/FaultReport";
import type { GridAsset } from "../models/GridAsset";
import type { RepairTicket } from "../models/RepairTicket";

export interface CallMergeInput {
  asset: GridAsset;
  fault_type: string;
  reported_at: string;
}

export interface CallMergeTarget {
  ticket: RepairTicket;
  reason: string;
}

const PENDING_TICKET_STATUS = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING"];

// 同线路、同故障类型、30 分钟内已建待处理单 -> 并入最早一张
export const findMergeTarget = (
  input: CallMergeInput,
  tickets: RepairTicket[],
  reports: FaultReport[]
): CallMergeTarget | null => {
  const candidates = tickets
    .filter((ticket) => PENDING_TICKET_STATUS.includes(ticket.status))
    .filter((ticket) => ticket.feeder_line === input.asset.feeder_line)
    .filter((ticket) => ticket.fault_type === input.fault_type)
    .filter((ticket) => isWithinMergeWindow(ticket.created_at, input.reported_at))
    .filter((ticket) => {
      const memberIds = [ticket.fault_report_id, ...ticket.merged_report_ids];
      return reports.some((report) => memberIds.includes(report.id));
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const ticket = candidates[0];
  if (!ticket) return null;
  return { ticket, reason: `同线路（${ticket.feeder_line}）同故障 30 分钟内已有待处理工单 #${ticket.id}` };
};
