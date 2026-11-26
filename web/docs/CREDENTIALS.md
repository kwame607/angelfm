# Angel FM — Required External Credentials & Information

Nothing below is committed to the repository. Development values go in
`web/.env.local`; production values go in the Vercel project's Environment
Variables. See `web/.env.example` for the exact variable names.

## 1. Supabase (needed from Phase 3)

| Variable | Exposure | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (RLS-protected) | Supabase → Project Settings → API Keys |
| `SUPABASE_SECRET_KEY` | **Server only — bypasses RLS** | Supabase → Project Settings → API Keys |

Also needed: a Supabase project (recommend a region close to Ghana, e.g. EU West
or South Africa where available), plus the email address the single
administrator will use. The administrator password is set during the secure
setup procedure in Phase 3 — it is never stored in code or in `.env` files.

## 2. Cloudflare R2 (needed from Phase 4)

| Variable | Exposure | Notes |
|---|---|---|
| `R2_ACCOUNT_ID` | Server only | Cloudflare dashboard → R2 |
| `R2_ACCESS_KEY_ID` | Server only | R2 → Manage API tokens (Object Read & Write, scoped to one bucket) |
| `R2_SECRET_ACCESS_KEY` | Server only | Shown once when the token is created |
| `R2_BUCKET` | Server only | Bucket name |
| `R2_PUBLIC_BASE_URL` | Public URL | Custom domain (recommended, e.g. `media.<domain>`) or `r2.dev` URL |

## 3. Hosting (needed Phase 6)

- Vercel Pro account/team with access to the GitHub repository.
- Production domain name and DNS access.
- `NEXT_PUBLIC_SITE_URL` set to the production URL.

## 4. Streaming (needed Phase 5) — from Angel FM / streaming provider

The FM frequency is **not** a stream URL. Angel FM must supply:

- Streaming provider name (e.g. the managed host being used).
- Public **stream URL** and its **format** (MP3, AAC or HLS/.m3u8).
- Metadata / now-playing endpoint, if the provider offers one.
- Fallback stream URL, if one exists.
- Confirmation that the studio encoder is sending audio to the provider.
- Provider listener capacity (target is 500–2,000 concurrent listeners).

These are entered in the admin dashboard (Radio Settings), not in code. Any
provider API secrets, if ever needed, are stored as server-only environment
variables and never returned by public endpoints.

## 5. Station information (needed Phase 2 onward)

Not invented by the build; to be supplied by Angel FM:

- Confirmed station location and contact details (the old site mixes Kumasi
  and Accra references and shows sample phone/address data).
- Social media page URLs.
- Real presenter names, photos and biographies.
- Real programme names, descriptions, days and times.
- High-resolution logo (the current one is a 600×404 JPEG on black) and any
  brand guidelines.
- Advertiser details for the launch campaigns.
