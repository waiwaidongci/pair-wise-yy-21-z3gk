export interface FaultReport {
  id: number;
  reporter_name: string;
  phone: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  status: string;
  ticket_id: number | null;
  merged_into_ticket_id: number | null;
  reported_at: string;
  is_primary?: boolean;
}
