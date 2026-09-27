import type { RequestHandler } from "express";

// controller 层统一包装：异步异常进入全局 errorHandlerMiddleware，
// 业务异常（ServiceError）在此补充 code/details 字段后输出。
export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
