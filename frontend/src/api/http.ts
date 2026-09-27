// 统一请求封装：解析后端 { code, message, details } 错误结构，供各实体 api 复用。
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const parseError = async (res: Response): Promise<ApiError> => {
  try {
    const body = await res.json();
    return new ApiError(body.code ?? "INTERNAL_ERROR", body.message ?? res.statusText, res.status, body.details);
  } catch {
    return new ApiError("INTERNAL_ERROR", res.statusText, res.status);
  }
};

export async function getJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint);
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}

export async function postJson<T>(endpoint: string, payload?: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {})
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}
