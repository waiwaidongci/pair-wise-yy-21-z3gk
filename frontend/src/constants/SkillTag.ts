import type { FaultType } from "./FaultType";

export const SkillTag = ["LINE_REPAIR", "SWITCH_OPERATION", "EQUIPMENT_REPAIR", "EMERGENCY_RESCUE"] as const;
export type SkillTag = (typeof SkillTag)[number];

export const SkillTagText: Record<SkillTag, string> = {
  LINE_REPAIR: "线路抢修",
  SWITCH_OPERATION: "倒闸操作",
  EQUIPMENT_REPAIR: "设备维修",
  EMERGENCY_RESCUE: "应急救援"
};

export const FaultTypeSkillMap: Record<FaultType, SkillTag> = {
  OUTAGE: "LINE_REPAIR",
  VOLTAGE_LOW: "LINE_REPAIR",
  TRIP: "SWITCH_OPERATION",
  EQUIPMENT_DAMAGE: "EQUIPMENT_REPAIR",
  SAFETY_RISK: "EMERGENCY_RESCUE"
};

export const requiredSkillOf = (faultType: string): SkillTag => FaultTypeSkillMap[faultType as FaultType] ?? "LINE_REPAIR";
