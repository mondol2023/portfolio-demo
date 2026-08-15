import { Router, type Request, type Response, type NextFunction } from "express";
import type { ZodSchema, ZodTypeAny } from "zod";
import { reorderInputSchema } from "@portfolio/shared";
import { requireAdminAuth } from "../middleware/auth";
import { requireCsrf } from "../middleware/csrf";
import { validateBody } from "../middleware/validate";
import { auditLogRepo } from "../repos/audit-log-repo";

interface AdminCrudOptions<T extends { id: string; order?: number }, Input> {
  /** Used as `entityType` on audit log rows and in generic 404 messages. */
  entityLabel: string;
  /**
   * Schema for `POST /` and the update schema for `PUT /:id` (typically
   * `inputSchema.partial()`, built at the call site since only `ZodObject` supports
   * `.partial()`). Both typed loosely here — a zod schema's own pre-parse `_input`
   * type differs from its post-parse `_output` type (`Input`/`z.infer`) whenever a
   * field carries a zod `.default()`, since the field is optional going in and
   * filled going out. That doesn't structurally unify with `ZodSchema<Input>` /
   * `ZodSchema<Partial<Input>>`, so we cast at the one usage site for each below.
   */
  inputSchema: ZodTypeAny;
  updateInputSchema: ZodTypeAny;
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  create: (input: Input) => Promise<T>;
  update: (id: string, patch: Partial<Input>) => Promise<T | undefined>;
  remove: (id: string) => Promise<boolean>;
  /**
   * Wipes and rewrites every record in one call. Only used by `POST /reorder`
   * (required whenever `supportsReorder` is true) — reorder reindexes the
   * full list and persists it in a single write, rather than firing one
   * `update()` per id. N concurrent `update()` calls raced against the same
   * underlying file/sheet and could interleave into lost updates or, for the
   * JSON adapter, a corrupted file (`Promise.all` + unlocked read-modify-write).
   */
  replaceAll?: (records: T[]) => Promise<void>;
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

  router.post("/", requireCsrf, validateBody(opts.inputSchema as ZodSchema<Input>), async (req: Request, res: Response, next: NextFunction) => {
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
    validateBody(opts.updateInputSchema as ZodSchema<Partial<Input>>),
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
    if (!opts.replaceAll) {
      throw new Error(`buildAdminCrudRouter(${opts.entityLabel}): supportsReorder requires replaceAll`);
    }
    const replaceAll = opts.replaceAll;
    router.post(
      "/reorder",
      requireCsrf,
      validateBody(reorderInputSchema),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { orderedIds } = req.body as { orderedIds: string[] };
          const all = await opts.getAll();
          const orderById = new Map(orderedIds.map((id, index) => [id, index]));
          // Anything not named in orderedIds (e.g. a stale client-side list) keeps
          // its relative position, appended after the named ids — never dropped.
          let nextIndex = orderedIds.length;
          const reordered = all.map((record) => ({
            ...record,
            order: orderById.has(record.id) ? orderById.get(record.id)! : nextIndex++,
          }));
          // Single read-then-write, not one `update()` per id — see `replaceAll` doc above.
          await replaceAll(reordered);
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
