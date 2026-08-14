import { Router, type Request, type Response, type NextFunction } from "express";
import { skillsRepo } from "../repos/skills-repo";
import { cached, cache } from "../lib/cache";

export const skillsRouter = Router();

const LIST_CACHE_KEY = "skills:all";

export function invalidateSkillsCache(): void {
  cache.invalidate(LIST_CACHE_KEY);
}

skillsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await cached(LIST_CACHE_KEY, async () => {
      const all = await skillsRepo.getAll();
      return [...all].sort((a, b) => a.order - b.order);
    });
    res.json({ data: skills });
  } catch (err) {
    next(err);
  }
});
