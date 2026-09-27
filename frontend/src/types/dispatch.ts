import type { RepairTicket } from "./RepairTicket";
import type { FaultReport } from "./FaultReport";
import type { Crew } from "./Crew";

export interface RepairTicketView extends RepairTicket {
  primary_report: FaultReport;
  merged_reports: FaultReport[];
  phones: string[];
  report_count: number;
  team: Crew | null;
}

export interface CrewCandidate {
  crew: Crew;
  eligible: boolean;
  busy: boolean;
  occupied_by_ticket: RepairTicket | null;
  reject_reason: string | null;
}

export interface CallRegisterPayload {
  phone: string;
  reporter_name: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
}

export interface CallRegisterResult {
  merged: boolean;
  ticket_id: number;
  ticket: RepairTicketView;
}

export interface RestorePayload {
  restore_result: string;
}
