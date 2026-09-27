// 班组值班状态：只有 ON_DUTY 班组可被派工选择。
export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
