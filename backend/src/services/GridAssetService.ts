import { gridAssetRepository } from "../repositories/GridAssetRepository";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetService = {
  list: (): GridAsset[] => gridAssetRepository.findAll()
};
