import type { FaultReport } from "../types/FaultReport";

export const createDefaultFaultReport = (overrides: Partial<FaultReport> = {}): FaultReport => ({
  id: 0,
  reporter_name: "",
  phone: "",
  asset_id: 0,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "PHONE",
  status: "PENDING",
  ticket_id: null,
  merged_into_ticket_id: null,
  reported_at: new Date(0).toISOString(),
  ...overrides
});

export const createFaultReportForm = createDefaultFaultReport;
export const createFaultReportResponse = createDefaultFaultReport;
