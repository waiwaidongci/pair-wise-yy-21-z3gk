import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageService = {
  list: () => sparePartUsageRepository.findAll(),
  create: (row: unknown) => sparePartUsageRepository.save(row as SparePartUsage)
};
