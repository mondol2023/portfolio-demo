import { z } from "zod";

export const skillCategories = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Tools",
  "Other",
] as const;
export type SkillCategory = (typeof skillCategories)[number];

/** Deliberately a leveled enum, not a decorative percentage. */
export const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type SkillLevel = (typeof skillLevels)[number];

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(60),
  category: z.enum(skillCategories),
  iconKey: z.string().trim().min(1),
  level: z.enum(skillLevels),
  yearsExperience: z.number().min(0).max(50).optional(),
  relatedTechnologies: z.array(z.string().trim().min(1)).max(12).default([]),
  order: z.number().int().default(0),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillInputSchema = skillSchema.omit({ id: true });
export type SkillInput = z.infer<typeof skillInputSchema>;
