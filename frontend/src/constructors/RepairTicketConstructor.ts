import type { RepairTicket } from "../types/RepairTicket";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
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

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
