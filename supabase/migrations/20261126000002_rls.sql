-- Angel FM — Row Level Security.
-- Model: visitors (anon) can read only public, live content. The single
-- administrator (a user with a profiles row, role 'admin') can do everything
-- else. Privileged server code may also use the service role, which bypasses RLS.

-- ---------------------------------------------------------------- is_admin()
-- SECURITY DEFINER so policies can consult profiles without granting clients
-- read access to it. search_path is pinned to avoid hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------- enable RLS everywhere
alter table public.profiles             enable row level security;
alter table public.media                enable row level security;
alter table public.categories           enable row level security;
alter table public.news_articles        enable row level security;
alter table public.presenters           enable row level security;
alter table public.programmes           enable row level security;
alter table public.programme_presenters enable row level security;
alter table public.advertisements       enable row level security;
alter table public.site_settings        enable row level security;
alter table public.radio_settings       enable row level security;
alter table public.audit_logs           enable row level security;

-- ---------------------------------------------------------------- public (anon + authenticated) reads
create policy "public reads media" on public.media
  for select to anon, authenticated using (true);          -- files are public URLs anyway

create policy "public reads categories" on public.categories
  for select to anon, authenticated using (true);

create policy "public reads published articles" on public.news_articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "public reads presenters" on public.presenters
  for select to anon, authenticated using (true);

create policy "public reads active programmes" on public.programmes
  for select to anon, authenticated using (is_active);

create policy "public reads links of active programmes" on public.programme_presenters
  for select to anon, authenticated
  using (exists (select 1 from public.programmes p
                 where p.id = programme_id and p.is_active));

-- Expired / not-yet-started / disabled ads are invisible at the database level.
create policy "public reads live advertisements" on public.advertisements
  for select to anon, authenticated
  using (is_enabled and now() >= starts_at and now() < ends_at);

create policy "public reads site settings" on public.site_settings
  for select to anon, authenticated using (true);

create policy "public reads radio settings" on public.radio_settings
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------- administrator: full access
-- (select public.is_admin()) is wrapped so Postgres evaluates it once per query.
create policy "admin manages media" on public.media
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages categories" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages articles" on public.news_articles
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages presenters" on public.presenters
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages programmes" on public.programmes
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages programme presenters" on public.programme_presenters
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin manages advertisements" on public.advertisements
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Singletons: update only (rows are created by the migration, never deleted).
create policy "admin updates site settings" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin updates radio settings" on public.radio_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------- profiles
-- A signed-in admin may read and rename their own profile. No client can
-- insert or delete profiles: they are created by the setup script only.
create policy "admin reads own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) and (select public.is_admin()));

create policy "admin updates own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and (select public.is_admin()))
  with check (id = (select auth.uid()) and (select public.is_admin()));

-- Role and email must not be changeable from the client, even by the admin.
revoke update on public.profiles from authenticated, anon;
grant  update (display_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------- audit_logs
-- Append-only: admin can read and insert rows attributed to themselves.
-- No UPDATE or DELETE policy exists, so history cannot be rewritten from the API.
create policy "admin reads audit logs" on public.audit_logs
  for select to authenticated using ((select public.is_admin()));

create policy "admin writes own audit logs" on public.audit_logs
  for insert to authenticated
  with check ((select public.is_admin()) and actor_id = (select auth.uid()));

-- ---------------------------------------------------------------- table privileges
-- Defence in depth on top of RLS: anon never touches sensitive tables.
revoke all on public.profiles, public.audit_logs from anon;
revoke insert, update, delete, truncate on
  public.media, public.categories, public.news_articles, public.presenters,
  public.programmes, public.programme_presenters, public.advertisements,
  public.site_settings, public.radio_settings
from anon;
revoke insert, delete, truncate on public.site_settings, public.radio_settings from authenticated;
revoke update, delete, truncate on public.audit_logs from authenticated;
revoke insert, delete, truncate on public.profiles from authenticated;
