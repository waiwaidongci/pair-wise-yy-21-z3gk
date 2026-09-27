export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TICKET_NOT_FOUND: "工单不存在或已被清理",
  CREW_NOT_FOUND: "班组不存在",
  ASSET_NOT_FOUND: "配网资产不存在",
  TICKET_STATUS_INVALID: "当前工单状态不允许该操作",
  CREW_NOT_ON_DUTY: "该班组不在当班状态",
  CREW_SKILL_MISMATCH: "班组技能与故障类型不匹配",
  CREW_OCCUPIED: "该班组正在处理其他工单",
  DISPATCH_CONFLICT: "班组刚被更紧急任务占用，本次派工已退回待派"
};
