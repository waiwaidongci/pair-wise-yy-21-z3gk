import { db } from "../models/db";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => db.repairTicket,
  findById: (id: number): RepairTicket | undefined => db.repairTicket.find((row) => row.id === id),
  save: (row: RepairTicket): RepairTicket => {
    db.repairTicket.push(row);
    return row;
  },
  update: (id: number, patch: Partial<RepairTicket>): RepairTicket | undefined => {
    const row = db.repairTicket.find((item) => item.id === id);
    if (row) Object.assign(row, patch);
    return row;
  },
  nextId: (): number => Math.max(0, ...db.repairTicket.map((row) => row.id)) + 1
};
