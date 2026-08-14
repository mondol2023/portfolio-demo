import type { NextFunction, Request, Response } from "express";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "../lib/csrf";

/**
 * Double-submit CSRF check for state-changing admin requests. The cookie is
 * readable JS-side (not httpOnly) so the admin SPA mirrors it into the
 * `X-CSRF-Token` header; we just verify the two match. Relies on
 * `requireAdminAuth` running first for actual authentication.
 */
export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME] as string | undefined;
  const headerToken = req.header(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: "forbidden", message: "CSRF token missing or invalid." });
    return;
  }

  next();
}
