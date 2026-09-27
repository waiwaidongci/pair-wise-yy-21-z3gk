export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: [
    "FaultReport.create",
    "FaultReport.update",
    "FaultReport.status",
    "FaultReport.export",
    "FaultReport.callMerge 报修#{reportId} 合并入工单#{ticketId}",
    "FaultReport.callCreate 来电{phone} 新建工单#{ticketId}"
  ],
  RepairTicket: [
    "RepairTicket.create",
    "RepairTicket.update",
    "RepairTicket.status",
    "RepairTicket.export",
    "RepairTicket.dispatch 工单#{ticketId} 派工班组#{teamId}",
    "RepairTicket.dispatchConflict 工单#{ticketId} 派工冲突：班组#{teamId} 被工单#{conflictTicketId} 占用（{reason}）",
    "RepairTicket.arrive 工单#{ticketId} 班组到场，合并报修进入处理中",
    "RepairTicket.repairing 工单#{ticketId} 抢修处理中（合并报修 {count} 起）",
    "RepairTicket.restore 工单#{ticketId} 统一复电登记",
    "RepairTicket.close 工单#{ticketId} 归档"
  ],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: ["SparePartUsage.create", "SparePartUsage.update", "SparePartUsage.status", "SparePartUsage.export"]
};

export const renderLog = (template: string, vars: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
