import { Router, type Request, type Response, type NextFunction } from "express";
import { auditLogRepo } from "../../repos/audit-log-repo";
import { requireAdminAuth } from "../../middleware/auth";

/** Read-only — audit log rows are written by the routes that perform the action, never edited/deleted here. */
export const adminAuditLogRouter = Router();
adminAuditLogRouter.use(requireAdminAuth);

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

adminAuditLogRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));

    const all = await auditLogRepo.getAll();
    const sorted = [...all].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    res.json({ data: { items, total: sorted.length, page, pageSize } });
  } catch (err) {
    next(err);
  }
});
