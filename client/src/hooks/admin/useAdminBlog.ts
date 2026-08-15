import type { BlogPost, BlogPostInput } from "@portfolio/shared";
import { createAdminCrudHooks } from "./useAdminCrud";

export const {
  useAdminList: useAdminBlogPosts,
  useAdminItem: useAdminBlogPost,
  useAdminCreate: useCreateBlogPost,
  useAdminUpdate: useUpdateBlogPost,
  useAdminRemove: useRemoveBlogPost,
} = createAdminCrudHooks<BlogPost, BlogPostInput>("/api/admin/blog", "admin-blog-posts");
