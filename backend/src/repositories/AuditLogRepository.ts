import { db } from "../models/db";
import type { AuditLog } from "../models/AuditLog";

export const auditLogRepository = {
  findAll: (): AuditLog[] => db.auditLog,
  save: (row: Omit<AuditLog, "id" | "created_at">): AuditLog => {
    const entry: AuditLog = {
      id: Math.max(0, ...db.auditLog.map((log) => log.id)) + 1,
      created_at: new Date().toISOString(),
      ...row
    };
    db.auditLog.push(entry);
    return entry;
  }
};
