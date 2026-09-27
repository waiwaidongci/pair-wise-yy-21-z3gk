import { db } from "../models/db";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => db.sparePartUsage,
  save: (row: SparePartUsage): SparePartUsage => {
    db.sparePartUsage.push(row);
    return row;
  }
};
