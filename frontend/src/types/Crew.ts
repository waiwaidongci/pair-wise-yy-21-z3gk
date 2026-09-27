export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  skill_tags: string;
  duty_status: string;
  current_ticket_id: number;
  contact_phone: string;
  occupied_reason: string | null;
  skills?: string[];
  occupied?: boolean;
  occupied_ticket_priority?: string | null;
  occupied_ticket_status?: string | null;
}
