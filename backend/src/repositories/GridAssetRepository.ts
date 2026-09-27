import { db } from "./db";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetRepository = {
  findAll(): GridAsset[] {
    return db.gridAsset;
  },
  findById(id: number): GridAsset | undefined {
    return db.gridAsset.find((row) => row.id === id);
  }
};
