import type { Response } from "express";
import { isProduction } from "../config/env";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "./csrf";

export const REFRESH_COOKIE_NAME = "portfolio_refresh";

/** Scoped to the auth routes only — the browser never sends it to unrelated `/api/*` endpoints. */
const REFRESH_COOKIE_PATH = "/api/admin/auth";

function baseCookieOptions() {
  return {
    secure: isProduction,
    sameSite: "strict" as const,
  };
}

export function setRefreshCookie(res: Response, token: string, maxAgeMs: number): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    httpOnly: true,
    path: REFRESH_COOKIE_PATH,
    maxAge: maxAgeMs,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...baseCookieOptions(), httpOnly: true, path: REFRESH_COOKIE_PATH });
}

/** Readable by the admin SPA (not httpOnly) so it can be mirrored into the `X-CSRF-Token` header. */
export function setCsrfCookie(res: Response, maxAgeMs: number): string {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    httpOnly: false,
    path: "/",
    maxAge: maxAgeMs,
  });
  return token;
}

export function clearCsrfCookie(res: Response): void {
  res.clearCookie(CSRF_COOKIE_NAME, { ...baseCookieOptions(), httpOnly: false, path: "/" });
}
