import { Router, type Request, type Response, type NextFunction } from "express";
import type { ZodSchema } from "zod";
import { reorderInputSchema } from "@portfolio/shared";
import { requireAdminAuth } from "../middleware/auth";
import { requireCsrf } from "../middleware/csrf";
import { validateBody } from "../middleware/validate";
import { auditLogRepo } from "../repos/audit-log-repo";

interface AdminCrudOptions<T extends { id: string; order?: number }, Input> {
  /** Used as `entityType` on audit log rows and in generic 404 messages. */
  entityLabel: string;
  inputSchema: ZodSchema<Input>;
  /** Schema for `PUT /:id` (typically `inputSchema.partial()`, built at the call site since only `ZodObject` supports `.partial()`). */
  updateInputSchema: ZodSchema<Partial<Input>>;
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  create: (input: Input) => Promise<T>;
  update: (id: string, patch: Partial<Input>) => Promise<T | undefined>;
  remove: (id: string) => Promise<boolean>;
  invalidateCache: () => void;
  /** Sort applied to the admin list view (defaults to insertion order). */
  sortForList?: (a: T, b: T) => number;
  /** Runs on the validated body before create/update — e.g. HTML sanitization. */
  sanitize?: (input: Partial<Input>) => Partial<Input>;
  /** Adds `POST /reorder` (`{ orderedIds: string[] }`) — only for entities with an `order` field. */
  supportsReorder?: boolean;
}

/**
 * Builds a standard `requireAdminAuth`-gated CRUD router (list/get/create/
 * update/delete[/reorder]) for one entity, so `projects`/`blog`/`skills`/
 * `experience` don't each hand-roll the same boilerplate. Mutating routes
 * are additionally gated behind `requireCsrf` and record an audit log row.
 * `site-content` (key-keyed, not id-keyed) and `audit-log` (read-only) don't
 * fit this shape and get their own small route files instead.
 */
export function buildAdminCrudRouter<T extends { id: string; order?: number }, Input>(
  opts: AdminCrudOptions<T, Input>
): Router {
  const router = Router();
  router.use(requireAdminAuth);

  const notFound = (res: Response) =>
    res.status(404).json({ error: "not_found", message: `${opts.entityLabel} not found` });

  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const all = await opts.getAll();
      res.json({ data: opts.sortForList ? [...all].sort(opts.sortForList) : all });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await opts.getById(req.params.id as string);
      if (!item) return void notFound(res);
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", requireCsrf, validateBody(opts.inputSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = (opts.sanitize ? opts.sanitize(req.body) : req.body) as Input;
      const created = await opts.create(input);
      opts.invalidateCache();
      await auditLogRepo.record({
        adminEmail: req.admin!.email,
        action: "create",
        entityType: opts.entityLabel,
        entityId: created.id,
      });
      res.status(201).json({ data: created });
    } catch (err) {
      next(err);
    }
  });

  router.put(
    "/:id",
    requireCsrf,
    validateBody(opts.updateInputSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const patch = (opts.sanitize ? opts.sanitize(req.body) : req.body) as Partial<Input>;
        const updated = await opts.update(req.params.id as string, patch);
        if (!updated) return void notFound(res);
        opts.invalidateCache();
        await auditLogRepo.record({
          adminEmail: req.admin!.email,
          action: "update",
          entityType: opts.entityLabel,
          entityId: updated.id,
        });
        res.json({ data: updated });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete("/:id", requireCsrf, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const removed = await opts.remove(id);
      if (!removed) return void notFound(res);
      opts.invalidateCache();
      await auditLogRepo.record({
        adminEmail: req.admin!.email,
        action: "delete",
        entityType: opts.entityLabel,
        entityId: id,
      });
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  if (opts.supportsReorder) {
    router.post(
      "/reorder",
      requireCsrf,
      validateBody(reorderInputSchema),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { orderedIds } = req.body as { orderedIds: string[] };
          await Promise.all(
            orderedIds.map((id, index) =>
              opts.update(id, { order: index } as unknown as Partial<Input>)
            )
          );
          opts.invalidateCache();
          await auditLogRepo.record({
            adminEmail: req.admin!.email,
            action: "reorder",
            entityType: opts.entityLabel,
          });
          res.json({ success: true });
        } catch (err) {
          next(err);
        }
      }
    );
  }

  return router;
}
