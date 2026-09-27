import { TicketPriorityText } from "../constants/TicketPriority";
import { TicketStatusText } from "../constants/TicketStatus";
import { FaultTypeText } from "../constants/FaultType";

export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => TicketStatusText[value as keyof typeof TicketStatusText] ?? value.replace(/_/g, " ");
export const formatFaultType = (value: string) => FaultTypeText[value as keyof typeof FaultTypeText] ?? value;
export const formatPriority = (value: string) => TicketPriorityText[value as keyof typeof TicketPriorityText] ?? value;
export const formatPhones = (phones: string[]) => phones.join(" / ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
