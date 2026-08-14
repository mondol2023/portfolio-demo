import type { Project } from "./types/project";
import type { BlogPost } from "./types/blog";
import type { Skill } from "./types/skill";
import type { Experience } from "./types/experience";
import { SITE_CONTENT_KEYS, type SiteContentMap } from "./types/site-content";

/**
 * Realistic placeholder content for the "Alex Rivera" persona, shared by the
 * client (renders it directly until Phase 8 wires the real API) and the
 * server seed script (Phase 8, loads this into the JsonFileAdapter/Sheets on
 * first run). Swappable later via the admin CMS — nothing here is meant to
 * ship as real production copy.
 *
 * Images are free, no-attribution, hotlink-safe placeholder services — no
 * uploads, no AI generation, per the "images are URL links only" decision:
 *  - Avatars: i.pravatar.cc (free stock headshot placeholder service)
 *  - Project/blog covers: picsum.photos (free stock photo placeholder,
 *    seeded per-slug so each item gets a stable, distinct image)
 */

export const DEMO_AVATAR_URL = "https://i.pravatar.cc/480?img=68";

export function demoCoverUrl(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export const demoProfile = {
  name: "Alex Rivera",
  title: "Full-Stack Software Engineer",
  tagline: "I build fast, accessible, delightfully animated web products.",
  location: "Lisbon, Portugal (remote-friendly)",
  avatarUrl: DEMO_AVATAR_URL,
  email: "hello@alexrivera.dev",
  githubUrl: "https://github.com/alexrivera-dev",
  linkedinUrl: "https://www.linkedin.com/in/alexrivera-dev",
  resumeUrl: "https://picsum.photos/seed/alex-rivera-resume/1/1", // placeholder link target
  bio: "I'm a full-stack engineer with 7+ years shipping production React/Node systems for startups and scale-ups — from real-time dashboards to CMS-driven marketing sites. I care most about interfaces that feel fast and alive: considered motion, real accessibility, and code that's still pleasant to read a year later.",
  philosophy:
    "Good software is judged in milliseconds and edge cases. I sweat both — performance budgets and the keyboard-only pass get the same attention as the happy path.",
  focus: "React ecosystems, TypeScript, Node/Express APIs, and interaction design that respects prefers-reduced-motion.",
} as const;

export const demoStats = {
  projectsShipped: 42,
  happyClients: 18,
  commits: 6300,
  cupsOfCoffee: 2100,
} as const;

const now = new Date().toISOString();

export const demoProjects: Project[] = [
  {
    id: "proj-1",
    slug: "pulse-analytics",
    title: "Pulse Analytics",
    shortDescription: "Real-time product analytics dashboard with sub-second event streaming.",
    longDescriptionHtml: "",
    thumbnailUrl: demoCoverUrl("pulse-analytics", 800, 500),
    screenshotUrls: [
      demoCoverUrl("pulse-analytics-1", 1200, 750),
      demoCoverUrl("pulse-analytics-2", 1200, 750),
    ],
    technologies: ["React", "TypeScript", "Node.js", "WebSockets", "Redis", "PostgreSQL"],
    category: "Full-Stack",
    githubUrl: "https://github.com/alexrivera-dev/pulse-analytics",
    liveUrl: "https://pulse-analytics.example.com",
    featured: true,
    published: true,
    order: 0,
    problem: "The team was flying blind between weekly batch reports, missing regressions for days.",
    solution:
      "Built a WebSocket-based ingestion pipeline with a live dashboard, cutting detection time from days to seconds.",
    architecture:
      "React + TanStack Query front end, Express/WS gateway, Redis Streams for buffering, PostgreSQL for durable storage, materialized views refreshed on a rolling window.",
    features: ["Live event stream", "Custom funnels", "Alerting rules", "Role-based dashboards"],
    challenges: "Keeping the UI responsive under high event throughput without dropping frames.",
    lessonsLearned: "Windowed aggregation server-side beats trying to throttle the client — push less, not slower.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-2",
    slug: "shelfwise",
    title: "Shelfwise",
    shortDescription: "Inventory management SaaS for independent bookstores.",
    longDescriptionHtml: "",
    thumbnailUrl: demoCoverUrl("shelfwise", 800, 500),
    screenshotUrls: [demoCoverUrl("shelfwise-1", 1200, 750)],
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
    category: "Full-Stack",
    githubUrl: "https://github.com/alexrivera-dev/shelfwise",
    liveUrl: "https://shelfwise.example.com",
    featured: true,
    published: true,
    order: 1,
    problem: "Small bookstores were tracking stock in spreadsheets, losing sales to phantom stockouts.",
    solution: "Shipped a lightweight inventory + POS-sync tool tailored to single-location retailers.",
    architecture: "Next.js App Router, Prisma/PostgreSQL, Stripe Billing for subscriptions, barcode-scan PWA client.",
    features: ["Barcode scanning", "Low-stock alerts", "POS sync", "Multi-user roles"],
    challenges: "Designing an offline-tolerant scan flow for spotty in-store wifi.",
    lessonsLearned: "Optimistic local writes with a background sync queue solved 90% of the offline complaints.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-3",
    slug: "gridiron-cli",
    title: "Gridiron CLI",
    shortDescription: "Open-source scaffolding CLI for typed full-stack monorepos.",
    longDescriptionHtml: "",
    thumbnailUrl: demoCoverUrl("gridiron-cli", 800, 500),
    screenshotUrls: [demoCoverUrl("gridiron-cli-1", 1200, 750)],
    technologies: ["Node.js", "TypeScript", "Commander.js"],
    category: "Open Source",
    githubUrl: "https://github.com/alexrivera-dev/gridiron-cli",
    liveUrl: undefined,
    featured: false,
    published: true,
    order: 2,
    problem: "Every new side project meant re-solving the same monorepo/tooling setup from scratch.",
    solution: "Published a CLI that scaffolds a typed client/server/shared monorepo in under a minute.",
    architecture: "Single Node CLI package, template-driven file generation, interactive prompts via Commander.",
    features: ["Interactive scaffolding", "Pluggable templates", "Zero-config TS + ESLint + Prettier"],
    challenges: "Keeping generated templates from rotting as upstream tool versions moved.",
    lessonsLearned: "Pinning template dependencies and testing generation in CI caught drift early.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "proj-4",
    slug: "wayfarer-mobile",
    title: "Wayfarer",
    shortDescription: "Offline-first trip planning app for backcountry hikers.",
    longDescriptionHtml: "",
    thumbnailUrl: demoCoverUrl("wayfarer-mobile", 800, 500),
    screenshotUrls: [demoCoverUrl("wayfarer-mobile-1", 1200, 750)],
    technologies: ["React Native", "TypeScript", "SQLite", "MapLibre"],
    category: "Mobile",
    githubUrl: "https://github.com/alexrivera-dev/wayfarer",
    liveUrl: undefined,
    featured: false,
    published: true,
    order: 3,
    problem: "Existing hiking apps required a signal to load maps and routes mid-trail.",
    solution: "Built a fully offline-capable planner with pre-downloaded vector tiles and local route storage.",
    architecture: "React Native + MapLibre GL vector tiles cached to disk, SQLite for trip/route data.",
    features: ["Offline vector maps", "GPX import/export", "Elevation profiles"],
    challenges: "Fitting compressed vector tiles for a full region within reasonable app storage.",
    lessonsLearned: "Tile pruning by zoom-level relevance cut storage by 60% with negligible UX loss.",
    createdAt: now,
    updatedAt: now,
  },
];

export const demoBlogPosts: BlogPost[] = [
  {
    id: "post-1",
    slug: "animating-with-intent",
    title: "Animating With Intent: A Framework for UI Motion",
    coverImageUrl: demoCoverUrl("animating-with-intent", 1200, 630),
    excerpt: "Most UI motion is decorative. Here's how I decide what should move, and why.",
    contentHtml: `
      <p>Most UI motion I see in the wild is decorative: a card fades in because someone added
      <code>framer-motion</code> and reached for the first example in the docs. It looks fine in isolation
      and adds up to noise across a whole product. Before I animate anything, I ask one question first.</p>
      <h2>Ask what the motion communicates</h2>
      <p>Every animation should answer one of a handful of questions for the user: where did this element come
      from, where is it going, what changed, or what's currently busy. If I can't name which of those an
      animation is answering, it's decoration, and decoration is the first thing that gets cut when a page
      feels slow.</p>
      <ul>
        <li><strong>Origin</strong> — a modal scales up from the trigger, not from nowhere</li>
        <li><strong>Continuity</strong> — a shared element (<code>layoutId</code>) crossfades between list and detail views instead of hard-cutting</li>
        <li><strong>Change</strong> — a value that updates gets a brief highlight, not a silent DOM swap</li>
        <li><strong>Status</strong> — a skeleton or spinner only appears past ~150ms, so it doesn't flash on fast responses</li>
      </ul>
      <h2>Duration and easing aren't decoration either</h2>
      <p>I keep a small token set — a handful of durations and two or three easing curves — and every animation
      in the product pulls from it. Ad hoc <code>duration: 0.3</code> scattered across components is how you end
      up with a page that feels inconsistent even though nothing is individually wrong.</p>
      <blockquote>If two different animations in the same view take different amounts of time to do
      conceptually similar things, the user feels that mismatch even if they can't articulate it.</blockquote>
      <h2>The reduced-motion branch is not optional</h2>
      <p>I write the <code>prefers-reduced-motion</code> branch at the same time as the animation, not as a
      pass at the end. It's rarely more than swapping a spring transition for an instant one — but it has to
      exist for every single animated element, not just the obvious hero ones. I wrote a full checklist for
      this in a <a href="/blog/reduced-motion-is-not-optional">follow-up post</a>.</p>
    `.trim(),
    tags: ["Frontend", "Animation", "UX"],
    status: "published",
    publishedAt: now,
    scheduledAt: null,
    author: "Alex Rivera",
    readingTimeMinutes: 7,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-2",
    slug: "sheets-as-a-database",
    title: "I Used Google Sheets as a Production Database. Here's What Broke.",
    coverImageUrl: demoCoverUrl("sheets-as-a-database", 1200, 630),
    excerpt: "Rate limits, eventual consistency, and the caching layer that made it viable.",
    contentHtml: `
      <p>For this site's CMS I used a Google Sheet as the primary data store instead of Postgres. It's not a
      real database — no transactions, weak concurrency guarantees, and an API quota that will bite you if you
      treat it like one. Here's what actually broke, and what made it viable anyway.</p>
      <h2>Rate limits</h2>
      <p>The Sheets API caps out around 300 read/write requests per minute per project. That's generous for an
      admin panel with one editor, and nowhere near enough if every visitor's page load triggers a live read.
      The fix was to never let a public request touch the Sheets API directly.</p>
      <h2>Eventual consistency and the cache-aside layer</h2>
      <p>Every repo read goes through a short-TTL in-memory cache. Public pages are always served from cache;
      an admin write invalidates the relevant cache entry immediately so edits show up on the next request
      without waiting out the TTL.</p>
      <pre><code>async function getProjects() {
  const cached = cache.get("projects");
  if (cached) return cached;
  const rows = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Projects" });
  const projects = rows.map(mapRowToProject);
  cache.set("projects", projects, { ttlMs: 45_000 });
  return projects;
}</code></pre>
      <p>Analytics events go through the same discipline in the other direction: writes are batched in-process
      and flushed every ~10 seconds or 20 events via a single <code>values.append</code> call, instead of one
      API call per pageview.</p>
      <h2>What I'd do differently</h2>
      <ul>
        <li>Add a background reconciliation job that re-warms the cache instead of relying purely on
          request-triggered misses</li>
        <li>Store analytics in something append-only and cheap (even SQLite) and only mirror rollups to the
          sheet for visibility</li>
        <li>Version the header row so a manual edit to column order doesn't silently break the row mapper</li>
      </ul>
      <p>Would I reach for this on a product with real traffic or write concurrency? No. For a personal site
      where the admin is one person editing content occasionally, it removed the need to run and pay for a
      database at all — and that trade was worth it here.</p>
    `.trim(),
    tags: ["Backend", "Architecture"],
    status: "published",
    publishedAt: now,
    scheduledAt: null,
    author: "Alex Rivera",
    readingTimeMinutes: 9,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "post-3",
    slug: "reduced-motion-is-not-optional",
    title: "prefers-reduced-motion Is Not Optional",
    coverImageUrl: demoCoverUrl("reduced-motion-is-not-optional", 1200, 630),
    excerpt: "A practical checklist for shipping motion-rich UI that's still accessible.",
    contentHtml: `
      <p><code>prefers-reduced-motion</code> isn't a niche preference. Vestibular disorders aside, plenty of
      people just enable it because they find large-scale motion distracting or nauseating on a laptop trackpad.
      If your product is "highly animated" as a selling point, this setting is not optional polish — it's a
      second, fully-supported mode your product has to work in.</p>
      <h2>The checklist</h2>
      <ol>
        <li>Every <code>motion.*</code> element with a non-trivial <code>animate</code> has a reduced-motion
          branch — either the animated props become <code>undefined</code>/static, or the transition duration
          collapses to near-zero</li>
        <li>Parallax and scroll-linked transforms (<code>useTransform</code> off <code>scrollYProgress</code>)
          are disabled outright under reduced motion, not just slowed down — residual scroll-jitter is still
          motion</li>
        <li>Infinite/ambient loops (orbiting badges, breathing glows, marquees) freeze to a static frame instead
          of continuing at a "calmer" speed</li>
        <li>Page transitions still change the DOM instantly — only the animated enter/exit is removed</li>
        <li>Nothing that conveys information (a loading state, a validation error) depends on motion alone to
          be noticed</li>
      </ol>
      <h2>Testing it</h2>
      <p>Don't rely on remembering to toggle it manually before every release. Wire a <code>useReducedMotion</code>
      hook once, wrap the primitives (<code>Reveal</code>, <code>PageTransition</code>) around it, and then
      actually flip the OS setting during QA:</p>
      <pre><code>@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}</code></pre>
      <p>That global CSS rule is a good safety net, but it's not a substitute for the component-level branches
      above — some effects (3D tilt, orbit transforms) are driven by JS motion values that this rule can't
      reach.</p>
    `.trim(),
    tags: ["Accessibility", "Animation"],
    status: "published",
    publishedAt: now,
    scheduledAt: null,
    author: "Alex Rivera",
    readingTimeMinutes: 5,
    createdAt: now,
    updatedAt: now,
  },
];

export const demoSkills: Skill[] = [
  { id: "sk-1", name: "React", category: "Frontend", iconKey: "react", level: "Expert", yearsExperience: 7, relatedTechnologies: ["TypeScript", "Redux"], order: 0 },
  { id: "sk-2", name: "TypeScript", category: "Frontend", iconKey: "typescript", level: "Expert", yearsExperience: 6, relatedTechnologies: [], order: 1 },
  { id: "sk-3", name: "Tailwind CSS", category: "Frontend", iconKey: "tailwindcss", level: "Advanced", yearsExperience: 4, relatedTechnologies: [], order: 2 },
  { id: "sk-4", name: "Framer Motion", category: "Frontend", iconKey: "framer", level: "Advanced", yearsExperience: 3, relatedTechnologies: [], order: 3 },
  { id: "sk-5", name: "Node.js", category: "Backend", iconKey: "nodejs", level: "Expert", yearsExperience: 7, relatedTechnologies: ["Express"], order: 4 },
  { id: "sk-6", name: "Express", category: "Backend", iconKey: "express", level: "Advanced", yearsExperience: 6, relatedTechnologies: [], order: 5 },
  { id: "sk-7", name: "PostgreSQL", category: "Database", iconKey: "postgresql", level: "Advanced", yearsExperience: 5, relatedTechnologies: [], order: 6 },
  { id: "sk-8", name: "Redis", category: "Database", iconKey: "redis", level: "Intermediate", yearsExperience: 3, relatedTechnologies: [], order: 7 },
  { id: "sk-9", name: "Docker", category: "DevOps", iconKey: "docker", level: "Advanced", yearsExperience: 4, relatedTechnologies: [], order: 8 },
  { id: "sk-10", name: "GitHub Actions", category: "DevOps", iconKey: "githubactions", level: "Advanced", yearsExperience: 4, relatedTechnologies: [], order: 9 },
  { id: "sk-11", name: "Figma", category: "Tools", iconKey: "figma", level: "Intermediate", yearsExperience: 3, relatedTechnologies: [], order: 10 },
  { id: "sk-12", name: "Google Cloud", category: "DevOps", iconKey: "googlecloud", level: "Intermediate", yearsExperience: 3, relatedTechnologies: [], order: 11 },
];

export const demoExperience: Experience[] = [
  {
    id: "exp-1",
    company: "Northwind Labs",
    position: "Senior Full-Stack Engineer",
    startDate: "2022-03-01",
    endDate: null,
    isCurrent: true,
    description: "Leading the product engineering team building the company's core analytics platform.",
    responsibilities: [
      "Own the front-end architecture for a real-time analytics dashboard used by 200+ B2B customers",
      "Introduced a design-token-based motion system, cutting animation review time in half",
      "Mentor 3 mid-level engineers and run fortnightly architecture reviews",
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    order: 0,
  },
  {
    id: "exp-2",
    company: "Fernbridge",
    position: "Full-Stack Engineer",
    startDate: "2019-06-01",
    endDate: "2022-02-01",
    isCurrent: false,
    description: "Built and shipped the company's customer-facing SaaS product from early beta to 10k users.",
    responsibilities: [
      "Built the billing and subscription system on Stripe from scratch",
      "Migrated the legacy jQuery front end to React incrementally with zero downtime",
      "Set up CI/CD pipelines that cut deploy time from 40 minutes to 6",
    ],
    technologies: ["React", "Express", "MongoDB", "Stripe", "Docker"],
    order: 1,
  },
  {
    id: "exp-3",
    company: "Studio Ampersand",
    position: "Front-End Developer",
    startDate: "2017-09-01",
    endDate: "2019-05-01",
    isCurrent: false,
    description: "Built marketing sites and interactive campaigns for agency clients.",
    responsibilities: [
      "Delivered 20+ animated marketing sites for clients across fintech and retail",
      "Introduced a shared component library that halved new-project build time",
    ],
    technologies: ["JavaScript", "GSAP", "Sass", "WordPress"],
    order: 2,
  },
];

export const demoSiteContent: SiteContentMap = {
  [SITE_CONTENT_KEYS.heroName]: demoProfile.name,
  [SITE_CONTENT_KEYS.heroHeadline]: demoProfile.title,
  [SITE_CONTENT_KEYS.heroDescription]: demoProfile.tagline,
  [SITE_CONTENT_KEYS.heroAvatarUrl]: demoProfile.avatarUrl,
  [SITE_CONTENT_KEYS.heroResumeUrl]: demoProfile.resumeUrl,
  [SITE_CONTENT_KEYS.heroGithubUrl]: demoProfile.githubUrl,
  [SITE_CONTENT_KEYS.heroLinkedinUrl]: demoProfile.linkedinUrl,
  [SITE_CONTENT_KEYS.heroEmail]: demoProfile.email,
  [SITE_CONTENT_KEYS.aboutIntro]: demoProfile.bio,
  [SITE_CONTENT_KEYS.aboutPhilosophy]: demoProfile.philosophy,
  [SITE_CONTENT_KEYS.aboutFocus]: demoProfile.focus,
  [SITE_CONTENT_KEYS.aboutYearsExperience]: "7",
  [SITE_CONTENT_KEYS.statsProjectsShipped]: String(demoStats.projectsShipped),
  [SITE_CONTENT_KEYS.statsHappyClients]: String(demoStats.happyClients),
  [SITE_CONTENT_KEYS.statsCommits]: String(demoStats.commits),
  [SITE_CONTENT_KEYS.statsCupsOfCoffee]: String(demoStats.cupsOfCoffee),
  [SITE_CONTENT_KEYS.contactEmail]: demoProfile.email,
  [SITE_CONTENT_KEYS.contactLocation]: demoProfile.location,
};
