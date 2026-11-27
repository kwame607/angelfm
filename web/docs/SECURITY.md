# Security overview and review notes

## Model

- **Public visitors** can only read published articles, active programmes/presenters, currently-live ads and public station details — enforced by Postgres Row Level Security, not only by the website.
- **Single administrator.** Writes require a signed-in user with an `admin` profile (`is_admin()`). No public registration; the account is created by `npm run admin:create` with a hidden password prompt. No password is stored in code or env files.
- **Defence in depth.** `proxy.ts` is only a convenience redirect. Every admin page and Server Action calls `requireAdmin()` again.
- **Secret key** (`SUPABASE_SECRET_KEY`) is server-only (`server-only` import) and is used only by the setup script; the running app does not import it.
- **Audit log** is append-only and records admin actions (never passwords).

## Input and output handling

- Article HTML is sanitised with an allow-list on save **and** on render. JSON-LD escapes `<`.
- Images: content-sniffed (not trusting the extension/MIME), re-encoded to WebP, EXIF/GPS stripped, size and pixel limits.
- URLs saved by the admin (ads, social, stream) must be `https:` (`javascript:` etc. rejected).
- Now-playing proxy: https only, blocks localhost/private addresses, 4 s timeout, size limit, no redirects; responses cached 15 s.
- Password change re-authenticates with the current password and is rate limited.

## Headers

`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS, base CSP (`frame-ancestors 'none'; object-src 'none'; base-uri/form-action 'self'`). Admin responses: `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`. `/admin` and `/api` are disallowed in robots.txt.

## Review result (code review during development)

- No unsanitised `dangerouslySetInnerHTML` (only the sanitised article body and escaped JSON-LD).
- Every `"use server"` file except login/logout calls `requireAdmin()`; login/logout are intentionally public and rate limited.
- `npm audit --omit=dev`: 0 known vulnerabilities at time of writing.
- Database policies are covered by SQL tests (`supabase/run-tests.sh`), including that anonymous users cannot read drafts or write anything.

## Recommended before launch

1. Enable Supabase CAPTCHA and email confirmation; keep sign-ups off.
2. Add a Vercel firewall rate-limit rule for `/admin/login`.
3. Run Supabase **Security Advisor** and fix any errors.
4. Rotate any key that was ever pasted into chat/email.
5. Consider a second admin only via a reviewed change (currently deliberately one).
