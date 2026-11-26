# Cloudflare R2 Setup (image storage)

All uploaded images (article photos, presenters, programmes, ad banners) are
stored in a Cloudflare R2 bucket. Do this once, then add the values to
`web/.env.local` (and to Vercel before deploying).

## 1. Create the bucket
Cloudflare dashboard → **R2 Object Storage → Create bucket** (e.g. `angelfm-media`).
Choose the location hint closest to your listeners if offered.

## 2. Make images publicly readable
Bucket → **Settings → Public access**. Recommended: **Connect a custom domain**
(e.g. `media.yourdomain.com`) — it is cached by Cloudflare's CDN and can be changed
later without breaking links. For quick testing you may enable the `r2.dev` URL
instead (rate-limited, not for production).

Your public address (no trailing slash) is `R2_PUBLIC_BASE_URL`.

## 3. Create an API token
R2 → **Manage API Tokens → Create API token** →
permission **Object Read & Write**, scoped to **this bucket only**.
Copy the *Access Key ID* and *Secret Access Key* (the secret is shown once).
Your *Account ID* is shown on the R2 overview page.

## 4. Environment variables
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://media.yourdomain.com
```
Leave `R2_ENDPOINT` blank (it exists only for local testing).

> **Important:** `R2_PUBLIC_BASE_URL` is also read **at build time** so the site is
> allowed to display images from that address. After changing it, redeploy.

## What the system does with every upload
- Accepts JPG, PNG, WebP, AVIF, GIF up to 5 MB (large photos are shrunk in the
  browser first). It checks the file's real contents, not its name.
- Converts to WebP, caps the longest side at 2000 px, fixes rotation, and removes
  location/camera metadata.
- Stores it under a unique name such as `news/2026/11/photo-3f2a9c1e.webp` with a
  one-year cache header.
- Refuses to delete an image still used by an article, presenter, programme or ad.

## Not included yet
Audio uploads: the web host limits request size (~4.5 MB), so audio needs a
different direct-to-storage upload, planned separately.

## Backups
R2 is not covered by database backups. Periodically copy the bucket elsewhere
(e.g. `rclone sync`), as noted in `ADMIN_SETUP.md`.
