/**
 * Thin fetch wrapper for `/api/*` calls. Paths are relative — Vite's dev
 * server proxies `/api` to the Express backend (see vite.config.ts), and in
 * production both are served behind the same origin/reverse proxy, so no
 * base URL is ever needed.
 */
export class ApiError extends Error {
  status: number;
  details?: Record<string, string[] | undefined>;

  constructor(status: number, message: string, details?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function parseResponse<T>(res: Response): Promise<T> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON error body (e.g. a proxy/gateway failure) — fall through to the generic message below.
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : "Something went wrong. Please try again.";
    const details =
      payload && typeof payload === "object" && "details" in payload
        ? (payload.details as Record<string, string[] | undefined>)
        : undefined;
    throw new ApiError(res.status, message, details);
  }

  return payload as T;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

/** GET helper for the public read-only endpoints. Unwraps the `{ data: T }` envelope. */
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "GET" });
  return parseResponse<T>(res);
}
