#!/usr/bin/env node
/**
 * Membangun versi statis (SPA) dari aplikasi ini dan membungkusnya menjadi
 * public/exports/remindly-static.zip supaya bisa diunduh lewat halaman /export.
 *
 * Jalankan: npm run export:static
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workDir = join(root, ".static-export");
const siteDir = join(workDir, "site");
const outDir = join(root, "public", "exports");
const zipName = "remindly-static.zip";

function run(cmd, args) {
  execFileSync(cmd, args, { cwd: root, stdio: "inherit" });
}

console.log("→ Membangun bundel statis (SPA)…");
rmSync(workDir, { recursive: true, force: true });
run("npx", ["vite", "build", "--config", "spa/vite.config.ts"]);

console.log("→ Menyalin aset publik…");
for (const entry of readdirSync(join(root, "public"))) {
  if (entry === "exports") continue; // jangan ikutkan file zip itu sendiri
  cpSync(join(root, "public", entry), join(siteDir, entry), { recursive: true });
}

console.log("→ Menambahkan konfigurasi hosting…");
// Apache / cPanel
writeFileSync(
  join(siteDir, ".htaccess"),
  `# SPA routing: semua URL dilayani index.html
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
`,
);
// Netlify / Cloudflare Pages
writeFileSync(join(siteDir, "_redirects"), "/*    /index.html   200\n");
// Vercel static
writeFileSync(
  join(siteDir, "vercel.json"),
  JSON.stringify({ rewrites: [{ source: "/(.*)", destination: "/index.html" }] }, null, 2) + "\n",
);
// Nginx contoh
writeFileSync(
  join(siteDir, "nginx.conf.example"),
  `server {
  listen 80;
  server_name contoh-domain.com;
  root /var/www/remindly;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
`,
);
// Fallback 404 untuk hosting yang hanya mendukung 404.html
cpSync(join(siteDir, "index.html"), join(siteDir, "404.html"));

console.log("→ Menulis panduan deploy…");
cpSync(join(root, "scripts", "deploy-guide.md"), join(siteDir, "README-DEPLOY.md"));

console.log("→ Membuat arsip ZIP…");
mkdirSync(outDir, { recursive: true });
const zipPath = join(outDir, zipName);
rmSync(zipPath, { force: true });
execFileSync("zip", ["-r", "-q", zipPath, "."], { cwd: siteDir, stdio: "inherit" });

const size = statSync(zipPath).size;
writeFileSync(
  join(outDir, "remindly-static.json"),
  JSON.stringify({ file: zipName, bytes: size, builtAt: new Date().toISOString() }, null, 2) + "\n",
);

if (!existsSync(zipPath)) throw new Error("ZIP gagal dibuat");
console.log(`✓ Selesai: public/exports/${zipName} (${(size / 1024 / 1024).toFixed(2)} MB)`);
