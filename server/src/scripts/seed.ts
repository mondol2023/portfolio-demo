import bcrypt from "bcryptjs";
import {
  demoProjects,
  demoBlogPosts,
  demoSkills,
  demoExperience,
  demoSiteContent,
} from "@portfolio/shared";
import { env, useSheetsAdapter } from "../config/env";
import { projectsRepo } from "../repos/projects-repo";
import { blogRepo } from "../repos/blog-repo";
import { skillsRepo } from "../repos/skills-repo";
import { experienceRepo } from "../repos/experience-repo";
import { siteContentRepo } from "../repos/site-content-repo";
import { adminUsersRepo } from "../repos/admin-users-repo";

/** Human labels for the demo site-content keys — purely cosmetic (shown as the admin's field label in Phase 10). */
const SITE_CONTENT_LABELS: Record<string, string> = {
  "hero.name": "Hero — Name",
  "hero.headline": "Hero — Headline",
  "hero.description": "Hero — Tagline",
  "hero.avatarUrl": "Hero — Avatar image URL",
  "hero.resumeUrl": "Hero — Resume URL",
  "hero.githubUrl": "Hero — GitHub URL",
  "hero.linkedinUrl": "Hero — LinkedIn URL",
  "hero.email": "Hero — Email",
  "about.intro": "About — Bio",
  "about.philosophy": "About — Philosophy",
  "about.focus": "About — Focus areas",
  "about.yearsExperience": "About — Years of experience",
  "stats.projectsShipped": "Stats — Projects shipped",
  "stats.happyClients": "Stats — Happy clients",
  "stats.commits": "Stats — Commits this year",
  "stats.cupsOfCoffee": "Stats — Cups of coffee",
  "contact.email": "Contact — Email",
  "contact.location": "Contact — Location",
};

function groupForKey(key: string): string {
  return key.split(".")[0] ?? "general";
}

/**
 * Idempotent: only seeds an entity whose store is currently empty, so
 * re-running this against a live Sheet after the admin has made real edits
 * never clobbers them. Run via `npm run seed` (root) / `npm run seed -w server`.
 */
async function seed(): Promise<void> {
  console.log(`Seeding via ${useSheetsAdapter ? "Google Sheets" : "local JSON files (server/.data)"} adapter...\n`);

  const existingProjects = await projectsRepo.getAll();
  if (existingProjects.length === 0) {
    await projectsRepo.replaceAll(demoProjects);
    console.log(`✅ Projects: seeded ${demoProjects.length}`);
  } else {
    console.log(`⏭  Projects: already has ${existingProjects.length} row(s), skipped`);
  }

  const existingPosts = await blogRepo.getAll();
  if (existingPosts.length === 0) {
    await blogRepo.replaceAll(demoBlogPosts);
    console.log(`✅ BlogPosts: seeded ${demoBlogPosts.length}`);
  } else {
    console.log(`⏭  BlogPosts: already has ${existingPosts.length} row(s), skipped`);
  }

  const existingSkills = await skillsRepo.getAll();
  if (existingSkills.length === 0) {
    await skillsRepo.replaceAll(demoSkills);
    console.log(`✅ Skills: seeded ${demoSkills.length}`);
  } else {
    console.log(`⏭  Skills: already has ${existingSkills.length} row(s), skipped`);
  }

  const existingExperience = await experienceRepo.getAll();
  if (existingExperience.length === 0) {
    await experienceRepo.replaceAll(demoExperience);
    console.log(`✅ Experience: seeded ${demoExperience.length}`);
  } else {
    console.log(`⏭  Experience: already has ${existingExperience.length} row(s), skipped`);
  }

  const existingSiteContent = await siteContentRepo.getAll();
  if (existingSiteContent.length === 0) {
    const entries = Object.entries(demoSiteContent).map(([key, value]) => ({
      key,
      value,
      label: SITE_CONTENT_LABELS[key] ?? key,
      group: groupForKey(key),
    }));
    await siteContentRepo.replaceAll(entries);
    console.log(`✅ SiteContent: seeded ${entries.length} key(s)`);
  } else {
    console.log(`⏭  SiteContent: already has ${existingSiteContent.length} key(s), skipped`);
  }

  const existingAdmin = await adminUsersRepo.findByEmail(env.SEED_ADMIN_EMAIL);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);
    await adminUsersRepo.create({ email: env.SEED_ADMIN_EMAIL, passwordHash });
    console.log(`✅ AdminUsers: created ${env.SEED_ADMIN_EMAIL}`);
    if (env.SEED_ADMIN_PASSWORD.startsWith("ChangeMe")) {
      console.log(`   ⚠️  Using the default seed password — change it before deploying (SEED_ADMIN_PASSWORD in .env).`);
    }
  } else {
    console.log(`⏭  AdminUsers: ${env.SEED_ADMIN_EMAIL} already exists, skipped`);
  }

  console.log("\nDone.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
