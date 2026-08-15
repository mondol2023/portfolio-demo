import { Router, type Request, type Response, type NextFunction } from "express";
import { visitorSortFields, type VisitorSortField } from "@portfolio/shared";
import { requireAdminAuth } from "../../middleware/auth";
import { getAnalyticsOverview, getVisitorSessionDetail, getVisitorSessions } from "../../services/analytics-query";

export const adminAnalyticsRouter = Router();
adminAnalyticsRouter.use(requireAdminAuth);

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function isVisitorSortField(value: unknown): value is VisitorSortField {
  return typeof value === "string" && (visitorSortFields as readonly string[]).includes(value);
}

adminAnalyticsRouter.get("/overview", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAnalyticsOverview();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

adminAnalyticsRouter.get("/visitors", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize) || DEFAULT_PAGE_SIZE));
    const sortField = isVisitorSortField(req.query.sortField) ? req.query.sortField : "lastSeen";
    const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";

    const data = await getVisitorSessions({ page, pageSize, sortField, sortDir });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

adminAnalyticsRouter.get("/visitors/:sessionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const detail = await getVisitorSessionDetail(req.params.sessionId);
    if (!detail) {
      res.status(404).json({ error: "not_found", message: "No session found with that id." });
      return;
    }
    res.json({ data: detail });
  } catch (err) {
    next(err);
  }
});
