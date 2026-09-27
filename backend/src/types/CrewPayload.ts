export interface CrewPayload {
  name?: string;
  leader_id?: number;
  skill_tags?: string[];
  duty_status?: string;
  current_ticket_id?: number | null;
  contact_phone?: string;
}
