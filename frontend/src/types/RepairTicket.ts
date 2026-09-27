export interface TicketEvent {
  type: "CREATE" | "MERGE" | "DISPATCH" | "DISPATCH_CONFLICT" | "ARRIVE" | "REPAIRING" | "RESTORE" | "CLOSE";
  at: string;
  note: string;
}

export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number;
  priority: string;
  status: string;
  feeder_line: string;
  fault_type: string;
  address_desc: string;
  merged_report_ids: number[];
  created_at: string;
  assigned_at: string | null;
  arrived_at: string | null;
  restored_at: string | null;
  closed_at: string | null;
  restore_result: string | null;
  conflict_team_id: number | null;
  conflict_ticket_id: number | null;
  conflict_reason: string | null;
  events: TicketEvent[];
}
