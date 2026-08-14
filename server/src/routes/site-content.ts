import { Router, type Request, type Response, type NextFunction } from "express";
import { siteContentRepo } from "../repos/site-content-repo";
import { cached, cache } from "../lib/cache";

export const siteContentRouter = Router();

const CACHE_KEY = "site-content:map";

export function invalidateSiteContentCache(): void {
  cache.invalidate(CACHE_KEY);
}

/** Returns the flat `{ "hero.name": "...", ... }` map the frontend consumes directly. */
siteContentRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const map = await cached(CACHE_KEY, () => siteContentRepo.getMap());
    res.json({ data: map });
  } catch (err) {
    next(err);
  }
});
