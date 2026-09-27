import { gridAssetRepository } from "../repositories/GridAssetRepository";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetService = {
  list: () => gridAssetRepository.findAll(),
  create: (row: unknown) => gridAssetRepository.save(row as GridAsset)
};
