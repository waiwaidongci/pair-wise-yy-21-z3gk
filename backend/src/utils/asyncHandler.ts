import type { NextFunction, Request, Response } from "express";
import { DomainError } from "./errors";

type Handler = (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>;

// Controller 层统一包装，service 抛出的 DomainError 交给全局 errorHandler
export const asyncHandler =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      next(err instanceof DomainError ? err : new DomainError("VALIDATION_FAILED", 400, String((err as Error)?.message ?? err)));
    });
  };
