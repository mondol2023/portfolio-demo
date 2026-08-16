import express, { type Express, type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, isProduction } from "./config/env";
import { contactRouter } from "./routes/contact";
import { projectsRouter } from "./routes/projects";
import { blogRouter } from "./routes/blog";
import { skillsRouter } from "./routes/skills";
import { experienceRouter } from "./routes/experience";
import { siteContentRouter } from "./routes/site-content";
import { authRouter } from "./routes/auth";
import { adminProjectsRouter } from "./routes/admin/projects";
import { adminBlogRouter } from "./routes/admin/blog";
import { adminSkillsRouter } from "./routes/admin/skills";
import { adminExperienceRouter } from "./routes/admin/experience";
import { adminSiteContentRouter } from "./routes/admin/site-content";
import { adminAuditLogRouter } from "./routes/admin/audit-log";
import { adminAnalyticsRouter } from "./routes/admin/analytics";
import { analyticsRouter } from "./routes/analytics";
import { contactRateLimiter, publicApiRateLimiter, analyticsRateLimiter } from "./middleware/rate-limit";

export function createApp(): Express {
  const app = express();

  // Trust the first proxy hop (needed for correct req.ip behind a load balancer/CDN in prod).
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "https:", "data:"],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'self'"],
            },
          }
        : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "200kb" }));
  app.use(express.urlencoded({ extended: true, limit: "200kb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/admin/auth", authRouter);
  app.use("/api/admin/projects", adminProjectsRouter);
  app.use("/api/admin/blog", adminBlogRouter);
  app.use("/api/admin/skills", adminSkillsRouter);
  app.use("/api/admin/experience", adminExperienceRouter);
  app.use("/api/admin/site-content", adminSiteContentRouter);
  app.use("/api/admin/audit-log", adminAuditLogRouter);
  app.use("/api/admin/analytics", adminAnalyticsRouter);
  app.use("/api/contact", contactRateLimiter, contactRouter);
  app.use("/api/projects", publicApiRateLimiter, projectsRouter);
  app.use("/api/blog", publicApiRateLimiter, blogRouter);
  app.use("/api/skills", publicApiRateLimiter, skillsRouter);
  app.use("/api/experience", publicApiRateLimiter, experienceRouter);
  app.use("/api/site-content", publicApiRateLimiter, siteContentRouter);
  app.use("/api/analytics", analyticsRateLimiter, analyticsRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "not_found", message: "Route not found" });
  });

  // Centralized error handler — never leak stack traces/internals to clients.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = (err as { status?: number })?.status ?? 500;
    res.status(status).json({
      error: "internal_error",
      message: isProduction ? "Something went wrong" : String((err as Error)?.message ?? err),
    });
  });

  return app;
}
