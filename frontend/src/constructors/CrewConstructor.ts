import type { Crew } from "../types/Crew";

export const createDefaultCrew = (overrides: Partial<Crew> = {}): Crew => ({
  id: 0,
  name: "",
  leader_id: 0,
  skill_tags: "",
  duty_status: "ON_DUTY",
  current_ticket_id: 0,
  contact_phone: "",
  occupied_reason: null,
  ...overrides
});

export const createCrewForm = createDefaultCrew;
export const createCrewResponse = createDefaultCrew;
