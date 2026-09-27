import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { asyncHandler } from "../utils/asyncHandler";

// controller 层二次包装：参数校验后委托 service 处理，异常交给全局 errorHandlerMiddleware。
export const repairTicketController = {
  list: (_req: Request, res: Response) => res.json(repairTicketService.list()),
  candidates: (req: Request, res: Response) => res.json(repairTicketService.candidates(Number(req.params.id))),
  dispatch: asyncHandler((req: Request, res: Response) =>
    res.status(201).json(repairTicketService.dispatch(Number(req.params.id), req.body))
  ),
  arrive: asyncHandler((req: Request, res: Response) => res.json(repairTicketService.arrive(Number(req.params.id)))),
  startRepair: asyncHandler((req: Request, res: Response) => res.json(repairTicketService.startRepair(Number(req.params.id)))),
  restore: asyncHandler((req: Request, res: Response) => res.json(repairTicketService.restore(Number(req.params.id), req.body))),
  close: asyncHandler((req: Request, res: Response) => res.json(repairTicketService.close(Number(req.params.id))))
};
