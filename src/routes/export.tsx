import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileArchive, Globe, ServerCog, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export Static — Reminder Mail" },
      {
        name: "description",
        content:
          "Unduh versi statis Reminder Mail dalam satu file ZIP dan ikuti panduan deploy ke hosting biasa, dengan database tetap di Lovable Cloud.",
      },
      { property: "og:title", content: "Export Static — Reminder Mail" },
      {
        property: "og:description",
        content: "Unduh paket statis Reminder Mail beserta panduan deploy ke hosting biasa.",
      },
    ],
  }),
  component: ExportPage,
});

type ExportMeta = { file: string; bytes: number; builtAt: string };

const ZIP_URL = "/exports/remindly-static.zip";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Globe;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 shadow-[var(--shadow-soft)]">
      <CardContent className="p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function ExportPage() {
  const meta = useQuery<ExportMeta | null>({
    queryKey: ["static-export-meta"],
    queryFn: async () => {
      const res = await fetch("/exports/remindly-static.json", { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as ExportMeta;
    },
  });

  const sizeMb = meta.data ? (meta.data.bytes / 1024 / 1024).toFixed(2) : null;

  return (
    <AppShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Export static</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unduh aplikasi ini sebagai paket HTML/CSS/JS siap unggah. Database, login, dan lampiran
          tetap memakai backend yang sama, jadi data Anda tidak berpindah.
        </p>
      </div>

      <Card className="mt-6 border-border/70 shadow-[var(--shadow-soft)]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <FileArchive className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">remindly-static.zip</p>
              <p className="text-xs text-muted-foreground">
                {meta.isLoading
                  ? "Memeriksa paket…"
                  : meta.data
                    ? `${sizeMb} MB · dibuat ${formatDateTime(meta.data.builtAt)}`
                    : "Paket belum tersedia — jalankan perintah export di bawah."}
              </p>
            </div>
          </div>
          <Button asChild className="rounded-full" disabled={!meta.data}>
            <a href={ZIP_URL} download>
              <Download className="h-4 w-4" /> Unduh ZIP statis
            </a>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        Catatan: format RAR butuh perangkat lunak berlisensi, jadi ekspor memakai ZIP yang bisa
        dibuka semua sistem. Untuk membuat ulang paket setelah ada perubahan tampilan, jalankan{" "}
        <code className="rounded bg-muted px-1 py-0.5">npm run export:static</code>.
      </p>

      <div className="mt-8 space-y-4">
        <Section icon={Globe} title="1. Unggah ke hosting">
          <p>
            Ekstrak ZIP-nya, lalu unggah <strong>seluruh isi folder</strong> (bukan foldernya) ke
            root domain — misalnya <code>public_html/</code> di cPanel. Pastikan{" "}
            <code>index.html</code> berada tepat di root.
          </p>
          <p>Aktifkan HTTPS (Let&rsquo;s Encrypt) karena login dan akses data memerlukannya.</p>
        </Section>

        <Section icon={ServerCog} title="2. Arahkan semua URL ke index.html">
          <p>
            Routing berjalan di browser, jadi server harus melayani <code>index.html</code> untuk
            setiap URL. File konfigurasi sudah ikut di dalam ZIP:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Apache / cPanel: <code>.htaccess</code> (langsung aktif)
            </li>
            <li>
              Netlify / Cloudflare Pages: <code>_redirects</code>
            </li>
            <li>
              Vercel static: <code>vercel.json</code>
            </li>
            <li>
              Nginx: salin dari <code>nginx.conf.example</code>
            </li>
          </ul>
          <Code>{`location / {\n  try_files $uri $uri/ /index.html;\n}`}</Code>
          <p>Tanpa aturan ini, halaman seperti /smtp akan 404 saat di-refresh.</p>
        </Section>

        <Section icon={ShieldCheck} title="3. Login dan SMTP setelah deploy">
          <p>
            Buka domain Anda dan masuk dengan akun yang sudah terdaftar di backend (akun baru dibuat
            dari dasbor backend, bukan dari halaman login).
          </p>
          <p>
            Lalu buka halaman SMTP, isi kredensial, dan pakai tombol <strong>Uji koneksi</strong>{" "}
            serta <strong>Kirim email uji</strong> untuk memverifikasi.
          </p>
        </Section>

        <Section icon={ServerCog} title="Yang tetap berjalan di backend">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pengiriman email SMTP butuh koneksi soket, jadi tetap diproses backend dan dipanggil
              lewat HTTPS oleh paket statis.
            </li>
            <li>
              Penjadwalan otomatis dijalankan cron di backend; bila proyek backend dihentikan,
              tampilan statis tetap terbuka tetapi email terjadwal berhenti.
            </li>
            <li>
              Jika backend pindah URL, build ulang dengan variabel <code>VITE_BACKEND_URL</code>{" "}
              yang menunjuk ke URL baru.
            </li>
          </ul>
        </Section>
      </div>
    </AppShell>
  );
}
