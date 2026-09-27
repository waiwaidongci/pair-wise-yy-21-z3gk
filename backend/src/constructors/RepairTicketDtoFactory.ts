import type { RepairTicket } from "../models/RepairTicket";

// 新工单默认结构：报修登记未命中合并窗口时，由该构造器生成待派工单。
export const createRepairTicketDto = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: 0,
  dispatcher_id: 0,
  priority: "MEDIUM",
  status: "WAIT_DISPATCH",
  assigned_at: "",
  restored_at: "",
  fault_type: "OUTAGE",
  feeder_line: "",
  address_desc: "",
  caller_phones: [],
  merged_report_ids: [],
  arrived_at: null,
  restore_result: null,
  conflict_ticket_id: null,
  conflict_reason: null,
  ...overrides
});

// 列表/详情响应：附带合并报修数量等派工台展示字段。
export const createRepairTicketResponse = (ticket: RepairTicket, extras: Record<string, unknown> = {}) => ({
  ...ticket,
  merged_count: ticket.merged_report_ids.length,
  ...extras
});
