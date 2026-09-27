// 班组值班状态：与后端 constants/CrewDutyStatus 保持一致。
export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
export const CrewDutyStatusText: Record<CrewDutyStatus, string> = { ON_DUTY: "当班", OFF_DUTY: "休息" };
