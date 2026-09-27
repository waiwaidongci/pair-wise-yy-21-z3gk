import { defineStore } from "pinia";
import {
  listRepairTicket,
  listDispatchCandidates,
  dispatchRepairTicket,
  arriveRepairTicket,
  startRepairTicket,
  restoreRepairTicket,
  closeRepairTicket
} from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";
import type { DispatchCandidate } from "../types/DispatchCandidate";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as RepairTicket[],
    candidates: {} as Record<number, DispatchCandidate[]>,
    loading: false
  }),
  getters: {
    byStatus: (state) => (status: string) => state.rows.filter((row) => row.status === status),
    waitDispatch: (state) => state.rows.filter((row) => row.status === "WAIT_DISPATCH"),
    inProgress: (state) => state.rows.filter((row) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.status)),
    restored: (state) => state.rows.filter((row) => row.status === "RESTORED")
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
    async loadCandidates(ticketId: number) {
      this.candidates[ticketId] = await listDispatchCandidates(ticketId);
    },
    async dispatch(ticketId: number, crewId: number) {
      await dispatchRepairTicket(ticketId, crewId);
      await this.load();
    },
    async arrive(ticketId: number) {
      await arriveRepairTicket(ticketId);
      await this.load();
    },
    async startRepair(ticketId: number) {
      await startRepairTicket(ticketId);
      await this.load();
    },
    async restore(ticketId: number, payload: { restore_result: string; restored_at?: string }) {
      await restoreRepairTicket(ticketId, payload);
      await this.load();
    },
    async close(ticketId: number) {
      await closeRepairTicket(ticketId);
      await this.load();
    }
  }
});
