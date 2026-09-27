import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export class DomainError extends Error {
  status: number;
  code: keyof typeof ERROR_CODES;
  conflictTicketId?: number;
  conflictReason?: string;

  constructor(code: keyof typeof ERROR_CODES, status = 400, detail?: string, extra?: { conflictTicketId?: number; conflictReason?: string }) {
    super(detail ?? ERROR_MESSAGES[code]);
    this.name = "DomainError";
    this.status = status;
    this.code = code;
    this.conflictTicketId = extra?.conflictTicketId;
    this.conflictReason = extra?.conflictReason;
  }
}
