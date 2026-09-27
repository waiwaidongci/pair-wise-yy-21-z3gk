import { isMoreUrgent } from "../constants/Priority";
import { requiredSkillOf, type SkillTag } from "../constants/SkillTag";
import type { Crew } from "../models/Crew";
import type { RepairTicket } from "../models/RepairTicket";
import { DomainError } from "../utils/errors";

export interface DispatchCheck {
  crew: Crew;
  requiredSkill: SkillTag;
  conflictTicket: RepairTicket | null;
}

// 派工前置：当班 + 技能匹配 + 当前占用情况
export const checkCrewEligible = (crew: Crew, faultType: string): { eligible: boolean; requiredSkill: SkillTag } => {
  const requiredSkill = requiredSkillOf(faultType);
  if (crew.duty_status !== "ON_DUTY") {
    return { eligible: false, requiredSkill };
  }
  if (!crew.skill_tags.includes(requiredSkill)) {
    return { eligible: false, requiredSkill };
  }
  return { eligible: true, requiredSkill };
};

export const findCrewActiveTicket = (crew: Crew, tickets: RepairTicket[]): RepairTicket | null =>
  tickets.find((ticket) => ticket.id === crew.current_ticket_id && ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)) ?? null;

// 班组刚被更紧急任务占用：本次派工退回待派，调用方需要把冲突工单与占用原因标到工单上
export const assertDispatchable = (
  crew: Crew,
  ticket: RepairTicket,
  activeTicket: RepairTicket | null,
  requiredSkill: SkillTag
): void => {
  if (crew.duty_status !== "ON_DUTY") {
    throw new DomainError("CREW_NOT_ON_DUTY", 400, `班组「${crew.name}」当前不在当班状态`);
  }
  if (!crew.skill_tags.includes(requiredSkill)) {
    throw new DomainError("CREW_SKILL_MISMATCH", 400, `班组「${crew.name}」缺少技能 ${requiredSkill}，无法处理该故障`);
  }
  if (activeTicket && isMoreUrgent(activeTicket.priority, ticket.priority)) {
    const reason = `班组「${crew.name}」正抢修更紧急工单 #${activeTicket.id}（${activeTicket.priority}，${activeTicket.feeder_line}）`;
    throw new DomainError("CREW_CONFLICT", 409, reason, { conflictTicketId: activeTicket.id, conflictReason: reason });
  }
  if (activeTicket) {
    throw new DomainError(
      "CREW_BUSY",
      409,
      `班组「${crew.name}」正执行工单 #${activeTicket.id}（${activeTicket.priority}），紧急度不高于本单，可改派其他班组`
    );
  }
};
