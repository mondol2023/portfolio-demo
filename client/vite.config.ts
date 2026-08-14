import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "@portfolio/shared": path.resolve(dirname, "../shared/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8's bundler (Rolldown) only types `manualChunks` as a function,
        // not the old Rollup object-map shorthand — same grouping, function form.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@tiptap")) return "editor";
          if (id.includes("recharts")) return "charts";
          if (
            id.includes(`${path.sep}react${path.sep}`) ||
            id.includes(`${path.sep}react-dom${path.sep}`) ||
            id.includes(`${path.sep}react-router-dom${path.sep}`) ||
            id.includes(`${path.sep}scheduler${path.sep}`)
          ) {
            return "vendor";
          }
          return undefined;
        },
      },
    },
  },
});
