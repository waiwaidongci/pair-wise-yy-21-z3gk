export const Priority = ["P1", "P2", "P3", "P4"] as const;
export type Priority = (typeof Priority)[number];

export const PriorityText: Record<Priority, string> = { P1: "紧急", P2: "高", P3: "中", P4: "低" };
export const PriorityRank: Record<Priority, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

export const SeverityText: Record<string, string> = { CRITICAL: "特急", HIGH: "高", MEDIUM: "中", LOW: "低" };
export const SeverityPriorityMap: Record<string, Priority> = { CRITICAL: "P1", HIGH: "P2", MEDIUM: "P3", LOW: "P4" };

export const isMoreUrgent = (left: string, right: string): boolean =>
  (PriorityRank[left as Priority] ?? 99) < (PriorityRank[right as Priority] ?? 99);
