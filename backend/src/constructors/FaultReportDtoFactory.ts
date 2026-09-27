import type { FaultReport } from "../models/FaultReport";

// 报修单默认结构：新来电初始为 NEW，未并入任何工单。
export const createFaultReportDto = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "95598热线",
  status: "NEW",
  reported_at: new Date().toISOString(),
  merged_ticket_id: null,
  ...overrides
});

export const createFaultReportResponse = (report: FaultReport, extras: Record<string, unknown> = {}) => ({
  ...report,
  ...extras
});
