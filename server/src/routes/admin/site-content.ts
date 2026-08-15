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
  // `.partial()`: a save that only means to change `value` (the common case —
  // the admin form edits one field at a time) must not fall through zod's
  // `.default()` on `label`/`group` and blow away the existing metadata.
  validateBody(siteContentEntrySchema.omit({ key: true }).partial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key as string;
      const patch = req.body as { value?: string; label?: string; group?: string };
      const existing = await siteContentRepo.getByKey(key);
      const merged = {
        key,
        value: patch.value !== undefined ? stripHtml(patch.value) : (existing?.value ?? ""),
        label: patch.label ?? existing?.label ?? "",
        group: patch.group ?? existing?.group ?? "general",
      };
      const entry = await siteContentRepo.upsert(merged);
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
