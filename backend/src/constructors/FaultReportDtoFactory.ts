export const createFaultReportDto = (overrides = {}) => ({
  id: 1,
  reporter_name: "",
  phone: "",
  asset_id: 1,
  fault_type: "OUTAGE",
  address_desc: "",
  severity: "MEDIUM",
  report_channel: "PHONE",
  status: "PENDING",
  ticket_id: null as number | null,
  merged_into_ticket_id: null as number | null,
  reported_at: new Date(0).toISOString(),
  ...overrides
});
