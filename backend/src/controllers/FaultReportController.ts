import type { Request, Response } from "express";
import { faultReportService } from "../services/FaultReportService";
import { asyncHandler } from "../utils/asyncHandler";

export const faultReportController = {
  list: (_req: Request, res: Response) => res.json(faultReportService.list()),
  register: asyncHandler((req: Request, res: Response) => res.status(201).json(faultReportService.register(req.body)))
};
