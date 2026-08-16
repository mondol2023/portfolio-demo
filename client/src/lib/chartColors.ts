/**
 * Recharts renders raw SVG fill/stroke attributes, so it can't consume the
 * Tailwind `bg-hero`/`text-skills`/etc. utility classes the rest of the app
 * uses — these hex values mirror the `--color-*` tokens in `index.css` so
 * the analytics charts stay visually consistent with the public site's
 * per-section palette instead of introducing a new one.
 */
export const CHART_ACCENT = "#3b82f6"; // --color-info — the dashboard's own accent, distinct from any public section
export const CHART_GRID = "#1b1e2c"; // --color-base-700
export const CHART_MUTED_TEXT = "#6b7290"; // --color-base-400

/** Categorical palette for multi-series breakdowns (devices, browsers, …) — the same accents used across the public site's sections. */
export const CHART_CATEGORICAL = [
  "#6366f1", // hero
  "#14b8a6", // about
  "#8b5cf6", // skills
  "#f59e0b", // experience
  "#10b981", // projects
  "#f43f5e", // blog
  "#0ea5e9", // contact
];
