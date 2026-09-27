export const Priority = ["P1", "P2", "P3", "P4"] as const;
export type Priority = (typeof Priority)[number];

// 数值越小越紧急，派工冲突按该序比较
export const PriorityRank: Record<Priority, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

export const isMoreUrgent = (left: string, right: string): boolean =>
  (PriorityRank[left as Priority] ?? 99) < (PriorityRank[right as Priority] ?? 99);

// 来电登记时按故障分级默认派工优先级
export const SeverityPriorityMap: Record<string, Priority> = {
  CRITICAL: "P1",
  HIGH: "P2",
  MEDIUM: "P3",
  LOW: "P4"
};

export const priorityOfSeverity = (severity: string): Priority => SeverityPriorityMap[severity] ?? "P3";
