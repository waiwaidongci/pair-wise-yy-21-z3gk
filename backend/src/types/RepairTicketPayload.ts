// 抢修工单相关请求体。
export interface DispatchTicketPayload {
  crew_id: number;
}

export interface RestoreTicketPayload {
  restore_result: string;
  restored_at?: string;
}
