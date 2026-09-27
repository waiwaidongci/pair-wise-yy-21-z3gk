import { renderLog } from "../constants/logTemplates";

export interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  target_type: string;
  target_id: string | number;
  created_at: string;
}

const auditLogs: AuditEntry[] = [];
let seq = 1;

export const auditStore = {
  list(): AuditEntry[] {
    return auditLogs;
  },
  record(entry: { actor: string; action: string; target_type: string; target_id: string | number }): AuditEntry {
    const row: AuditEntry = { id: seq++, created_at: new Date().toISOString(), ...entry };
    auditLogs.unshift(row);
    return row;
  }
};

export const writeAudit = (
  actor: string,
  template: string,
  vars: Record<string, string | number>,
  targetType: string,
  targetId: string | number
): AuditEntry =>
  auditStore.record({ actor, action: renderLog(template, vars), target_type: targetType, target_id: targetId });
