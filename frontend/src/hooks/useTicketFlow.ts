import { computed, type ComputedRef } from "vue";
import type { RepairTicket } from "../types/RepairTicket";

// 工单流转：根据当前状态给出下一步动作、按钮文案与时间节点，供派工台与时间轴共用。
export interface TicketFlowStep {
  key: string;
  label: string;
  action?: string;
  at?: string | null;
  done: boolean;
  current: boolean;
}

export function useTicketFlow(ticket: ComputedRef<RepairTicket | undefined> | (() => RepairTicket | undefined)) {
  const get = typeof ticket === "function" ? ticket : () => ticket.value;

  const nextAction = computed(() => {
    const row = get();
    if (!row) return null;
    switch (row.status) {
      case "WAIT_DISPATCH":
        return { key: "dispatch", label: "选择班组派工" };
      case "ASSIGNED":
        return { key: "arrive", label: "确认到场" };
      case "ARRIVED":
        return { key: "startRepair", label: "开始处理" };
      case "REPAIRING":
        return { key: "restore", label: "复电登记" };
      case "RESTORED":
        return { key: "close", label: "归档" };
      default:
        return null;
    }
  });

  const steps = computed<TicketFlowStep[]>(() => {
    const row = get();
    if (!row) return [];
    const order = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"];
    const currentIndex = order.indexOf(row.status);
    return [
      { key: "WAIT_DISPATCH", label: "待派工", at: row.assigned_at || null, done: currentIndex > 0, current: row.status === "WAIT_DISPATCH" },
      { key: "ASSIGNED", label: "已派工", at: row.assigned_at || null, done: currentIndex > 1, current: row.status === "ASSIGNED" },
      { key: "ARRIVED", label: "到场", at: row.arrived_at, done: currentIndex > 2, current: row.status === "ARRIVED" },
      { key: "REPAIRING", label: "处理中", at: row.arrived_at, done: currentIndex > 3, current: row.status === "REPAIRING" },
      { key: "RESTORED", label: "复电", at: row.restored_at || null, done: currentIndex > 4, current: row.status === "RESTORED" },
      { key: "CLOSED", label: "归档", at: row.restored_at || null, done: currentIndex > 5, current: row.status === "CLOSED" }
    ];
  });

  return { nextAction, steps };
}
