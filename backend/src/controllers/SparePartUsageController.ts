import type { Request, Response } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { asyncHandler } from "../utils/asyncHandler";

export const sparePartUsageController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(sparePartUsageService.list());
  })
};
