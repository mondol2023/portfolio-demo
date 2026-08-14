import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../lib/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AccessTokenPayload;
    }
  }
}

/** Protects `/api/admin/*` routes. Expects `Authorization: Bearer <accessToken>`. */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "unauthorized", message: "Sign in required." });
    return;
  }

  try {
    req.admin = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Session expired. Please sign in again." });
  }
}
