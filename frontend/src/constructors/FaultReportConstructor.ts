import type { FaultReport } from "../types/FaultReport";

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "95598热线",
  status: "NEW",
  reported_at: "",
  merged_ticket_id: null,
  ...overrides
});

// 值班员登记来电的表单默认值。
export const createFaultReportForm = (overrides: Partial<FaultReport> = {}): FaultReport =>
  createDefaultFaultReport({ reported_at: new Date().toISOString(), ...overrides });
export const createFaultReportResponse = createDefaultFaultReport;
