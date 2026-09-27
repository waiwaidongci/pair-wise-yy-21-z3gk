export const LOG_TEMPLATES = {
  GridAsset: ["配网资产创建", "配网资产更新", "配网资产状态变更", "配网资产导出"],
  FaultReport: [
    "故障报修创建",
    "故障报修更新",
    "故障报修状态变更",
    "故障报修导出",
    "报修#{reportId} 合并入工单#{ticketId}",
    "来电{phone} 新建工单#{ticketId}"
  ],
  RepairTicket: [
    "抢修工单创建",
    "抢修工单更新",
    "抢修工单状态变更",
    "抢修工单导出",
    "工单#{ticketId} 派工班组#{teamId}",
    "工单#{ticketId} 派工冲突：班组#{teamId} 被工单#{conflictTicketId} 占用（{reason}）",
    "工单#{ticketId} 班组到场，合并报修进入处理中",
    "工单#{ticketId} 抢修处理中（合并报修 {count} 起）",
    "工单#{ticketId} 统一复电登记",
    "工单#{ticketId} 归档"
  ],
  Crew: ["抢修班组创建", "抢修班组更新", "抢修班组状态变更", "抢修班组导出"],
  SparePartUsage: ["备件领用创建", "备件领用更新", "备件领用状态变更", "备件领用导出"]
};
