import type { RequestHandler } from "express";
import { DomainError } from "../utils/errors";

// RBAC：authMiddleware 已把角色挂到 req.user.role，写操作按角色放行
export const rbacMiddleware =
  (roles: string[] = []): RequestHandler =>
  (req, _res, next) => {
    if (roles.length === 0) return next();
    const role = (req as unknown as { user?: { role?: string } }).user?.role ?? "guest";
    if (!roles.includes(role)) {
      return next(new DomainError("RBAC_DENIED", 403, `角色 ${role} 无权执行该操作`));
    }
    return next();
  };
