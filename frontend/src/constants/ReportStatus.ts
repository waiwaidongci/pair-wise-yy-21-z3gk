export const ReportStatus = ["PENDING", "MERGED", "ASSIGNED", "REPAIRING", "RESTORED", "CLOSED"] as const;
export type ReportStatus = (typeof ReportStatus)[number];
export const ReportStatusText: Record<ReportStatus, string> = {
  PENDING: "待处理",
  MERGED: "已合并",
  ASSIGNED: "已派工",
  REPAIRING: "处理中",
  RESTORED: "已复电",
  CLOSED: "已归档"
};

export const ReportChannelText: Record<string, string> = {
  PHONE: "电话",
  WECHAT: "微信",
  WALK_IN: "上门",
  SYSTEM: "系统"
};
