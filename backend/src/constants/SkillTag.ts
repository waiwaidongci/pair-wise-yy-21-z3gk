import type { FaultType } from "./FaultType";

// 抢修班组技能标签：派工只从当班且技能匹配的班组中选择
export const SkillTag = ["LINE_REPAIR", "SWITCH_OPERATION", "EQUIPMENT_REPAIR", "EMERGENCY_RESCUE"] as const;
export type SkillTag = (typeof SkillTag)[number];

// 故障类型 -> 必备技能
export const FaultTypeSkillMap: Record<FaultType, SkillTag> = {
  OUTAGE: "LINE_REPAIR",
  VOLTAGE_LOW: "LINE_REPAIR",
  TRIP: "SWITCH_OPERATION",
  EQUIPMENT_DAMAGE: "EQUIPMENT_REPAIR",
  SAFETY_RISK: "EMERGENCY_RESCUE"
};

export const requiredSkillOf = (faultType: string): SkillTag =>
  FaultTypeSkillMap[faultType as FaultType] ?? "LINE_REPAIR";
