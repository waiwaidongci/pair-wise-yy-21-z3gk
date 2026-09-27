import { db, nextId } from "./db";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll(): RepairTicket[] {
    return db.repairTicket;
  },
  findById(id: number): RepairTicket | undefined {
    return db.repairTicket.find((row) => row.id === id);
  },
  insert(row: RepairTicket): RepairTicket {
    db.repairTicket.push(row);
    return row;
  },
  update(id: number, patch: Partial<RepairTicket>): RepairTicket {
    const row = this.findById(id);
    if (!row) throw new Error(`repair ticket ${id} not found`);
    Object.assign(row, patch);
    return row;
  },
  nextId(): number {
    return nextId(db.repairTicket);
  }
};
