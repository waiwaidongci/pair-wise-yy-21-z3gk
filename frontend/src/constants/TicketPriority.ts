// 工单优先级：与后端 constants/TicketPriority 保持一致，冲突比较按此顺序。
export const TicketPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type TicketPriority = (typeof TicketPriority)[number];
export const TicketPriorityText: Record<TicketPriority, string> = { LOW: "低", MEDIUM: "中", HIGH: "高", URGENT: "紧急" };
