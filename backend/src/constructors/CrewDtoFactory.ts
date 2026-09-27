import type { Crew } from "../models/Crew";

export const createCrewDto = (overrides: Partial<Crew> = {}): Crew => ({
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

// 派工台班组卡片响应：补充技能数组与占用状态，便于前端直接渲染。
export const createCrewResponse = (crew: Crew, extras: Record<string, unknown> = {}) => ({
  ...crew,
  skills: crew.skill_tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  occupied: crew.current_ticket_id > 0,
  ...extras
});
