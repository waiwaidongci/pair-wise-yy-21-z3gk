import { db } from "../models/db";
import type { FaultReport } from "../models/FaultReport";

export const faultReportRepository = {
  findAll: (): FaultReport[] => db.faultReport,
  findById: (id: number): FaultReport | undefined => db.faultReport.find((row) => row.id === id),
  findByTicket: (ticketId: number): FaultReport[] => db.faultReport.filter((row) => row.merged_ticket_id === ticketId),
  save: (row: FaultReport): FaultReport => {
    db.faultReport.push(row);
    return row;
  },
  update: (id: number, patch: Partial<FaultReport>): FaultReport | undefined => {
    const row = db.faultReport.find((item) => item.id === id);
    if (row) Object.assign(row, patch);
    return row;
  },
  nextId: (): number => Math.max(0, ...db.faultReport.map((row) => row.id)) + 1
};
