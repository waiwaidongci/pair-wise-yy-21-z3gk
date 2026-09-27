import { ERROR_MESSAGES } from "../constants/errorMessages";

export interface ApiErrorBody {
  code: keyof typeof ERROR_MESSAGES;
  message: string;
  conflict_ticket_id?: number | null;
  conflict_reason?: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public conflictTicketId?: number,
    public conflictReason?: string
  ) {
    super(message);
  }
}

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json", "x-role": "dispatcher" };

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...JSON_HEADERS, ...(options.headers ?? {}) }
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // 开发环境未起后端时返回 index.html，按网络失败处理以便回退本地 mock
    throw new TypeError(`non-json response for ${path}`);
  }
  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new ApiError(
      res.status,
      body?.code ?? "VALIDATION_FAILED",
      body?.message ?? ERROR_MESSAGES.VALIDATION_FAILED,
      body?.conflict_ticket_id ?? undefined,
      body?.conflict_reason ?? undefined
    );
  }
  return (await res.json()) as T;
}
