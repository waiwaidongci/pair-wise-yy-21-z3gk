// 派工候选班组：由 /api/repair-ticket/:id/candidates 返回。
export interface DispatchCandidate {
  crew_id: number;
  name: string;
  contact_phone: string;
  skills: string;
  on_duty: boolean;
  skill_match: boolean;
  occupied: boolean;
  eligible: boolean;
  occupied_ticket_id: number | null;
  occupied_priority: string | null;
  occupied_reason: string | null;
}

// 派工冲突详情：DISPATCH_CONFLICT 响应的 details 字段。
export interface DispatchConflict {
  conflict_ticket_id: number | null;
  conflict_ticket_priority: string | null;
  conflict_ticket_address: string | null;
  occupied_reason: string | null;
  crew_id: number;
  crew_name: string;
}
