import type { RequestHandler } from "express";
import { auditStore } from "../utils/audit";

// 写操作统一落审计流水；业务动作明细由 service 通过 writeAudit 追加
export const auditLogMiddleware: RequestHandler = (req, res, next) => {
  if (req.method !== "GET") {
    res.on("finish", () => {
      if (res.statusCode < 400) {
        auditStore.record({
          actor: `dispatcher#${(req as unknown as { user?: { id?: number } }).user?.id ?? 1}`,
          action: `${req.method} ${req.path}`,
          target_type: "http",
          target_id: req.path
        });
      }
    });
  }
  next();
};
