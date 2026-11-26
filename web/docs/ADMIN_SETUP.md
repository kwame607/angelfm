# Supabase & Administrator Setup

Do this once, after you have created the Angel FM Supabase project (Pro plan,
its own organisation — see `CREDENTIALS.md`).

## 1. Apply the database migrations

The SQL lives in `supabase/migrations/` and must run **in filename order**.

**Option A — Supabase CLI (recommended, repeatable)**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

**Option B — SQL Editor (no tooling)**
In the Supabase dashboard → SQL Editor, run the contents of
`20261126000001_schema.sql`, then `20261126000002_rls.sql`.

## 2. Turn OFF public sign-ups (important)

Supabase → Authentication → Sign In / Providers → **disable "Allow new users to sign up"**.

The app has no registration page, and a stranger who somehow created a login
still has no powers (they have no `profiles` row, so every admin policy denies
them). Disabling sign-ups removes the possibility altogether.

Also recommended: Authentication → Attack Protection → enable CAPTCHA and keep
Supabase's default rate limits.

## 3. Environment variables

Copy the three Supabase values into `web/.env.local` (see `.env.example`).
`SUPABASE_SECRET_KEY` is the powerful key: keep it out of git, chat and email.

## 4. Create the administrator

```bash
cd web
npm run admin:create
```

You are asked for an email and then a password at a **hidden prompt** (12+
characters, upper, lower and a number). The password is never written to a
file, argument or environment variable. The script refuses to run if an
administrator already exists.

Sign in at `/admin/login`.

## Lost password

Supabase dashboard → Authentication → Users → the admin → *Send password
recovery* (or set a new password). An in-app change-password form arrives in Phase 4.

## Security model in one paragraph

Visitors read only published/active/live content (Row Level Security in
Postgres). Writes require a signed-in user who has an `admin` profile row.
Every admin page and action re-verifies this on the server; the `proxy.ts`
redirect is a convenience, not the protection. The service-role key is used
only by the setup script and future server-only operations, never in the browser.

## Backup plan

- **Database:** Supabase Pro includes automatic daily backups (7-day retention).
  For a news site that publishes during the day, consider enabling the
  Point-in-Time Recovery add-on. Before risky changes, take a manual dump:
  `npx supabase db dump -f backup.sql`.
- **Media (Cloudflare R2):** uploaded files are not part of database backups.
  Plan a periodic sync of the bucket to a second location (e.g. `rclone sync`).
- **Restore drill:** restore a backup into a scratch project once, before launch,
  to prove the process works.
