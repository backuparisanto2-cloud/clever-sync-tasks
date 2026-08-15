import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

/** Plain SPA build used by `bun run export:static` — no SSR, no worker. */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: false,
  envDir: projectRoot,
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  build: {
    outDir: fileURLToPath(new URL("../.static-export/site", import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
});
