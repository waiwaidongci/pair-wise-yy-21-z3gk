// 故障报修单在“独立报修 → 并入主单 → 随单到场处理 → 复电”过程中的状态。
export const ReportStatus = ["NEW", "MERGED", "PROCESSING", "RESTORED"] as const;
export type ReportStatus = (typeof ReportStatus)[number];
