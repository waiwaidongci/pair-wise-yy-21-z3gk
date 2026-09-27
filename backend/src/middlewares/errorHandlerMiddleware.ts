import type { ErrorRequestHandler } from "express";

export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  const code = err.code ?? "INTERNAL_ERROR";
  res.status(status).json({
    code,
    message: err.message ?? "internal error",
    conflict_ticket_id: err.conflictTicketId ?? null,
    conflict_reason: err.conflictReason ?? null
  });
};
