export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "repair ticket not found",
  CREW_NOT_FOUND: "crew not found",
  ASSET_NOT_FOUND: "grid asset not found",
  TICKET_STATUS_INVALID: "ticket status does not allow this action",
  CREW_NOT_ON_DUTY: "crew is not on duty",
  CREW_SKILL_MISMATCH: "crew skill tags do not match the fault type",
  CREW_OCCUPIED: "crew is already assigned to another ticket",
  DISPATCH_CONFLICT: "crew was just occupied by a more urgent ticket, dispatch rolled back to wait-dispatch"
};
