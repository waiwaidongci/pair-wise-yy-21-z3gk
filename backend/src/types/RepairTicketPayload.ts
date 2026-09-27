export interface CallRegisterPayload {
  phone: string;
  reporter_name: string;
  asset_id: number;
  fault_type: string;
  address_desc: string;
  severity: string;
  report_channel: string;
  reported_at?: string;
}

export interface DispatchPayload {
  team_id: number;
  dispatcher_id?: number;
}

export interface ArrivePayload {
  note?: string;
}

export interface RestorePayload {
  restore_result: string;
  restored_at?: string;
}

export type RepairTicketPayload =
  | Record<string, unknown>
  | CallRegisterPayload
  | DispatchPayload
  | ArrivePayload
  | RestorePayload;
