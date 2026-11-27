# Image storage setup (Supabase Storage — no extra account or card)

Uploaded images (news photos, presenters, ad banners) are stored in a **public
Supabase Storage bucket** called `media`. You already have everything needed:
the Supabase project and `SUPABASE_SECRET_KEY` in `web/.env.local`.

> Cloudflare R2 is still supported as an optional alternative (`R2_SETUP.md`),
> and is used instead only if all five `R2_…` variables are set. Most stations
> should just use this guide.

## Steps (about 5 minutes)

1. **Pull the latest code** and open `supabase/migrations/20261127000003_storage_bucket.sql`.
2. Supabase dashboard → **SQL Editor → New query** → paste that file → **Run**. Expect "Success".
   (Or run `npx supabase db push` from the repo root.)
3. Check: **Storage** in the sidebar now lists a bucket named **media** marked *Public*.
   - If you prefer to create it by hand: Storage → New bucket → name `media` → turn **Public bucket** ON → file size limit 5 MB.
4. Make sure `web/.env.local` contains `SUPABASE_SECRET_KEY=…` (you already set this for the admin account), then **restart** `npm run dev`.
5. Open `/admin/media`, upload a picture. The "storage is not connected" notice should be gone.

## Vercel

Nothing extra beyond the Supabase variables you already add. If you use a
different bucket name set `STORAGE_BUCKET` (and create that bucket).
Image hosts are allowed automatically from `NEXT_PUBLIC_SUPABASE_URL` at build time.

## Good to know

- Only the server (after the admin check) can upload or delete; visitors can only view images.
- Images are re-encoded to WebP and capped at 5 MB before they are stored.
- Free Supabase plans include 1 GB storage; Pro includes 100 GB. Images are optimised, so this lasts a long time.
- **Backups:** Supabase database backups do *not* include stored files. Periodically download the bucket (e.g. Storage → download, or `rclone` via Supabase's S3 endpoint).
- Images already uploaded to R2 (if any) keep working; their URLs are stored in the database.
