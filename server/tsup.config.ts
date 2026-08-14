import { defineConfig } from "tsup";

/**
 * Bundles the server with esbuild instead of a plain `tsc` compile.
 *
 * Why: `tsconfig.json`'s `"paths"` alias for `@portfolio/shared` only affects
 * type-checking — `tsc` emits the import specifier as-is (`"@portfolio/shared"`),
 * which plain `node` can't resolve at runtime, since that workspace package's
 * `package.json` points `main`/`types` at uncompiled `.ts` source. esbuild (via
 * tsup) resolves `paths` at bundle time and inlines the matched source directly
 * into the output, so the alias never survives to become a runtime import.
 *
 * Everything in `dependencies` stays external (the normal node-target
 * pattern — they're resolved from `node_modules` at runtime); only the
 * workspace-local `@portfolio/shared` package is force-bundled via
 * `noExternal`, since it's the one import that would otherwise break.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  dts: false,
  noExternal: ["@portfolio/shared"],
});
