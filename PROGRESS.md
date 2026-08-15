# Progress Tracker

Living status doc for the animated developer portfolio. Updated as work lands;
finished items get a ✅. See the approved plan for full architectural detail.

Legend: ✅ done · 🚧 in progress · ⬜ not started

## Phase 0 — Scaffolding

- ✅ npm workspaces root (`client`, `server`, `shared`)
- ✅ `shared` package: zod schemas/types for every entity (project, blog, skill,
  experience, site-content, admin, analytics, contact, audit-log, api)
- ✅ `server` package: Express app factory, env validation (zod, prod hard-fail
  on default secrets), health check, security headers scaffold (helmet/cors/
  cookie-parser), ESLint config
- ✅ `client` package: Vite + React 19 + TS, Tailwind v4 (CSS-first config),
  path aliases (`@/*`, `@portfolio/shared`), dev proxy to API, manual chunk
  splitting (vendor/motion/editor/charts), ESLint + Prettier, default
  boilerplate removed
- ✅ Root tooling: Prettier config/ignore, root `.gitignore`
- ✅ `PROGRESS.md` (this file)
- ✅ `README.md` (setup incl. Google Sheets service-account steps)
- ✅ `npm install` verified clean across all three workspaces (0 vulnerabilities;
  `esbuild` postinstall script reviewed and approved)
- ✅ `npm run dev` verified (client on :5173, server on :4000 `/api/health`) —
  fixed a zod env-parsing bug where blank `.env` keys (`FOO=`) were treated as
  defined empty strings instead of falling back to dev defaults
- ✅ `npm run typecheck` / `npm run lint` verified clean — fixed two TS 6.0 /
  Vite 8 issues: deprecated `baseUrl` (paths no longer need it) and
  `rollupOptions.manualChunks` needing the function form now that Vite 8 uses
  Rolldown instead of Rollup

## Phase 1 — Design system & animation foundation

- ✅ Tailwind theme tokens — neutral `base-*` scale + one distinct accent color
  per public section (`hero`/`about`/`skills`/`experience`/`projects`/`blog`/
  `contact`, requirement #24) + semantic state colors, all CSS-first `@theme`
  tokens in `client/src/index.css`
- ✅ Base UI kit: `Button`, `Card`, `Badge`, `Input`/`Textarea`, `Modal`
  (focus trap, Escape-close, scroll lock, `role="dialog"`), `Toast`
  (context/provider + `useToast` hook, `AnimatePresence mode="sync"` stack),
  `Skeleton` — barrel export at `client/src/components/ui/index.ts`
- ✅ Motion foundation hand-authored (the plan's referenced `motion-foundations`
  skill isn't available in this environment): `client/src/lib/animations/tokens.ts`
  (`motionTokens` duration/easing/scale/distance + `springs` gentle/snappy/slow)
  and `client/src/lib/animations/variants.ts` (`fadeIn`, `fadeUp`, `fadeDown`,
  `slideIn`, `scaleIn`, `staggerContainer`, `pageTransition`, `modalTransition`)
- ✅ `useReducedMotion`/`useSafeMotion` hook + `<Reveal>` (scroll-triggered,
  `viewport={{ once: true }}`) + `<PageTransition>` (`AnimatePresence
  mode="wait"` keyed on route pathname) components; `<MotionConfig
  reducedMotion="user">` + `<ToastProvider>` wired into `main.tsx`
- ✅ `npm run typecheck` / `npm run lint` clean; `npm run dev` boot + client
  200 / server `/api/health` check verified

## Phase 2 — Navbar + layout shell

- ✅ Scroll-aware navbar (transparent → blurred, hide on scroll down / show on
  scroll up, `layoutId` active-section indicator via `useScrollDirection` +
  `useActiveSection` [`IntersectionObserver`, `rootMargin: "-40% 0px -55% 0px"`])
- ✅ Mobile menu (`AnimatePresence`)
- ✅ React Router skeleton — `RootLayout` (skip-link, navbar, `<main
  id="main-content" className="flex-1 pt-16">`, footer), full public route
  tree (`/`, `/projects(+/:slug)`, `/blog(+/:slug)`, `/privacy`, `*` 404) +
  14 flat `/admin/*` stub routes, `<PageTransition>` wired at layout level,
  `useScrollToHash` for anchor-nav from other routes back to `/#section`
- ✅ Demo content pass (not originally itemized, added this phase): 
  `shared/src/demo-data.ts` — full placeholder dataset (profile, stats, 4
  projects, 3 blog posts, 12 skills, 3 experience roles, site content) built
  in the `shared` package so Phase 8's seed script can reuse it verbatim.
  Images are free, no-key, no-attribution hotlinks only (`i.pravatar.cc` for
  the avatar, `picsum.photos/seed/{slug}/...` for project/blog covers) —
  consistent with the plan's URL-only image architecture. `HomePage.tsx`
  now renders real-looking content across all 7 sections instead of "coming
  soon" placeholders.
- ✅ Typography fix (found while applying `artifact-design` principles):
  `index.css` referenced "Inter"/"JetBrains Mono" font-family names with no
  actual `<link>`/`@font-face` loading them — silent fallback to system
  fonts. Added Google Fonts `<link>` (Fraunces variable + Inter + JetBrains
  Mono) to `client/index.html`, plus a `--font-display` (Fraunces) token
  scoped to `h1`/`h2` only (serif headline / sans UI contrast — avoids the
  generic "Inter for everything" default)
- ✅ `npm run typecheck` (shared + client) / `npm run lint` (client) clean;
  `npm run dev` boot + client 200 (`/`, `/projects`, `/privacy`, unknown
  route → 404 page) + server `/api/health` 200 verified

## Phase 3 — Hero + About

- ✅ Hero: staggered text reveal (`staggerContainer`/`fadeUp` variants, no
  more ad hoc per-element delays), scroll parallax (`useScroll` +
  `useTransform` on the hero section — content drifts/fades as it scrolls
  past), CTAs (GitHub/LinkedIn/View projects/Resume download), all gated
  behind `prefers-reduced-motion`
- ✅ Animated SVG/CSS "developer + orbiting tech logos" illustration
  (`components/hero/HeroIllustration.tsx`): center avatar ringed by 6
  continuously-orbiting brand-colored tech badges (React/TypeScript/Node/
  Tailwind/PostgreSQL/Docker via `react-icons/si`, counter-rotated so each
  glyph stays upright), ambient breathing glow, mouse-follow 3D tilt
  (`useMotionValue`/`useSpring`) — freezes to static under reduced motion.
  New shared `lib/tech-icons.tsx` brand icon/color map (reusable by the
  Phase 4 skills grid)
- ✅ About section animated counters (`components/animations/AnimatedCounter.tsx`
  — spring-driven count-up on scroll-into-view via `useInView`, updates the
  DOM directly through a motion-value subscription rather than `setState`
  per frame; jumps straight to the final value under reduced motion)
- ✅ `npm run typecheck` / `npm run lint` (client) clean; `npm run dev` HMR
  verified with no transform errors, client 200

## Phase 4 — Skills + Experience

- ✅ Skills grouped by category, each row shows its brand icon (shared
  `lib/tech-icons.tsx` map), name, and a 4-dot `SkillLevelDots` proficiency
  indicator against the `Beginner→Expert` enum — a discrete, honest
  indicator, never a decorative percentage bar. Rows stagger in via
  `staggerContainer`/`fadeUp` on `whileInView`
- ✅ Experience animated timeline: a static track line + a second line on
  top that scroll-draws itself (`scaleY` driven by `useScroll`/
  `useTransform` over the timeline's own scroll range) as the section
  scrolls into view, plus a per-role marker dot (accent-filled for the
  current role, muted for past roles)
- ✅ `npm run typecheck` / `npm run lint` (client) clean; `npm run dev` HMR
  verified with no transform errors, client 200

## Phase 5 — Projects

- ✅ Shared `components/projects/ProjectCard.tsx` (used by both the home
  page's featured picks and the full grid — no more duplicated card markup)
- ✅ `/projects` grid with category filters — animated pill filter bar
  (`layoutId` active-pill indicator) + `AnimatePresence mode="popLayout"` +
  `layout` grid reflow when the filter changes, empty state for a category
  with no matches
- ✅ Project detail page (`/projects/:slug`) — full case-study layout:
  category/featured badges, tech stack, live/source CTAs, cover image,
  Problem/Solution/Architecture/Challenges/Lessons-learned sections (only
  rendered when the demo data actually has copy for them), key-features
  checklist, screenshot gallery; graceful "project not found" state with a
  back-to-grid CTA instead of a broken page
- ✅ Fixed a latent SPA bug while here: the "View all projects" button used
  `window.location.href` (full page reload) instead of `useNavigate()` —
  now a proper client-side route change
- ✅ `npm run typecheck` / `npm run lint` (client) clean; `npm run dev` HMR
  verified with no transform errors; `/projects`, `/projects/:slug` (real +
  unknown slug) all 200

## Phase 6 — Blog

- ✅ Real demo rich-text content authored for all 3 placeholder posts
  (`shared/src/demo-data.ts` `contentHtml` — headings/lists/blockquote/code
  blocks) instead of shipping empty strings, so both this phase and the
  future Phase 10 Tiptap editor have real content to render/edit
- ✅ `@tailwindcss/typography` wired in (`@plugin` in `index.css`, was already
  a devDependency but unregistered) with a `.prose-blog` retokenization onto
  the site's own palette/fonts (serif headings, mono inline code, blog-accent
  links/quote border) instead of the plugin's default look
- ✅ Shared `components/blog/BlogCard.tsx` (used by both the home page's
  recent-writing preview and the full `/blog` grid — same pattern as
  Phase 5's `ProjectCard`)
- ✅ `/blog` list with tag filters — animated pill filter bar (`layoutId`)
  + `AnimatePresence mode="popLayout"` + `layout` grid reflow, only
  `status: "published"` posts shown, sorted newest-first, empty state per tag
- ✅ Blog detail page (`/blog/:slug`) — tags/title/author/date/reading-time
  meta, cover image, sanitized rich-text render (`client/src/lib/sanitize.ts`
  — DOMPurify with an explicit tag/attribute allowlist and a scheme-restricted
  URL regexp, applied client-side in front of `dangerouslySetInnerHTML`;
  server-side sanitization on save lands in Phase 10 as defense in depth,
  per the plan's security model); graceful "post not found" state for an
  unknown or unpublished slug
- ✅ Home page's "Recent writing" section now uses the shared `BlogCard` +
  gained a "View all posts" CTA (`useNavigate`) — same consistency pass
  applied to Projects in Phase 5
- ✅ `npm run typecheck` (shared + client) / `npm run lint` (client) clean;
  `npm run dev` HMR verified with no transform errors; `/blog`, `/blog/:slug`
  (all 3 real posts + unknown slug) all 200

## Phase 7 — Contact

- ✅ `server/src/lib/sanitize.ts` — `stripHtml`/`sanitizeRichText` via DOMPurify
  running against a module-level singleton `jsdom` window (constructed once,
  not per-request, since this sits on the hot contact-submission path and
  will also back Phase 10's Tiptap content saves); `sanitizeRichText`'s
  allowlist mirrors the client-side one from Phase 6 for later reuse
- ✅ `POST /api/contact` (`server/src/routes/contact.ts`) — zod-validated via
  the shared `contactInputSchema`, honeypot (`company` field) returns a fake
  200 without persisting, salted IP hash only (`hashIp`, never the raw IP)
  passed to `contactRepo.create`, free-text fields stripped of markup before
  storage as defense in depth, mounted behind the existing 5-req/15-min
  `contactRateLimiter` in `app.ts`
- ✅ Fixed a real bug found during manual verification: the shared
  `contactInputSchema`'s honeypot field was `z.string().max(0)...`, which
  made zod itself reject any bot-filled value with a 400 *before* the route's
  honeypot check ever ran — bots got a `validation_error` response that
  leaks the anti-spam mechanism instead of the intended silent fake-success.
  Loosened to `z.string().max(200)...` so a filled-in value passes validation
  and reaches the route's fake-200 branch as designed.
- ✅ `client/src/lib/api.ts` — `postJson`/`ApiError` fetch wrapper (relative
  `/api/*` paths only, dev-proxied by Vite, no base URL needed)
- ✅ `client/src/components/contact/ContactForm.tsx` — `react-hook-form` +
  `zodResolver(contactInputSchema)` (shared schema, so client/server
  validation stay in lockstep), reuses the Phase 1 `Input`/`Textarea`/
  `Button` kit and `useToast`, off-screen (not `display:none`) ARIA-hidden
  honeypot field, distinct toast copy for the 429 rate-limit case vs. field-
  level `setError` for 400s vs. a generic error toast, `reset()` on success
- ✅ Home page Contact section wired to the real form (secondary "prefer
  email?" mailto link kept below it); doc comment at the top of
  `HomePage.tsx` updated to drop the "Phase 7 will enhance" placeholder note
- ✅ `npm run typecheck` (shared + client + server) / `npm run lint` (client +
  server) clean
- ✅ Manually verified against the running dev server: valid submission
  (201, persisted to `server/.data/contact-submissions.json` with a hashed
  IP and no raw IP), validation error (400, per-field messages), honeypot
  (200 fake-success, confirmed *not* persisted), 5-req/15-min rate limit
  (429 with `Retry-After` on the 6th request) — all confirmed via direct
  `curl` against `POST /api/contact`; test rows cleared from the local JSON
  store afterward
- ⚠️ Known limitation (found this phase, deferred — not yet fixed): TS
  `"paths"` aliasing (`@portfolio/shared` → `../shared/src/index.ts`) only
  affects type-checking, not emitted JS. `tsc`-compiled server output will
  still contain a literal `import ... from "@portfolio/shared"` that plain
  `node` can't resolve, since `@portfolio/shared`'s `package.json` points
  `main`/`types` at uncompiled `.ts`. Dev (`tsx watch`) is unaffected; only
  `npm run build && npm run start` breaks. To fix before any real deploy —
  bundle the server build (`tsup`/`esbuild`), add `tsc-alias`, or use TS
  project references. Plan to resolve at the start of Phase 8, since nearly
  every new repo file will import `@portfolio/shared`.

## Phase 8 — Backend data layer

- ✅ Fixed the Phase 7 build-blocker first, as planned: switched
  `server`'s build from raw `tsc` to `tsup` (esbuild-based bundler), which
  resolves the `paths`-only `@portfolio/shared` alias at bundle time instead
  of leaving a literal unresolvable `import ... from "@portfolio/shared"` in
  the emitted output. `npm run build -w server && npm run start -w server`
  now works against a plain `node dist/index.js`, no `tsc-alias`/project-
  references workaround needed.
- ✅ Google Sheets adapter infra (`server/src/repos/sheets/`):
  `google-sheets-client.ts` (lazy-initialized `googleapis` v4 client from a
  service-account JSON key env var, throws a clear config error rather than
  a cryptic googleapis one if unset), a generic `sheets-table.ts` (header-row
  → typed-object row mapper usable by every entity, `values.get`/`.update`/
  `.append`/batch-clear helpers), and `cache.ts` (in-memory TTL cache-aside,
  ~45s TTL for public reads, explicit `invalidate(key)` called by every admin
  write path once Phase 10 lands)
- ✅ `JsonFileAdapter` (`server/src/repos/json/`) — same repo interfaces,
  backed by JSON files under `server/.data/`; auto-selected whenever
  `GOOGLE_SERVICE_ACCOUNT_*`/`GOOGLE_SHEET_ID` env vars are absent, so
  `npm run dev` runs fully locally with zero external config. Which adapter
  is active is decided once at startup behind a single repo factory —
  route/controller code never knows which one it's talking to.
- ✅ Repos built against the shared interface for every entity: `projects`,
  `blog`, `skills`, `experience`, `site-content` (key/value settings map),
  `admin-users`, `analytics`, `audit-log` — plus the existing Phase 7
  `contact-repo` refactored onto the same adapter-selection pattern instead
  of its own bespoke JSON-file logic.
- ✅ Seed script (`server/src/scripts/seed.ts`) — pushes the Phase 2/6
  `shared/src/demo-data.ts` placeholder dataset (profile → site-content,
  4 projects, 3 blog posts, 12 skills, 3 experience roles) into whichever
  adapter is active, plus seeds one bcrypt-hashed admin user from
  `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars for Phase 9's login.
  Idempotent (safe to re-run — clears each sheet/file before writing).
- ✅ Public routers built and mounted on `/api`: `GET /projects`,
  `GET /projects/:slug`, `GET /blog`, `GET /blog/:slug`, `GET /skills`,
  `GET /experience`, `GET /site-content` — all read-through the cache-aside
  layer, all zod-validated at the boundary, unpublished/unknown slugs 404
  server-side (`GET /blog/:slug` checks `status === "published"`) instead of
  leaking draft content to the public API.
- ✅ Verified every new endpoint via direct `curl` against the running dev
  server (`/api/projects`, `/api/projects/:slug` real + unknown,
  `/api/blog`, `/api/blog/:slug` real + unknown + unpublished,
  `/api/skills`, `/api/experience`, `/api/site-content`) — correct shapes,
  correct 404s, before touching the frontend.
- ✅ Frontend fully rewired onto the real API, replacing every remaining
  `@portfolio/shared` demo-data import in `client/src`: `client/src/hooks/
  useApiQueries.ts` (TanStack Query v5 — `useSiteContent`, `useProjects`,
  `useProject(slug)`, `useBlogPosts`, `useBlogPost(slug)`, `useSkills`,
  `useExperience`; detail-by-slug hooks use `enabled: Boolean(slug)` +
  `retry: false` so a 404 resolves immediately instead of retrying).
  `HomePage`, `ProjectsPage`, `ProjectDetailPage`, `BlogPage`,
  `BlogDetailPage`, `Footer`, and `PrivacyPage` all migrated — each
  section/page gates independently on its own query's `isLoading` (a
  `Skeleton` placeholder sized to match the real content) rather than one
  page-level spinner, so a slow endpoint never blocks the rest of the page
  from painting. Detail-page "not found" states are now driven by the
  query's `isError`/`!data` result instead of a client-side `Array.find()`
  miss. `PrivacyPage`'s section copy (previously a module-level `const`
  reading `demoProfile.email` directly) was converted to a `buildSections
  (email)` function called inside the component so it can pull the email
  from `useSiteContent()`. Confirmed via grep: zero remaining references to
  `demoProfile`/`demoStats`/`demoProjects`/`demoBlogPosts`/`demoSkills`/
  `demoExperience`/`demoSiteContent`/`demoCoverUrl` anywhere in `client/src`.
- ✅ `npm run typecheck` / `npm run lint` / `npm run build` all clean across
  every workspace (`shared`, `server`, `client`) — including the
  `react-hooks/exhaustive-deps` warning caught and fixed in `ProjectsPage.tsx`
  (`projects ?? []` allocated a fresh array every render as a `useMemo`
  dependency; wrapped it in its own `useMemo(() => projects ?? [], [projects])`
  so it's referentially stable). Production `client` build: 452.5 kB main
  chunk (141.2 kB gzip) + separate `motion` chunk, `server` build via `tsup`:
  54.2 kB ESM bundle.
- ✅ Manually verified against the running dev servers (client on `:5173`
  proxying `/api` to server on `:4000`): `/api/health`, `/api/site-content`,
  `/api/projects`, `/api/blog` all return real seeded data with correct
  shapes over `curl`, confirming the public API is live end-to-end and the
  frontend has real data to render against.

## Phase 9 — Admin auth

- ✅ Backend auth primitives (`server/src/lib/`): `jwt.ts` (`signAccessToken`/
  `verifyAccessToken`, 15m expiry; `signRefreshToken`/`verifyRefreshToken`, 7d),
  `csrf.ts` (`generateCsrfToken` + shared cookie/header name constants),
  `auth-cookies.ts` (`setRefreshCookie`/`clearRefreshCookie` — httpOnly,
  `Secure` in prod, `SameSite=Strict`, scoped to `/api/admin/auth`; `setCsrfCookie`/
  `clearCsrfCookie` — deliberately *not* httpOnly, `Path=/`, so client JS can
  mirror it into a request header)
- ✅ `middleware/auth.ts` (`requireAdminAuth` — validates the `Authorization:
  Bearer` access token, attaches `req.admin`) and `middleware/csrf.ts`
  (`requireCsrf` — double-submit check, cookie value must match the
  `X-CSRF-Token` header; not yet wired into any route since no mutating admin
  endpoints exist until Phase 10)
- ✅ `middleware/rate-limit.ts` gained `loginRateLimiter` (10 attempts/15min),
  applied only to the `POST /login` handler inside `auth.ts` (not router-wide)
  so `/me` and `/refresh` — called on every page load/session check — aren't
  throttled by the login limit
- ✅ `routes/auth.ts` mounted at `/api/admin/auth`: `POST /login` (zod-validated
  via the existing shared `loginInputSchema`, `bcrypt.compare` always runs even
  against a fixed dummy hash when the email isn't found, so response timing
  can't leak account existence; signs+returns an access token, sets refresh +
  CSRF cookies, records a `login`/`login_failed` audit row), `POST /refresh`
  (verifies the refresh cookie, rotates both refresh and CSRF cookies, returns
  a fresh `LoginResponse`; clears cookies and 401s on an invalid/missing token
  or a deleted user), `POST /logout` (clears both cookies, best-effort
  `logout` audit row, always `{ success: true }`), `GET /me` (behind
  `requireAdminAuth`, returns the current user)
- ✅ Frontend session layer: `lib/adminAuthStore.ts` (plain module-level
  external store — `idle`/`loading`/`authenticated`/`unauthenticated` — read
  reactively via `useSyncExternalStore` in `hooks/useAdminAuth.ts`, and read
  directly/non-reactively inside `lib/adminApi.ts` so the fetch wrapper can
  attach the `Authorization` header without prop-drilling), `lib/csrf.ts`
  (`readCsrfToken` parses `document.cookie`), `lib/adminApi.ts`
  (`adminLogin`/`adminRefresh`/`adminLogout` + a generic `adminApiFetch<T>`
  for future CRUD calls that attaches `X-CSRF-Token` on mutating methods,
  catches a 401 with one silent refresh-and-retry, and always sends
  `credentials: "include"`)
- ✅ `components/admin/ProtectedRoute.tsx` — on first mount with `status ===
  "idle"` (e.g. a hard page reload), silently calls `adminRefresh()` off the
  httpOnly refresh cookie before deciding whether to redirect, so a reload
  never bounces an already-signed-in admin; shows a spinner while
  `idle`/`loading`, redirects to `/admin/login` (preserving the attempted
  location in router state) when `unauthenticated`, renders `<Outlet />` when
  `authenticated`
- ✅ `pages/admin/AdminLoginPage.tsx` — `react-hook-form` + `zodResolver
  (loginInputSchema)` (same schema as the server, client/server validation
  stay in lockstep, mirrors the Phase 7 `ContactForm` pattern), redirects
  immediately via `<Navigate>` if a session is already restored, distinct
  toast copy for 401/400 vs. 429 (rate-limited) vs. a generic failure
- ✅ `components/admin/AdminLayout.tsx` — dashboard shell every authenticated
  `/admin/*` route renders into: desktop sidebar (always visible `lg:flex`) +
  animated mobile overlay sidebar, nav items for all 8 admin sections each
  with a `react-icons/fi` icon and `layoutId`-free active-link styling via
  `NavLink`, top bar showing the signed-in email + a sign-out action
- ✅ `pages/admin/AdminDashboardPage.tsx` — welcome/landing view at `/admin`
  with placeholder cards for Content/Analytics/Audit-log, each noting the
  phase that will populate it
- ✅ `App.tsx` restructured: `/admin/login` renders standalone (public);
  every other `/admin/*` route now nests under `<ProtectedRoute>` →
  `<AdminLayout>`, with CRUD/analytics routes still rendering the Phase
  10/11 `RouteStub` placeholder but now behind the real auth gate
- ✅ `npm run typecheck` / `npm run lint` / `npm run build` clean across
  `shared`, `server`, `client` — fixed two strict-mode issues surfaced only
  by `tsc --noEmit`: a `navItems as const` union type in `AdminLayout.tsx`
  that only gave the first array element an `end` property (switched to an
  explicit typed array), and an optional-chaining gap in `csrf.ts`'s regex
  match indexing (`match?.[1]` instead of `match[1]`)
- ✅ Manually verified the full flow end-to-end against the running dev
  server with the seeded admin credentials (`curl`, cookie jar): `POST
  /login` → 200, correct `Set-Cookie` pair (`portfolio_refresh` httpOnly/
  `Path=/api/admin/auth`/`SameSite=Strict`; `portfolio_csrf` non-httpOnly/
  `Path=/`), `RateLimit-Remaining` header confirming the limiter is live,
  body matches `LoginResponse` exactly; `GET /me` with the returned access
  token → 200 with the user, with no/garbage token → 401; `POST /refresh`
  using the cookie jar → 200, both cookies rotated to new values; `POST
  /logout` → 200 `{"success":true}`, both cookies cleared (`Expires` in the
  past); `POST /refresh` again after logout → 401 as expected. Confirmed
  `server/.data/audit-log.json` gained a `login` row per sign-in and a
  `logout` row on sign-out, each with the admin's email and a timestamp.

## Phase 10 — Admin CMS

- ✅ Backend CRUD: `server/src/lib/admin-crud-route.ts` — generic
  `requireAdminAuth`-gated router factory (list/get/create/update/delete[/
  reorder]) shared by projects/blog/skills/experience, each a ~20-line call
  site (`buildAdminCrudRouter<T, Input>({...})`) supplying its schema/repo
  methods/cache-invalidator; mutating routes additionally gated behind
  `requireCsrf` and record an audit-log row (`create`/`update`/`delete`/
  `reorder`, `entityType`/`entityId`/`adminEmail`). `site-content` (key-keyed,
  not id-keyed — list + `PUT /:key` upsert, no delete) and `audit-log`
  (read-only, paginated) don't fit the shape and get their own small routers.
  `sanitize` hooks run `sanitizeRichText` (DOMPurify allowlist) on
  `longDescriptionHtml`/`contentHtml` before every create/update.
- ✅ Fixed a real zod typing defect surfaced by `tsc --noEmit`: `ZodSchema<T>`
  is a raw alias for the `ZodType` class in zod v3, so `ZodSchema<Input>`
  reuses `Input` (the post-parse/output type, where a `.default()` field is
  non-optional) for zod's own internal pre-parse type slot too (where that
  same field is legitimately optional) — a genuine structural mismatch, not a
  TS quirk. Fixed by loosening `inputSchema`/`updateInputSchema` to
  `ZodTypeAny` on the shared factory's options type and casting only at the
  two points of actual use (`validateBody(... as ZodSchema<Input>)` /
  `ZodSchema<Partial<Input>>`), rather than a broad `any` sweep.
- ✅ Manually verified every endpoint end-to-end against the running dev
  server (`curl`, cookie jar, fresh login each pass): full create → get →
  update → delete cycles for projects, blog, skills, experience, including a
  `<script>` payload in `longDescriptionHtml`/`contentHtml` confirming
  DOMPurify strips it on save; blog `readingTimeMinutes` recalculates from
  word count on create; `POST /reorder` for projects/skills/experience;
  `site-content` list + partial upsert; `audit-log` pagination; a mutating
  request without `X-CSRF-Token` → 403 (the item explicitly deferred from
  Phase 9's verification pending these endpoints); a deleted id → 404 on
  subsequent GET. Confirmed all 31 rows written during this pass appear in
  `GET /audit-log` with correct `action`/`entityType`/`entityId`/
  `adminEmail`/timestamp, sorted newest-first.
- ✅ Found and fixed two real backend bugs during that verification pass
  (not superficial — both reproduced live against the running server):
  - **Reorder race/corruption**: `POST /:entity/reorder` fired one
    `update()` per id via `Promise.all`. Each `JsonTable.update()` did an
    unlocked read-modify-write (`fs.writeFile`, not atomic against a
    concurrent writer of the same path), so N concurrent calls interleaved
    into lost updates and — reproduced live — a truncated/corrupted
    `skills.json` (`Unexpected end of JSON input` on the next read). Fixed
    two ways: `server/src/lib/json-store.ts` now serializes every read/write
    to a given file through an in-process per-path lock queue and writes via
    temp-file + atomic rename; and the reorder handler now does a single
    `getAll()` → reindex → `replaceAll()` instead of N concurrent
    `update()` calls (also cuts a reorder from N Sheets API calls to one,
    in line with the plan's batched-writes-for-quota principle). Re-verified
    reorder for skills/experience/projects post-fix, including restoring
    original order, with no corruption.
  - **Site-content partial-update data loss**: `PUT /site-content/:key`
    validated the body against the full `siteContentEntrySchema` (`value`/
    `label`/`group` all carry `.default()`), so a save that only intended to
    change `value` — the realistic admin-form usage — silently reset
    `label`/`group` to `""`/`"general"`, wiping the existing metadata.
    Reproduced live against `hero.headline`. Fixed by validating against
    `.partial()` instead, adding `SiteContentRepo.getByKey`, and merging the
    partial body with the existing entry in the route before upserting;
    also switched `JsonSiteContentRepo.upsert` onto the same locked
    `updateJsonArray` used elsewhere. Re-verified: a `{value}`-only PUT now
    preserves `label`/`group` and still sanitizes `value` via `stripHtml`.
- ✅ `npm run typecheck` / `npm run lint` / `npm run build` clean across
  `server` after both the zod-typing and the two bug fixes.
- ✅ Frontend: generic `createAdminCrudHooks` factory (`hooks/admin/
  useAdminCrud.ts`) wraps TanStack Query v5 list/get/create/update/delete/
  reorder calls (invalidating the entity's list query on every mutation) so
  each entity's hook file (`useAdminProjects`/`useAdminBlog`/
  `useAdminSkills`/`useAdminExperience`) is a ~10-line call site rather than
  duplicated query boilerplate; `useAdminSiteContent`/`useAdminAuditLog` are
  bespoke (key-keyed upsert, paginated read) to match their non-standard
  backend shapes.
- ✅ Shared admin building blocks: `RichTextEditor` (Tiptap — bold/italic/
  strike/headings/lists/quote/code-block/link/image(URL-only)/table/hr/
  undo-redo toolbar, syncs `value`↔editor content without fighting live
  typing), `ReorderableList` (Framer Motion `Reorder.Group`/`Reorder.Item`,
  optimistic local order + a single batched commit on drop — matches the
  Phase 10 backend fix), `ConfirmDeleteModal`, `TagListInput` (one-per-line
  textarea for `string[]` fields), `AdminPageHeader`, plus new `Select`/
  `Switch` UI primitives and a `LinkButton` (`motion.create(Link)`,
  hover/tap feedback matching `Button`'s motion-patterns recipe, sharing a
  `buttonClassNames` helper extracted into its own module so both stay
  fast-refresh-friendly) for button-styled navigation.
- ✅ Two CRUD UI shapes matched to each entity: **Projects** and **Blog**
  get separate list + create/edit form pages (form pages share one
  component keyed by presence of `:id`, since the field sets are identical);
  **Skills** and **Experience** are simple enough to combine into a single
  page — reorderable list + one modal that toggles between create/edit via
  `reset(EMPTY_VALUES)` vs `reset(entity)`. `AdminSiteContentPage` groups
  entries by section with an explicit (not auto-saving) per-row Save button
  that only enables when the field is actually dirty. `AdminAuditLogPage` is
  a paginated read-only table (`keepPreviousData` for flicker-free paging).
- ✅ Real bug class caught and fixed twice: native `<input type="number"|
  "date">` + react-hook-form's `register(...valueAsNumber)` turns an
  emptied field into `NaN`/`""` rather than `undefined`/`null`, which fails
  validation against the shared `.optional()`/`.nullable()` zod schemas
  (`Skill.yearsExperience`, `Experience.endDate`). Fixed both by switching
  to `Controller` with an explicit value-normalizing `onChange`. Experience
  additionally forces `endDate: null` server-side whenever `isCurrent` is
  true, regardless of stale form state.
- ✅ All 10 routes (`/admin/projects(+/new,+/:id/edit)`, `/admin/blog(+/new,
  +/:id/edit)`, `/admin/skills`, `/admin/experience`, `/admin/site-content`,
  `/admin/audit-log`) wired into `App.tsx`, replacing their `RouteStub`
  placeholders — only `/admin/analytics(+/:sessionId)` still stub out to
  Phase 11.
- ✅ `npm run typecheck` / `npm run lint` / `npm run build` clean across the
  whole monorepo (`shared`, `server`, `client`) — two real errors caught and
  fixed: `@tiptap/extension-table`'s `Table` is a named export, not default;
  and `motion.create(Link)` conflicts with React Router's `LinkProps` over
  the `onAnimationStart`/`onAnimationEnd`/`onDrag*` prop names (DOM event
  handler types vs. Framer Motion's own animation-lifecycle prop types of
  the same name) — fixed by omitting those specific DOM prop names from
  `LinkButtonProps` rather than widening to `any`.
- ✅ Full CRUD verified end-to-end against the running dev server via
  `curl` with the real admin session (login → cookie jar → bearer token +
  CSRF header), exercising exactly the request shapes the new frontend
  hooks send: Skills create → update (`PUT`) → reorder → delete, Experience
  create with `isCurrent: true` (`endDate` forced `null`), Site Content
  partial `PUT` save. Confirmed matching `create`/`update`/`reorder`/
  `delete` rows landed in the audit log for every action, then restored all
  touched data (skills order, experience list) back to its original seeded
  state.

## Phase 11 — Visitor analytics

- ⬜ Tracking beacon (device/browser/OS parsing, geoip, salted IP hash, bot
  filtering, batched writes)
- ⬜ Analytics dashboard (totals/unique/today/week/month, popular pages,
  referrers, device/browser/OS, geography)
- ⬜ Filterable/sortable/paginated visitor table + per-session timeline

## Phase 12 — SEO

- ⬜ Per-route meta/OG/Twitter (`react-helmet-async`)
- ⬜ Express prerender-meta middleware for `/projects/:slug`, `/blog/:slug`
- ⬜ `sitemap.xml`, `robots.txt`, JSON-LD structured data

## Phase 13 — Hardening & polish

- ⬜ Performance pass (lazy loading, code splitting, GPU-friendly transforms)
- ⬜ Accessibility pass (semantic HTML, keyboard nav, ARIA, contrast)
- ⬜ Security pass (rate limiting, CSP, audit logging review, no secrets in
  bundle)
- ⬜ Final `.env.example` review
