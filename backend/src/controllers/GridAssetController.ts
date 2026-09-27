import type { Request, Response } from "express";
import { gridAssetService } from "../services/GridAssetService";
import { asyncHandler } from "../utils/asyncHandler";

export const gridAssetController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(gridAssetService.list());
  })
};
