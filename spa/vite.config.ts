import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Ganti modul server-only (SMTP, mailer, helper API) dengan stub kosong supaya
 * kode backend tidak ikut terbundel ke dalam paket statis.
 */
const stubServerModules = {
  name: "stub-server-modules",
  enforce: "pre" as const,
  resolveId(source: string) {
    if (/\.server(\.tsx?)?$/.test(source)) return "\0server-stub";
    return null;
  },
  load(id: string) {
    if (id === "\0server-stub") return "export default {};\nexport const __serverOnly = true;\n";
    return null;
  },
};

/** Plain SPA build used by `npm run export:static` — no SSR, no worker. */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: false,
  envDir: projectRoot,
  plugins: [stubServerModules, tailwindcss(), react()],

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
