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
