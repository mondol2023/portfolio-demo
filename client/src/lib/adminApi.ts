import type { LoginInput, LoginResponse } from "@portfolio/shared";
import { ApiError, parseResponse } from "./api";
import { adminAuthStore } from "./adminAuthStore";
import { readCsrfToken, CSRF_HEADER_NAME } from "./csrf";

const AUTH_BASE = "/api/admin/auth";

/** Login/refresh/logout always send/receive cookies, even cross-origin-proxied in dev. */
const COOKIE_FETCH: RequestInit = { credentials: "include" };

export async function adminLogin(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    ...COOKIE_FETCH,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseResponse<LoginResponse>(res);
  adminAuthStore.setSession(data);
  return data;
}

/** Silent session restore on load, backed by the httpOnly refresh cookie. Never throws — resolves false on failure. */
export async function adminRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE}/refresh`, { ...COOKIE_FETCH, method: "POST" });
    if (!res.ok) {
      adminAuthStore.setUnauthenticated();
      return false;
    }
    const data = await parseResponse<LoginResponse>(res);
    adminAuthStore.setSession(data);
    return true;
  } catch {
    adminAuthStore.setUnauthenticated();
    return false;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      ...COOKIE_FETCH,
      method: "POST",
      headers: { [CSRF_HEADER_NAME]: readCsrfToken() ?? "" },
    });
  } finally {
    adminAuthStore.setUnauthenticated();
  }
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Authenticated fetch wrapper for `/api/admin/*` resource endpoints (Phase
 * 10+ CRUD). Attaches the in-memory access token + CSRF header, and on a 401
 * transparently attempts one silent refresh-and-retry before giving up.
 */
export async function adminApiFetch<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const { accessToken } = adminAuthStore.getState();
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (MUTATING_METHODS.has(method)) headers.set(CSRF_HEADER_NAME, readCsrfToken() ?? "");

  const res = await fetch(path, { ...COOKIE_FETCH, ...options, headers });

  if (res.status === 401 && !_isRetry) {
    const refreshed = await adminRefresh();
    if (refreshed) return adminApiFetch<T>(path, options, true);
  }

  if (res.status === 401) {
    adminAuthStore.setUnauthenticated();
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  return parseResponse<T>(res);
}
