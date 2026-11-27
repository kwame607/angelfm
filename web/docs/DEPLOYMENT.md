# Deployment (Vercel) and launch checklist

Prerequisites done first: `ADMIN_SETUP.md` (Supabase + admin account) and
`R2_SETUP.md` (image storage).

## 1. Vercel project

1. Import the GitHub repository. **Root Directory: `web`**. Framework: Next.js.
2. Plan: Pro (commercial use).
3. Environment variables (Production, and Preview if wanted):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from Supabase |
| `SUPABASE_SECRET_KEY` | from Supabase (server only; mark Sensitive) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` | from Cloudflare |

   `R2_PUBLIC_BASE_URL` is read **at build time** to allow images: change it →
   redeploy. Do **not** set `R2_ENDPOINT` in production.
4. Deploy. Then add the domain (Settings → Domains) and update DNS.
5. Supabase → Authentication → URL Configuration: set **Site URL** to the domain.

## 2. After the first deploy

- [ ] `/admin/login` works; sign-ups are off in Supabase.
- [ ] Add categories, one article: it appears on `/` and `/news`; the yellow "Design preview" banner is gone.
- [ ] Radio Settings: paste the real stream, press play on `/listen`, check the mobile mini-player stays while browsing.
- [ ] `/robots.txt` and `/sitemap.xml` load; submit the sitemap in Google Search Console.
- [ ] Share an article link in WhatsApp: title, summary and image preview appear.
- [ ] A made-up address such as `/news/xyz` returns the 404 page.
- [ ] Run Lighthouse on `/`, `/news`, an article and `/listen` (mobile).
- [ ] Take a Supabase backup / enable PITR; schedule an R2 bucket copy.

## 3. Updating

Merge a pull request to `main` → Vercel deploys. Database changes are new files
in `supabase/migrations/` applied with `npx supabase db push` **before** merging code that needs them.

## 4. Known limitations (be aware, not blockers)

- **Rate limiting is per server instance** (in memory). It slows brute-force attempts but is not global on serverless. For stricter protection enable Supabase CAPTCHA (Auth → Attack Protection) and Vercel's firewall/rate-limit rules on `/admin/login`.
- **Audio/video upload** is not supported (Vercel request limit ~4.5 MB). Images only. Podcasts would need direct-to-R2 uploads.
- **Content-Security-Policy** is a conservative base (no framing, no plugins, same-origin forms). A strict script policy needs per-request nonces and was not added to avoid breaking Next.js.
- **Streams must be https**: browsers block http audio on https sites.
- **Listener capacity** is set by the streaming provider, not this site (the site never proxies audio).
- Live behaviour against real Supabase/R2/stream providers could only be tested with local fakes during development; do the checklist above on the real services.
