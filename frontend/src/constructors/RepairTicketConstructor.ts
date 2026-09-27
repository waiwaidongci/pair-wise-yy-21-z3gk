import type { RepairTicket } from "../types/RepairTicket";
import type { CallRegisterPayload, RestorePayload } from "../types/dispatch";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: null,
  dispatcher_id: 1,
  priority: "P3",
  status: "WAIT_DISPATCH",
  feeder_line: "",
  fault_type: "OUTAGE",
  address_desc: "",
  merged_report_ids: [],
  created_at: new Date(0).toISOString(),
  assigned_at: null,
  arrived_at: null,
  restored_at: null,
  closed_at: null,
  restore_result: null,
  conflict_team_id: null,
  conflict_ticket_id: null,
  conflict_reason: null,
  events: [],
  ...overrides
});

// 来电登记表单默认对象
export const createCallRegisterForm = (overrides: Partial<CallRegisterPayload> = {}): CallRegisterPayload => ({
  phone: "",
  reporter_name: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "HIGH",
  report_channel: "PHONE",
  ...overrides
});

// 复电登记表单默认对象
export const createRestoreForm = (overrides: Partial<RestorePayload> = {}): RestorePayload => ({
  restore_result: "",
  ...overrides
});

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
