# Angel FM — Supabase & Administrator Setup (step by step)

Follow this top to bottom, once. It takes about 30 minutes. At the end you will
have a working database, one administrator account, and the website running on
your computer with real (empty) content.

> Supabase occasionally renames menu items. If a label below does not match
> exactly, look for the closest one. The *settings* are what matter.

**You will need:** Node.js 20+, Git, and this repository on your computer.

---

## Step 1 — Create the Supabase project

1. Sign in at <https://supabase.com> with the **new** account.
2. Create an **Organization** for Angel FM (type: *Company*). Keeping Angel FM in
   its own organisation means it can be billed to, or handed over to, the station.
3. Upgrade the organisation to **Pro** (Billing). Free projects *pause after a
   week of inactivity* and have *no backups* — not acceptable for a live station.
4. **New project** → name it `angelfm`.
   - **Database password:** click *Generate* and save it in a password manager.
     The website never uses it, but you need it for Step 3 (Option A) and for emergencies.
   - **Region:** the closest option to Ghana (e.g. *West EU (Ireland/London)* or
     *South Africa* if offered). This cannot be changed later.
5. Wait for the project to finish starting (a minute or two).

## Step 2 — Copy the three keys into `.env.local`

In the project dashboard:

| What | Where to find it | Goes into |
|---|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | *Project Settings → General* or *Data API* | `NEXT_PUBLIC_SUPABASE_URL` |
| **Publishable key** (`sb_publishable_…`) | *Project Settings → API Keys* | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| **Secret key** (`sb_secret_…`, click *Reveal*) | *Project Settings → API Keys* | `SUPABASE_SECRET_KEY` |

Then, on your computer:

```bash
cd angelfm/web
cp .env.example .env.local
```

Open `web/.env.local` in an editor and paste the three values (no quotes, no spaces):

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

**The secret key is the master key** — it bypasses all database security.
- Never paste it into chat, email, screenshots or GitHub.
- `.env.local` is already git-ignored; keep it that way.
- If it ever leaks: *Project Settings → API Keys* → rotate it, then update `.env.local` (and Vercel).

Leave the `R2_…` lines blank for now (see `R2_SETUP.md` later).

## Step 3 — Create the database tables (run the migrations)

The SQL files are in `supabase/migrations/` at the repository root. They **must run
in this order**: `…000001_schema.sql` then `…000002_rls.sql`.

### Option A — Supabase CLI (recommended)

Run these from the **repository root** (the folder containing `supabase/` and `web/`),
*not* from `web/`:

```bash
npx supabase login                       # opens a browser; approve it
npx supabase init                        # only if it later complains "config.toml not found"; answer N to any prompts
npx supabase link --project-ref <ref>    # <ref> = the xxxx in https://xxxx.supabase.co ; paste the DB password from Step 1
npx supabase db push                     # shows the 2 migrations; type Y
```

### Option B — SQL Editor (no tools needed)

1. Dashboard → **SQL Editor → New query**.
2. Open `supabase/migrations/20261126000001_schema.sql`, copy **everything**, paste, click **Run**. Expect "Success".
3. New query again → paste `supabase/migrations/20261126000002_rls.sql` → **Run**.

> Do not run a file twice. If something fails halfway, tell me the exact error
> message instead of re-running.

### Check it worked

- **Table Editor** shows 11 tables: `profiles`, `media`, `categories`, `news_articles`,
  `presenters`, `programmes`, `programme_presenters`, `advertisements`,
  `site_settings`, `radio_settings`, `audit_logs`.
- Every table shows a green **RLS enabled** badge (none should say "RLS disabled").
- `site_settings` and `radio_settings` each have exactly **1 row**.
- **Advisors → Security Advisor**: there should be no *errors* about missing RLS.
  Warnings can be sent to me to review.

## Step 4 — Turn OFF public sign-ups (important)

*Authentication → Sign In / Providers* (older UI: *Authentication → Settings*):

- Switch **OFF** "Allow new users to sign up".
- Keep the **Email** provider enabled (that is how the administrator signs in).
- Optional, recommended: *Authentication → Attack Protection* → enable CAPTCHA.

The website has no registration page, and even a stranger who somehow created a
login would have no powers (the database only trusts users with an `admin` profile).
Turning sign-ups off removes the possibility entirely. The setup script in Step 5
still works because it uses the secret key.

Also set *Authentication → URL Configuration → Site URL* to `http://localhost:3000`
for now (change it to the real domain when the site goes live).

## Step 5 — Create the administrator account

```bash
cd web            # (if you are not already in the web folder)
npm install
npm run admin:create
```

You will be asked for:
1. **Email** — the address the administrator will log in with.
2. **Display name** — optional.
3. **Password** — typed at a hidden prompt (nothing appears while you type). Use 12+
   characters with upper case, lower case and a number. Then confirm it.

The password is never written to any file, command or log. The script refuses to
run if an administrator already exists, and undoes itself if anything fails midway.

> Store the password in a password manager. If lost, reset it in Supabase:
> *Authentication → Users →* the user → *Send password recovery* (or set a new password).

## Step 6 — Run the website and sign in

```bash
cd web
npm run dev
```

Open <http://localhost:3000/admin/login> and sign in.

### First-run checklist

- [ ] Login works and you land on the Overview page (counts show `0`).
- [ ] **Categories** → add `News`, `Sports`, `Entertainment`.
- [ ] **News → New article** → write something → choose a category → **Publish**.
- [ ] Open <http://localhost:3000> and <http://localhost:3000/news> — your article is there, and the yellow "Design preview — sample content" banner is **gone** (that means the site is reading the real database).
- [ ] Overview → *Recent activity* lists your sign-in and publish actions.
- [ ] Sign out, then visit `/admin` — you are sent back to the login page.

Everything else on the public pages (programmes, presenters, ads) will correctly
show as empty until they are added in the dashboard.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `/admin/login` says "Sign-in is unavailable" | `.env.local` is missing/mis-typed, or the dev server was not restarted after editing it. Stop (`Ctrl+C`) and run `npm run dev` again. |
| `npm run admin:create`: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY" | You are not in `web/`, or `.env.local` is not in `web/`. |
| `admin:create`: "Could not check existing administrators" | Migrations (Step 3) were not applied, or the URL/secret key is wrong. |
| `admin:create`: "Invalid API key" | Copy the key again without spaces. If it still fails, use the **legacy** `service_role` key from *API Keys → Legacy API keys* as `SUPABASE_SECRET_KEY`. |
| Login says "Incorrect email or password" for the right password | The user exists but has no admin profile (the script was interrupted). Check *Table Editor → profiles* has one row with role `admin`; if not, delete the user in *Authentication → Users* and run `npm run admin:create` again. |
| "relation … does not exist" errors | Step 3 was not completed. |
| Site shows the yellow sample-content banner | The app cannot see the Supabase variables (see first row). |
| Published article does not appear on the homepage | Its publication date is in the future (it is *Scheduled*), or no category was chosen. Public pages refresh within about a minute. |

## How the security works (one paragraph)

Visitors can read only published articles, active programmes, live ads and public
station details — enforced by Postgres Row Level Security, not just by the website.
Only a signed-in user with an `admin` profile can write anything. Every admin page
and action re-checks this on the server. The secret key is used only by this setup
script and never reaches a browser.

## Backups

- **Database:** Pro includes daily backups (7 days). For a station that publishes all
  day, consider the **Point-in-Time Recovery** add-on. Before risky changes you can
  take a copy: `npx supabase db dump -f backup.sql` (from the repo root, after `link`).
- **Images (Cloudflare R2):** *not* included in database backups — copy the bucket
  periodically (e.g. `rclone sync`).
- **Restore drill:** before launch, restore a backup into a scratch project once to
  prove the process works.

## When you deploy to Vercel (later)

Add the same variables in *Vercel → Project → Settings → Environment Variables*
(`NEXT_PUBLIC_SITE_URL` = the real domain), then redeploy. Update Supabase
*Authentication → URL Configuration → Site URL* to the real domain.

## Not verified yet

These steps were written against the code and database tests, but I have not been
able to run them against a live Supabase project. If anything behaves differently
from this guide, send me the exact message you see.
