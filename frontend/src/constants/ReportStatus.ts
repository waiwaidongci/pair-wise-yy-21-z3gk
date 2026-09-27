// 故障报修状态：与后端 constants/ReportStatus 保持一致。
export const ReportStatus = ["NEW", "MERGED", "PROCESSING", "RESTORED"] as const;
export type ReportStatus = (typeof ReportStatus)[number];
export const ReportStatusText: Record<ReportStatus, string> = { NEW: "新报修", MERGED: "已并入工单", PROCESSING: "处理中", RESTORED: "已复电" };
