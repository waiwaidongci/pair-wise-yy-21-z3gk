export const createCrewDto = (overrides = {}) => ({
  id: 1,
  name: "",
  leader_id: 1,
  skill_tags: [] as string[],
  duty_status: "ON_DUTY",
  current_ticket_id: null as number | null,
  contact_phone: "",
  ...overrides
});
