import type { Request, Response } from "express";
import { crewService } from "../services/CrewService";
import { asyncHandler } from "../utils/asyncHandler";

export const crewController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(crewService.list());
  }),
  update: asyncHandler((req: Request, res: Response) => {
    res.json(crewService.update(Number(req.params.id), req.body));
  })
};
