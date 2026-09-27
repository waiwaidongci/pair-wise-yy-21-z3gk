export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: string;
  assigned_at: string;
  restored_at: string;
  fault_type: string;
  feeder_line: string;
  address_desc: string;
  caller_phones: string[];
  merged_report_ids: number[];
  arrived_at: string | null;
  restore_result: string | null;
  conflict_ticket_id: number | null;
  conflict_reason: string | null;
  merged_count?: number;
}
