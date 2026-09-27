import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";
import { asyncHandler } from "../utils/asyncHandler";

export const crewController = {
  list: (_req: Request, res: Response) => res.json(crewService.list()),
  urgentOccupy: asyncHandler((req: Request, res: Response) => res.status(201).json(crewService.urgentOccupy(Number(req.params.id), req.body)))
};
