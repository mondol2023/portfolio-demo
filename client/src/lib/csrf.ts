/**
 * Mirrors the server's double-submit CSRF cookie name (`server/src/lib/csrf.ts`).
 * The cookie is deliberately non-httpOnly so it can be read here and echoed
 * back as the `X-CSRF-Token` header on state-changing admin requests.
 */
const CSRF_COOKIE_NAME = "portfolio_csrf";
export const CSRF_HEADER_NAME = "X-CSRF-Token";

export function readCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
