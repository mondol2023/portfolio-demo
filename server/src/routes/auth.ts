import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { loginInputSchema, type LoginResponse } from "@portfolio/shared";
import { adminUsersRepo } from "../repos/admin-users-repo";
import { auditLogRepo } from "../repos/audit-log-repo";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { setRefreshCookie, clearRefreshCookie, setCsrfCookie, clearCsrfCookie, REFRESH_COOKIE_NAME } from "../lib/auth-cookies";
import { requireAdminAuth } from "../middleware/auth";
import { loginRateLimiter } from "../middleware/rate-limit";

export const authRouter = Router();

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

authRouter.post("/login", loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation_error",
        message: "Please enter a valid email and password.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;
    const user = await adminUsersRepo.findByEmail(email);

    // Compare against a fixed dummy hash when the user doesn't exist so the
    // response timing doesn't leak whether an email is registered.
    const passwordHash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatches) {
      await auditLogRepo.record({
        adminEmail: email,
        action: "login_failed",
        entityType: "admin_session",
      });
      res.status(401).json({ error: "invalid_credentials", message: "Incorrect email or password." });
      return;
    }

    const { token: accessToken, expiresAt } = signAccessToken({ sub: user.id, email: user.email, role: "admin" });
    const { token: refreshToken, maxAgeMs } = signRefreshToken({ sub: user.id, email: user.email });

    setRefreshCookie(res, refreshToken, maxAgeMs);
    setCsrfCookie(res, maxAgeMs);

    await auditLogRepo.record({ adminEmail: user.email, action: "login", entityType: "admin_session" });

    const body: LoginResponse = { accessToken, expiresAt, user: { id: user.id, email: user.email, role: "admin" } };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
      res.status(401).json({ error: "unauthorized", message: "Session expired. Please sign in again." });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      clearRefreshCookie(res);
      clearCsrfCookie(res);
      res.status(401).json({ error: "unauthorized", message: "Session expired. Please sign in again." });
      return;
    }

    const user = await adminUsersRepo.getById(payload.sub);
    if (!user) {
      clearRefreshCookie(res);
      clearCsrfCookie(res);
      res.status(401).json({ error: "unauthorized", message: "Session expired. Please sign in again." });
      return;
    }

    const { token: accessToken, expiresAt } = signAccessToken({ sub: user.id, email: user.email, role: "admin" });
    const { token: newRefreshToken, maxAgeMs } = signRefreshToken({ sub: user.id, email: user.email });

    // Rotate the refresh token + CSRF token on every refresh.
    setRefreshCookie(res, newRefreshToken, maxAgeMs);
    setCsrfCookie(res, REFRESH_COOKIE_MAX_AGE_MS);

    const body: LoginResponse = { accessToken, expiresAt, user: { id: user.id, email: user.email, role: "admin" } };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await auditLogRepo.record({ adminEmail: payload.email, action: "logout", entityType: "admin_session" });
      } catch {
        // Token already invalid/expired — nothing to log, just clear cookies below.
      }
    }

    clearRefreshCookie(res);
    clearCsrfCookie(res);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.admin!;
    const user = await adminUsersRepo.getById(admin.sub);
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "Session expired. Please sign in again." });
      return;
    }
    res.status(200).json({ user: { id: user.id, email: user.email, role: "admin" } });
  } catch (err) {
    next(err);
  }
});
