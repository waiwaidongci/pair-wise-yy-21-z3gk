import { defineStore } from "pinia";
import { listFaultReport, registerFaultReport, type RegisterReportResult } from "../api/FaultReport";
import type { FaultReport } from "../types/FaultReport";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false }),
  getters: {
    byTicket: (state) => (ticketId: number) => state.rows.filter((row) => row.merged_ticket_id === ticketId)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listFaultReport();
      } finally {
        this.loading = false;
      }
    },
    async register(payload: Parameters<typeof registerFaultReport>[0]): Promise<RegisterReportResult> {
      const result = await registerFaultReport(payload);
      await this.load();
      return result;
    }
  }
});
