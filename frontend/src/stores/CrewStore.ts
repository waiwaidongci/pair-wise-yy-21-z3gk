import { defineStore } from "pinia";
import { listCrew, urgentOccupyCrew } from "../api/Crew";
import type { Crew } from "../types/Crew";

export const useCrewStore = defineStore("crew", {
  state: () => ({ rows: [] as Crew[], loading: false }),
  getters: {
    onDuty: (state) => state.rows.filter((row) => row.duty_status === "ON_DUTY"),
    idle: (state) => state.rows.filter((row) => row.duty_status === "ON_DUTY" && row.current_ticket_id === 0)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listCrew();
      } finally {
        this.loading = false;
      }
    },
    async urgentOccupy(crewId: number, payload: { fault_type: string; address_desc: string }) {
      const result = await urgentOccupyCrew(crewId, payload);
      await this.load();
      return result;
    }
  }
});
