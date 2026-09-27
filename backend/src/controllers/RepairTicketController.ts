import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { asyncHandler } from "../utils/asyncHandler";
import { DomainError } from "../utils/errors";

const actorOf = (req: Request): string => `dispatcher#${(req as unknown as { user?: { id?: number } }).user?.id ?? 1}`;
const idOf = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new DomainError("VALIDATION_FAILED", 400, "工单 id 非法");
  return id;
};

export const repairTicketController = {
  list: asyncHandler((_req: Request, res: Response) => {
    res.json(repairTicketService.listViews());
  }),

  detail: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.getView(idOf(req)));
  }),

  registerCall: asyncHandler((req: Request, res: Response) => {
    const result = repairTicketService.registerCall(req.body, actorOf(req));
    res.status(201).json({ merged: result.merged, ticket_id: result.ticket_id, ticket: result.view });
  }),

  candidates: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.listCandidates(idOf(req)));
  }),

  dispatch: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.dispatch(idOf(req), req.body, actorOf(req)));
  }),

  arrive: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.arrive(idOf(req), actorOf(req)));
  }),

  restore: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.restore(idOf(req), req.body, actorOf(req)));
  }),

  close: asyncHandler((req: Request, res: Response) => {
    res.json(repairTicketService.close(idOf(req), actorOf(req)));
  })
};
