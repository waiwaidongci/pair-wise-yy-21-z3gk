// 集中日志模板：所有写操作按实体 + 动作拼装模板键，字段变更时需同步修改模板与调用处。
export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: [
    "FaultReport.create",
    "FaultReport.update",
    "FaultReport.status",
    "FaultReport.export",
    "FaultReport.merge",
    "FaultReport.arrive",
    "FaultReport.restore"
  ],
  RepairTicket: [
    "RepairTicket.create",
    "RepairTicket.update",
    "RepairTicket.status",
    "RepairTicket.export",
    "RepairTicket.merge",
    "RepairTicket.dispatch",
    "RepairTicket.dispatchConflict",
    "RepairTicket.arrive",
    "RepairTicket.restore"
  ],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export", "Crew.assign", "Crew.release", "Crew.urgentOccupy"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export"]
} as const;

export type LogTemplateKey = keyof typeof LOG_TEMPLATES;

// 统一拼装日志文案，service 层调用后写入 audit_log。
export const renderLog = (template: string, detail: string) => `[${template}] ${detail}`;
