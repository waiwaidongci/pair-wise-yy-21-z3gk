import { ERROR_CODES } from "./errorCodes";

export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TICKET_NOT_FOUND: "抢修工单不存在",
  CREW_NOT_FOUND: "抢修班组不存在",
  CREW_NOT_ON_DUTY: "该班组当前不在当班状态",
  CREW_SKILL_MISMATCH: "该班组技能与故障类型不匹配",
  CREW_BUSY: "该班组正执行其他工单，请改派其他班组",
  CREW_CONFLICT: "班组刚被更紧急任务占用，本次派工已退回待派",
  ILLEGAL_STATUS_FLOW: "工单当前状态不允许该操作",
  INVALID_RESTORE_RESULT: "复电必须登记处理结果",
  ASSET_NOT_FOUND: "配网资产不存在"
};
