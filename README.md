# Angel 96.1 FM

Radio station website, admin dashboard and streaming integration.

## Layout

| Path | Contents |
|---|---|
| `web/` | The new Next.js (App Router) + TypeScript + Tailwind application |
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
- `fonts/` — self-hosted Inter, Source Serif 4, Barlow Condensed (SIL OFL)

## Branching

Work happens on `redevelopment`. Nothing is pushed to `main` until reviewed.
