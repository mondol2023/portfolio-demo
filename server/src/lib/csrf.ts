import { randomBytes } from "node:crypto";

/**
 * Double-submit CSRF cookie. Deliberately *not* httpOnly — the admin SPA
 * reads it via `document.cookie` and mirrors it into an `X-CSRF-Token`
 * header on every state-changing request; `requireCsrf` then just checks
 * the header matches the cookie. No server-side session store needed.
 */
export const CSRF_COOKIE_NAME = "portfolio_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}
