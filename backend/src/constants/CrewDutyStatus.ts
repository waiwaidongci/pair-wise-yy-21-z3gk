export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY", "REST"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
