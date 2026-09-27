import { ERROR_CODES } from "./errorCodes";

export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "repair ticket not found",
  CREW_NOT_FOUND: "crew not found",
  CREW_NOT_ON_DUTY: "crew is not on duty",
  CREW_SKILL_MISMATCH: "crew skill tags do not match the fault",
  CREW_BUSY: "crew is occupied by another repair ticket",
  CREW_CONFLICT: "crew is occupied by a more urgent ticket, dispatch rejected",
  ILLEGAL_STATUS_FLOW: "ticket status does not allow this action",
  INVALID_RESTORE_RESULT: "invalid payload: restore result is required",
  ASSET_NOT_FOUND: "grid asset not found"
};
