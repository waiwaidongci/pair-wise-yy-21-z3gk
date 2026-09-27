// 与后端 constants/TicketPriority 的 PRIORITY_RANK 对齐，冲突比较共用。
const RANKS: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
export const priorityRank = (priority: string): number => RANKS[priority] ?? 0;
