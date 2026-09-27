export const ReportChannel = ["PHONE", "WECHAT", "WALK_IN", "SYSTEM"] as const;
export type ReportChannel = (typeof ReportChannel)[number];
