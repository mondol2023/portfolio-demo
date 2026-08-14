import { z } from "zod";
import { httpUrlSchema, optionalHttpUrlSchema, slugSchema } from "./common";

export const projectCategories = [
  "Full-Stack",
  "Frontend",
  "Backend",
  "Mobile",
  "DevOps",
  "Open Source",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export const projectSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(240),
  longDescriptionHtml: z.string().default(""),
  thumbnailUrl: httpUrlSchema,
  screenshotUrls: z.array(httpUrlSchema).max(12).default([]),
  technologies: z.array(z.string().trim().min(1)).max(24).default([]),
  category: z.enum(projectCategories),
  githubUrl: optionalHttpUrlSchema,
  liveUrl: optionalHttpUrlSchema,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  problem: z.string().default(""),
  solution: z.string().default(""),
  architecture: z.string().default(""),
  features: z.array(z.string()).max(20).default([]),
  challenges: z.string().default(""),
  lessonsLearned: z.string().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export const projectInputSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type ProjectInput = z.infer<typeof projectInputSchema>;
