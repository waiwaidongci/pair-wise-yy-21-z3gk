import { db } from "../models/db";
import type { GridAsset } from "../models/GridAsset";

export const gridAssetRepository = {
  findAll: (): GridAsset[] => db.gridAsset,
  findById: (id: number): GridAsset | undefined => db.gridAsset.find((row) => row.id === id),
  save: (row: GridAsset): GridAsset => {
    db.gridAsset.push(row);
    return row;
  }
};
