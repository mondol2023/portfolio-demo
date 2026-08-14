import { z } from "zod";

/**
 * Flexible key/value settings store so the admin can edit site copy
 * (hero headline, about text, stats, social links) without touching code.
 */
export const siteContentEntrySchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().default(""),
  label: z.string().default(""),
  group: z.string().default("general"),
});
export type SiteContentEntry = z.infer<typeof siteContentEntrySchema>;

export type SiteContentMap = Record<string, string>;

/** Canonical keys the frontend expects to exist (seeded with defaults). */
export const SITE_CONTENT_KEYS = {
  heroName: "hero.name",
  heroHeadline: "hero.headline",
  heroDescription: "hero.description",
  heroAvatarUrl: "hero.avatarUrl",
  heroResumeUrl: "hero.resumeUrl",
  heroGithubUrl: "hero.githubUrl",
  heroLinkedinUrl: "hero.linkedinUrl",
  heroEmail: "hero.email",
  aboutIntro: "about.intro",
  aboutPhilosophy: "about.philosophy",
  aboutFocus: "about.focus",
  aboutYearsExperience: "about.yearsExperience",
  statsProjectsShipped: "stats.projectsShipped",
  statsHappyClients: "stats.happyClients",
  statsCommits: "stats.commits",
  statsCupsOfCoffee: "stats.cupsOfCoffee",
  contactEmail: "contact.email",
  contactLocation: "contact.location",
} as const;
