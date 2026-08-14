import { Router, type Request, type Response, type NextFunction } from "express";
import { siteContentEntrySchema } from "@portfolio/shared";
import { siteContentRepo } from "../../repos/site-content-repo";
import { auditLogRepo } from "../../repos/audit-log-repo";
import { requireAdminAuth } from "../../middleware/auth";
import { requireCsrf } from "../../middleware/csrf";
import { validateBody } from "../../middleware/validate";
import { stripHtml } from "../../lib/sanitize";
import { invalidateSiteContentCache } from "../site-content";

/**
 * Key/value settings store — doesn't fit `buildAdminCrudRouter`'s id-keyed
 * shape (see `repos/site-content-repo.ts`), so it gets its own tiny router:
 * list everything, upsert one entry by key. No delete (keys are fixed by
 * `SITE_CONTENT_KEYS`; clearing a value is done by upserting an empty string).
 */
export const adminSiteContentRouter = Router();
adminSiteContentRouter.use(requireAdminAuth);

adminSiteContentRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await siteContentRepo.getAll() });
  } catch (err) {
    next(err);
  }
});

adminSiteContentRouter.put(
  "/:key",
  requireCsrf,
  validateBody(siteContentEntrySchema.omit({ key: true })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key as string;
      const { value, label, group } = req.body as { value: string; label: string; group: string };
      const entry = await siteContentRepo.upsert({ key, value: stripHtml(value), label, group });
      invalidateSiteContentCache();
      await auditLogRepo.record({
        adminEmail: req.admin!.email,
        action: "update",
        entityType: "site_content",
        entityId: key,
      });
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  }
);
