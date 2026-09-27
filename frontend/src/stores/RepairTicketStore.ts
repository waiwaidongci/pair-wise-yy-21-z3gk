import { defineStore } from "pinia";
import {
  listRepairTicket,
  registerCall,
  listCandidates,
  dispatchTicket,
  arriveTicket,
  restoreTicket,
  closeTicket
} from "../api/RepairTicket";
import type { RepairTicketView, CrewCandidate, CallRegisterPayload, RestorePayload } from "../types/dispatch";

interface Toast {
  type: "success" | "error" | "info";
  message: string;
  conflictTicketId?: number | null;
  conflictReason?: string | null;
}

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as RepairTicketView[],
    loading: false,
    candidates: [] as CrewCandidate[],
    candidatesFor: 0,
    lastToast: null as Toast | null
  }),
  getters: {
    byStatus(state) {
      return (status: string): RepairTicketView[] => state.rows.filter((row) => row.status === status);
    },
    waitingCount(state): number {
      return state.rows.filter((row) => row.status === "WAIT_DISPATCH").length;
    },
    activeCount(state): number {
      return state.rows.filter((row) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status)).length;
    },
    mergedReportCount(state): number {
      return state.rows.reduce((sum, row) => sum + row.merged_reports.length, 0);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },
    toast(toast: Toast) {
      this.lastToast = toast;
    },
    clearToast() {
      this.lastToast = null;
    },
    async registerCall(payload: CallRegisterPayload) {
      const result = await registerCall(payload);
      await this.load();
      this.toast({
        type: "success",
        message: result.merged
          ? `来电已并入最早待处理工单 #${result.ticket_id}，号码集中保留`
          : `已为该来电新建待派工单 #${result.ticket_id}`
      });
      return result;
    },
    async loadCandidates(ticketId: number) {
      this.candidatesFor = ticketId;
      this.candidates = await listCandidates(ticketId);
      return this.candidates;
    },
    async dispatch(ticketId: number, teamId: number) {
      try {
        const view = await dispatchTicket(ticketId, teamId);
        await this.load();
        await this.loadCandidates(ticketId);
        this.toast({ type: "success", message: `工单 #${ticketId} 已派工给「${view.team?.name ?? teamId}」` });
        return view;
      } catch (err) {
        await this.load();
        const e = err as { code?: string; message?: string; conflictTicketId?: number; conflictReason?: string };
        if (e.code === "CREW_CONFLICT") {
          this.toast({
            type: "error",
            message: `派工退回待派：${e.message ?? "班组被更紧急任务占用"}`,
            conflictTicketId: e.conflictTicketId ?? null,
            conflictReason: e.conflictReason ?? e.message ?? null
          });
        } else {
          this.toast({ type: "error", message: e.message ?? "派工失败" });
        }
        throw err;
      }
    },
    async arrive(ticketId: number) {
      const view = await arriveTicket(ticketId);
      await this.load();
      this.toast({ type: "success", message: `工单 #${ticketId} 班组到场，合并报修 ${view.report_count} 起已一起进入处理中` });
      return view;
    },
    async restore(ticketId: number, payload: RestorePayload) {
      const view = await restoreTicket(ticketId, payload);
      await this.load();
      this.toast({ type: "success", message: `工单 #${ticketId} 已统一登记复电时间与处理结果` });
      return view;
    },
    async close(ticketId: number) {
      await closeTicket(ticketId);
      await this.load();
      this.toast({ type: "success", message: `工单 #${ticketId} 已归档` });
    }
  }
});
