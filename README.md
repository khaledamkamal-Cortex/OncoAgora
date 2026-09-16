# OncoAgora

**The gathering place for oncology learning.** A standalone Moodle-style learning platform extracted from the [CAIRO Journal Club portal](https://github.com/khaledamkamal-Cortex/Cairojournalclub) — courses, modules, lessons (video / article / PDF / quiz), progress tracking and certificates.

Built with **React + Vite + React Router**. Runs fully in **demo mode** out of the box (data stored in the browser), and switches to a live **Supabase** backend once environment variables are set.

## Site map

| Section | Route | Notes |
|---|---|---|
| Home | `/` | LMS-focused landing: how it works, featured courses |
| Course Catalog | `/courses` | All published courses with per-member progress |
| Course Player | `/courses/:id` | Module sidebar, video/article/PDF/quiz lessons, progress, certificate |
| Membership / My Learning | `/membership` | Register, login, manage profile, learning dashboard |
| Admin Panel | `/admin` | Course builder (courses → modules → lessons incl. quiz editor) + members |

## Running locally

```bash
npm install
npm run dev      # http://localhost:5181
```

> This machine has no global Node. Use the local copy:
> `export PATH="/Users/khaledkamal/Claude Projects/.node/bin:$PATH"`

### Admin access (demo mode)
Go to `/admin` and use the demo password **`onco-admin`**.

## Going live with Supabase

1. Create a **new** Supabase project for OncoAgora.
2. Run [`supabase-setup.sql`](./supabase-setup.sql) in the SQL editor (creates tables, RLS, the admin system, and seeds the two starter courses).
3. Copy `.env.example` → `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Register your account on the site, then run the admin-bootstrap SQL at the bottom of `supabase-setup.sql` to make yourself admin.

## Deploying (Vercel)

`vercel.json` is included with SPA rewrites.

```bash
npm run build    # outputs to dist/
```

## Branding

Palette: aegean indigo `#2c3e8c`, agora teal `#0ea5a6`, amber `#f59e0b` — defined as CSS variables in `src/styles.css` (variable names inherited from the CAIRO codebase). Logo: `public/logo.svg`, an amphitheater/agora motif.
