export const CrewDutyStatus = ["ON_DUTY", "OFF_DUTY", "REST"] as const;
export type CrewDutyStatus = (typeof CrewDutyStatus)[number];
export const CrewDutyStatusText: Record<CrewDutyStatus, string> = {
  ON_DUTY: "当班",
  OFF_DUTY: "休班",
  REST: "休整"
};
