import type { ErrorCode } from "../constants/errorCodes";

// service 层抛出的业务异常：携带错误码、HTTP 状态与附加详情（如派工冲突信息），
// 由 controller 层包装后交给全局 errorHandlerMiddleware 统一输出。
export class ServiceError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
