import { db } from "./db";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageRepository = {
  findAll(): SparePartUsage[] {
    return db.sparePartUsage;
  },
  findByTicketId(ticketId: number): SparePartUsage[] {
    return db.sparePartUsage.filter((row) => row.ticket_id === ticketId);
  }
};
