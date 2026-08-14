import { Router, type Request, type Response, type NextFunction } from "express";
import { experienceRepo } from "../repos/experience-repo";
import { cached, cache } from "../lib/cache";

export const experienceRouter = Router();

const LIST_CACHE_KEY = "experience:all";

export function invalidateExperienceCache(): void {
  cache.invalidate(LIST_CACHE_KEY);
}

experienceRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const experience = await cached(LIST_CACHE_KEY, async () => {
      const all = await experienceRepo.getAll();
      return [...all].sort((a, b) => a.order - b.order);
    });
    res.json({ data: experience });
  } catch (err) {
    next(err);
  }
});
