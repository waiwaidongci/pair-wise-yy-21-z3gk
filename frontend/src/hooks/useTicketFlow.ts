import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { TicketStatus } from "../constants/TicketStatus";
import { TicketStatusText } from "../constants/TicketStatus";
import type { RepairTicketView } from "../types/dispatch";

export interface TicketColumn {
  status: (typeof TicketStatus)[number];
  label: string;
  rows: RepairTicketView[];
}

// 工单状态流转：待派 -> 已派工 ->（到场）处理中 -> 已复电 -> 已归档
export const canDispatch = (ticket: RepairTicketView): boolean => ticket.status === "WAIT_DISPATCH";
export const canArrive = (ticket: RepairTicketView): boolean => ticket.status === "ASSIGNED";
export const canRestore = (ticket: RepairTicketView): boolean => ticket.status === "REPAIRING";
export const canClose = (ticket: RepairTicketView): boolean => ticket.status === "RESTORED";

export function useTicketFlow(source: MaybeRefOrGetter<RepairTicketView[]>) {
  const rows = computed(() => toValue(source));

  const columns = computed<TicketColumn[]>(() =>
    TicketStatus.map((status) => ({
      status,
      label: TicketStatusText[status],
      rows: rows.value.filter((ticket) => ticket.status === status)
    }))
  );

  const waitingTickets = computed(() => rows.value.filter(canDispatch));
  const activeTickets = computed(() => rows.value.filter((ticket) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(ticket.status)));
  const conflictTickets = computed(() => rows.value.filter((ticket) => ticket.conflict_ticket_id != null && ticket.status === "WAIT_DISPATCH"));

  return { rows, columns, waitingTickets, activeTickets, conflictTickets, canDispatch, canArrive, canRestore, canClose };
}
