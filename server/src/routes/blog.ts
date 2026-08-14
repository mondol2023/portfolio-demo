import { Router, type Request, type Response, type NextFunction } from "express";
import { blogRepo } from "../repos/blog-repo";
import { cached, cache } from "../lib/cache";

export const blogRouter = Router();

const LIST_CACHE_KEY = "blog:published";

/** Invalidated by the Phase 10 admin write routes on create/update/delete/publish. */
export function invalidateBlogCache(): void {
  cache.invalidate(LIST_CACHE_KEY);
}

blogRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await cached(LIST_CACHE_KEY, async () => {
      const all = await blogRepo.getAll();
      return all
        .filter((p) => p.status === "published")
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    });
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
});

blogRouter.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      res.status(404).json({ error: "not_found", message: "Post not found" });
      return;
    }
    const post = await blogRepo.getBySlug(slug);
    if (!post || post.status !== "published") {
      res.status(404).json({ error: "not_found", message: "Post not found" });
      return;
    }
    res.json({ data: post });
  } catch (err) {
    next(err);
  }
});
