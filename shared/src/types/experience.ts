import { z } from "zod";

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().trim().min(1).max(120),
  position: z.string().trim().min(1).max(120),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().default(""),
  responsibilities: z.array(z.string()).max(20).default([]),
  technologies: z.array(z.string()).max(24).default([]),
  order: z.number().int().default(0),
});
export type Experience = z.infer<typeof experienceSchema>;

export const experienceInputSchema = experienceSchema.omit({ id: true });
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
