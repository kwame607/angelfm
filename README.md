# Angel 96.1 FM

Radio station website, admin dashboard and streaming integration.

## Layout

| Path | Contents |
|---|---|
| `web/` | The new Next.js (App Router) + TypeScript + Tailwind application |
| `supabase/` | Database migrations (schema + Row Level Security) and security tests |
| `legacy/` | The original static HTML/CSS/JS site, preserved untouched for reference (also recoverable from git history on `main`) |

## Run locally

```bash
cd web
cp .env.example .env.local   # fill in values as they become available
npm install
npm run dev                  # http://localhost:3000
npm run lint
npm run build && npm start
```

The app builds and runs without any credentials; integrations raise a clear
error only when used. Required credentials: see `web/docs/CREDENTIALS.md`.

## Structure (`web/src`)

- `app/` — routes and root layout
- `components/layout`, `components/ui` — header, footer, buttons, status badges
- `lib/env.ts` — validated environment access (public vs server-only)
- `lib/supabase/` — `client.ts` (browser), `server.ts` (session-bound, RLS), `admin.ts` (secret key, server-only)
- `lib/r2/` — Cloudflare R2 client and unique object-key helpers (server-only)
- `lib/radio/config.ts` — the single source of truth for stream configuration
- `app/admin/` — administrator login and dashboard (`/admin`), protected server-side
- `lib/auth/` — `requireAdmin()` session verification; `lib/audit.ts` — audit log helper
- `proxy.ts` — optimistic /admin redirect and session refresh (not the security boundary)
- `lib/content/` — public content API: reads Supabase when configured, labelled sample data otherwise
- `lib/media/` — image validation/optimisation (sharp) and browser-side shrinking; `lib/r2/` — R2 client, keys, put/delete
- `lib/sanitize.ts` — allow-list HTML sanitiser (applied on save and on render); `npm test` runs its unit tests
- `fonts/` — self-hosted Inter, Source Serif 4, Barlow Condensed (SIL OFL)

## Documentation

| Doc | For |
|---|---|
| `web/docs/ADMIN_SETUP.md` | Supabase project, migrations, creating the administrator |
| `web/docs/R2_SETUP.md` | Cloudflare R2 image storage |
| `web/docs/DEPLOYMENT.md` | Vercel, domain, launch checklist, known limitations |
| `web/docs/ADMIN_GUIDE.md` | Day-to-day guide for station staff |
| `web/docs/SECURITY.md` | Security model and review notes |
| `web/docs/CREDENTIALS.md` | Every external credential/information item needed |

## Tests

`npm test` (unit), `supabase/run-tests.sh` (database/RLS, needs local Postgres), `npm run lint`, `npx tsc --noEmit`.

## Branching

Each phase is developed on its own branch and merged to `main` through a pull request after review.
