// 故障报修单状态：合并后随主单一起派工、一起进入处理中、一起复电
export const ReportStatus = ["PENDING", "MERGED", "ASSIGNED", "REPAIRING", "RESTORED", "CLOSED"] as const;
export type ReportStatus = (typeof ReportStatus)[number];
