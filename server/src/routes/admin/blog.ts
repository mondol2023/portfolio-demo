import { blogPostInputSchema, type BlogPost, type BlogPostInput } from "@portfolio/shared";
import { blogRepo } from "../../repos/blog-repo";
import { buildAdminCrudRouter } from "../../lib/admin-crud-route";
import { sanitizeRichText } from "../../lib/sanitize";
import { invalidateBlogCache } from "../blog";

export const adminBlogRouter = buildAdminCrudRouter<BlogPost, BlogPostInput>({
  entityLabel: "blog_post",
  inputSchema: blogPostInputSchema,
  updateInputSchema: blogPostInputSchema.partial(),
  getAll: () => blogRepo.getAll(),
  getById: (id) => blogRepo.getById(id),
  create: (input) => blogRepo.create(input),
  update: (id, patch) => blogRepo.updatePost(id, patch),
  remove: (id) => blogRepo.remove(id),
  invalidateCache: invalidateBlogCache,
  sortForList: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  sanitize: (input: Partial<BlogPostInput>) => ({
    ...input,
    ...(input.contentHtml !== undefined ? { contentHtml: sanitizeRichText(input.contentHtml) } : {}),
  }),
});
