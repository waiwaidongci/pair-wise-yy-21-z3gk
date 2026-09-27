// 工单优先级：派工冲突时按该顺序比较，被更紧急工单占用即触发退回待派。
export const TicketPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type TicketPriority = (typeof TicketPriority)[number];

export const PRIORITY_RANK: Record<TicketPriority, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };

export const priorityRank = (priority: string): number => PRIORITY_RANK[priority as TicketPriority] ?? 0;
