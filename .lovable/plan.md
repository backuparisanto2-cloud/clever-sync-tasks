# Import Remindly Smart Scheduler into this project

Source: `github.com/backuparisanto2-cloud/remindly-smart-scheduler` (public). It is a Lovable TanStack Start app — same stack as this project — so the code can be copied in directly. Lovable cannot "connect" an existing GitHub repo as a sync source, so the import is a one-time copy; after that you can connect this project to GitHub for two-way sync.

## What gets copied

- Pages: home, auth, reminders list/detail (`reminders/$id`), new reminder, logs, SMTP settings
- Components: `AppShell`, `ReminderForm`, full shadcn UI set
- Logic: `lib/` (schedule, format, auth, backend, server-side mailer/SMTP), server functions
- Public API routes: cron dispatch, mail send, mail test
- Styling: the repo's `styles.css` design system (white/green theme), `components.json`
- Dependencies from the repo's `package.json` (Supabase JS, date-fns, recharts, react-hook-form, zod, etc.)

## Backend

The app uses a database + auth + email. Steps:

1. Enable Lovable Cloud on this project (a fresh backend, not the old one).
2. Apply the repo's two SQL migrations (reminders, logs, SMTP settings tables with RLS/grants) to the new backend.
3. Regenerate the Supabase client/types for this project instead of copying the old ones (old project keys will not work here).
4. Re-add SMTP secrets (host, port, user, password, from address) — the old `.env` values are not carried over and should not be reused from a public repo.

Existing data in the old backend is not migrated. If you need the old rows, export/import separately.

## Not copied

- `dist-static/` build output, `bun.lock`, `.env`, old `.lovable/plan` archives
- `vite.static.config.ts` and `public/.htaccess` (static cPanel deploy setup) — can be added later if you still want that deploy path

## Result

`/` renders the Remindly home page, the app builds, and you can then push this project to a GitHub repo for ongoing sync.

## Technical notes

- Router config, `__root.tsx`, `start.ts`, `server.ts` are replaced with the repo versions; `routeTree.gen.ts` regenerates automatically.
- Head metadata will be reviewed per route so titles/descriptions are app-specific.
- `.env` in the public repo may contain leaked credentials — rotate any SMTP password that appeared there.
