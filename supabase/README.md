# Database

- `migrations/` — schema and Row Level Security, applied in filename order.
- `tests/` — assertions that prove the security model.
- `run-tests.sh` — starts a throw-away local PostgreSQL, applies the migrations
  and runs the tests (needs PostgreSQL 15+ server binaries; no Supabase account).

```bash
./supabase/run-tests.sh      # prints "ALL TESTS PASSED" on success
```

The tests stub the small part of Supabase the migrations depend on (roles,
`auth.users`, `auth.uid()`), so they check the SQL and policies, not Supabase itself.
See `web/docs/ADMIN_SETUP.md` for applying migrations to the real project.

## Optional demo data

`supabase/seed/demo_programmes.sql` adds 12 demo programmes (from the original static site's placeholder timetable) so the weekly timetable can be seen working. These are not confirmed Angel FM shows. Replace them with the real schedule in the admin; the file ends with a ready-made delete statement.
