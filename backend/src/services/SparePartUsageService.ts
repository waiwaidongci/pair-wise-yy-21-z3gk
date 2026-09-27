import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageService = {
  list: (): SparePartUsage[] => sparePartUsageRepository.findAll()
};
