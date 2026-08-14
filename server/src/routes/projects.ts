import { Router, type Request, type Response, type NextFunction } from "express";
import { projectsRepo } from "../repos/projects-repo";
import { cached, cache } from "../lib/cache";

export const projectsRouter = Router();

const LIST_CACHE_KEY = "projects:published";

/** Invalidated by the Phase 10 admin write routes on create/update/delete/reorder. */
export function invalidateProjectsCache(): void {
  cache.invalidate(LIST_CACHE_KEY);
}

projectsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await cached(LIST_CACHE_KEY, async () => {
      const all = await projectsRepo.getAll();
      return all.filter((p) => p.published).sort((a, b) => a.order - b.order);
    });
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      res.status(404).json({ error: "not_found", message: "Project not found" });
      return;
    }
    const project = await projectsRepo.getBySlug(slug);
    if (!project || !project.published) {
      res.status(404).json({ error: "not_found", message: "Project not found" });
      return;
    }
    res.json({ data: project });
  } catch (err) {
    next(err);
  }
});
