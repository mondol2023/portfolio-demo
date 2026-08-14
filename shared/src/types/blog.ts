import { z } from "zod";
import { httpUrlSchema, slugSchema } from "./common";

export const blogStatuses = ["draft", "published", "scheduled"] as const;
export type BlogStatus = (typeof blogStatuses)[number];

export const blogPostSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(160),
  coverImageUrl: httpUrlSchema,
  excerpt: z.string().trim().min(1).max(280),
  contentHtml: z.string().default(""),
  tags: z.array(z.string().trim().min(1)).max(12).default([]),
  status: z.enum(blogStatuses).default("draft"),
  publishedAt: z.string().nullable(),
  scheduledAt: z.string().nullable().default(null),
  author: z.string().default("Alex Rivera"),
  readingTimeMinutes: z.number().int().positive().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogPostInputSchema = blogPostSchema.omit({
  id: true,
  readingTimeMinutes: true,
  createdAt: true,
  updatedAt: true,
});
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
