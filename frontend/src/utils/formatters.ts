import { TicketStatusText } from "../constants/TicketStatus";
import { FaultTypeText } from "../constants/FaultType";
import { PriorityText, SeverityText } from "../constants/Priority";
import { SkillTagText } from "../constants/SkillTag";
import { CrewDutyStatusText } from "../constants/CrewDutyStatus";
import { ReportStatusText, ReportChannelText } from "../constants/ReportStatus";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";

export const MERGE_WINDOW_MINUTES = 30;

export const isoNow = (): string => new Date().toISOString();

export const isWithinMergeWindow = (createdAt: string, now: string | Date = new Date()): boolean =>
  new Date(createdAt).getTime() + MERGE_WINDOW_MINUTES * 60_000 >= new Date(now).getTime();

export const dedupePhones = (phones: (string | null | undefined)[]): string[] =>
  [...new Set(phones.filter((p): p is string => Boolean(p)))];

export const formatDate = (value: string | null | undefined): string =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";

export const formatTime = formatDate;

export const formatStatus = (value: string): string =>
  TicketStatusText[value as keyof typeof TicketStatusText] ?? value.replace(/_/g, " ");

export const formatFaultType = (value: string): string =>
  FaultTypeText[value as keyof typeof FaultTypeText] ?? value;

export const formatPriority = (value: string): string =>
  PriorityText[value as keyof typeof PriorityText] ?? value;

export const formatSeverity = (value: string): string =>
  SeverityText[value] ?? ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "特急" }[value] ?? value);

// 兼容旧调用名 formatRisk
export const formatRisk = formatSeverity;

export const formatSkillTag = (value: string): string =>
  SkillTagText[value as keyof typeof SkillTagText] ?? value;

export const formatDutyStatus = (value: string): string =>
  CrewDutyStatusText[value as keyof typeof CrewDutyStatusText] ?? value;

export const formatReportStatus = (value: string): string =>
  ReportStatusText[value as keyof typeof ReportStatusText] ?? value;

export const formatChannel = (value: string): string =>
  ReportChannelText[value] ?? value;

export const formatHealthStatus = (value: string): string =>
  AssetHealthStatusText[value as keyof typeof AssetHealthStatusText] ?? value;

export const formatNumber = (value: number): string => new Intl.NumberFormat("zh-CN").format(value);

// 距今多久（用于合并窗口提示）
export const formatAgo = (value: string): string => {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
};
