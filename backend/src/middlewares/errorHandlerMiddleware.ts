import type { ErrorRequestHandler } from "express";

// 全局异常兜底：service 抛出的 ServiceError 携带 code/status/details，
// 其余异常统一按 INTERNAL_ERROR 输出，禁止在各路由内吞掉异常。
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  res.status(status).json({
    code: err.code ?? "INTERNAL_ERROR",
    message: err.message ?? "internal server error",
    ...(err.details ? { details: err.details } : {})
  });
};
