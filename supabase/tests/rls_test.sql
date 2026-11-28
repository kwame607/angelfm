-- Runs after both migrations. Any failed assertion aborts with a clear message.
\set ON_ERROR_STOP on
create schema t;
grant usage on schema t to anon, authenticated;

create function t.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FAIL: %', msg; end if;
  raise notice 'pass: %', msg;
end $$;

-- Runs sql (as the current role) and asserts that it raises an error.
create function t.fails(sql text, msg text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    raise notice 'pass: % (%)', msg, sqlerrm;
    return;
  end;
  raise exception 'FAIL: % (statement succeeded: %)', msg, sql;
end $$;

create function t.count(tbl text) returns bigint language plpgsql as $$
declare n bigint; begin execute format('select count(*) from %s', tbl) into n; return n; end $$;

grant execute on all functions in schema t to anon, authenticated;

-- ---------------------------------------------------------------- fixtures (superuser)
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@example.test'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'stranger@example.test');
insert into public.profiles (id, email, display_name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'admin@example.test', 'Admin');

insert into public.categories (name, slug) values ('Local', 'local');
insert into public.media (object_key, public_url, filename, mime_type, size_bytes)
  values ('ads/x.jpg', 'https://m.example.test/ads/x.jpg', 'x.jpg', 'image/jpeg', 1000);

insert into public.news_articles (slug, title, status, published_at) values
  ('live-story',   'Live',   'published', now() - interval '1 day'),
  ('future-story', 'Future', 'published', now() + interval '1 day'),
  ('draft-story',  'Draft',  'draft',     null);

insert into public.advertisements (advertiser_name, placement, image_media_id, destination_url, starts_at, ends_at, is_enabled)
select n, 'home_banner', (select id from public.media limit 1), 'https://ads.example.test', s, e, en
from (values
  ('live',     now() - interval '1 day',  now() + interval '1 day',  true),
  ('expired',  now() - interval '3 days', now() - interval '1 day',  true),
  ('upcoming', now() + interval '1 day',  now() + interval '3 days', true),
  ('disabled', now() - interval '1 day',  now() + interval '1 day',  false)
) as v(n, s, e, en);

insert into public.programmes (slug, title, days, start_time, end_time, is_active) values
  ('active-show',   'Active',   array['mon','tue'], '06:00', '10:00', true),
  ('inactive-show', 'Inactive', array['sat'],       '10:00', '12:00', false);

-- ---------------------------------------------------------------- anonymous visitor
set role anon;
select t.ok(t.count('public.news_articles') = 1, 'anon sees only the 1 published, already-live article');
select t.ok(t.count('public.advertisements') = 1, 'anon sees only the 1 live ad (expired/upcoming/disabled hidden)');
select t.ok(t.count('public.programmes') = 1, 'anon sees only active programmes');
select t.ok(t.count('public.radio_settings') = 1, 'anon can read radio settings');
select t.ok(t.count('public.site_settings') = 1, 'anon can read site settings');
select t.fails('select * from public.profiles', 'anon cannot read profiles');
select t.fails('select * from public.audit_logs', 'anon cannot read audit_logs');
select t.fails($$insert into public.categories (name, slug) values ('Hack','hack')$$, 'anon cannot insert categories');
select t.fails($$update public.radio_settings set stream_url = 'https://evil.test/s'$$, 'anon cannot change radio settings');
reset role;

-- ---------------------------------------------------------------- signed-in user WITHOUT admin profile
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-0000-0000-000000000002', false);
select t.ok(t.count('public.news_articles') = 1, 'non-admin user sees only published articles');
select t.ok(t.count('public.profiles') = 0, 'non-admin user sees no profiles');
select t.ok(t.count('public.audit_logs') = 0, 'non-admin user sees no audit logs');
select t.fails($$insert into public.categories (name, slug) values ('Nope','nope')$$, 'non-admin cannot insert categories');
select t.fails($$insert into public.profiles (id, email) values ('bbbbbbbb-0000-0000-0000-000000000002','s@example.test')$$, 'user cannot self-create a profile (no registration)');
do $$ declare n int; begin
  update public.radio_settings set stream_url = 'https://evil.test/s';
  get diagnostics n = row_count;
  perform t.ok(n = 0, 'non-admin update of radio settings affects 0 rows');
end $$;
reset role;

-- ---------------------------------------------------------------- the administrator
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000001', false);
select t.ok(t.count('public.news_articles') = 3, 'admin sees drafts and scheduled articles too');
select t.ok(t.count('public.advertisements') = 4, 'admin sees all ads');
select t.ok(t.count('public.programmes') = 2, 'admin sees inactive programmes');
insert into public.categories (name, slug) values ('Sports', 'sports');
select t.ok(t.count('public.categories') = 2, 'admin can insert categories');
update public.radio_settings set stream_url = 'https://stream.example.test/live', stream_format = 'mp3';
select t.ok((select stream_url from public.radio_settings) = 'https://stream.example.test/live', 'admin can update radio settings');
select t.fails('delete from public.radio_settings', 'admin cannot delete the radio settings row');
select t.fails('delete from public.site_settings', 'admin cannot delete the site settings row');
select t.fails($$update public.profiles set role = 'admin', email = 'x@example.test'$$, 'admin cannot edit role/email columns from the client');
update public.profiles set display_name = 'Station Admin';
select t.ok((select display_name from public.profiles) = 'Station Admin', 'admin can rename own profile');
select t.fails('delete from public.profiles', 'admin cannot delete profiles from the client');
insert into public.audit_logs (actor_id, action, entity_type, summary)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'test.action', 'test', 'ok');
select t.ok(t.count('public.audit_logs') = 1, 'admin can append audit log entries');
select t.fails($$insert into public.audit_logs (actor_id, action, entity_type) values ('bbbbbbbb-0000-0000-0000-000000000002','spoof','test')$$, 'admin cannot forge audit entries as someone else');
select t.fails('update public.audit_logs set summary = ''edited''', 'audit log cannot be edited');
select t.fails('delete from public.audit_logs', 'audit log cannot be deleted');

-- ---------------------------------------------------------------- data validation constraints
select t.fails($$insert into public.news_articles (slug, title, status) values ('no-date','T','published')$$, 'published article requires a publication date');
select t.fails($$insert into public.news_articles (slug, title) values ('Bad Slug!','T')$$, 'invalid slug rejected');
select t.fails($$insert into public.advertisements (advertiser_name, placement, image_media_id, destination_url, starts_at, ends_at) select 'a','home_banner',id,'javascript:alert(1)',now(),now()+interval '1 day' from public.media$$, 'ad with javascript: URL rejected');
select t.fails($$insert into public.advertisements (advertiser_name, placement, image_media_id, destination_url, starts_at, ends_at) select 'a','home_banner',id,'https://ok.test',now(),now() - interval '1 day' from public.media$$, 'ad ending before it starts rejected');
select t.fails($$insert into public.advertisements (advertiser_name, placement, image_media_id, destination_url, starts_at, ends_at) select 'a','sidebar_typo',id,'https://ok.test',now(),now()+interval '1 day' from public.media$$, 'unknown ad placement rejected');
select t.fails($$insert into public.programmes (slug, title, days, start_time, end_time) values ('bad-days','T',array['funday'],'06:00','07:00')$$, 'invalid broadcast day rejected');
select t.fails($$insert into public.programmes (slug, title, days, start_time, end_time) values ('same-time','T',array['mon'],'06:00','06:00')$$, 'zero-length programme rejected');
select t.fails($$update public.radio_settings set stream_url = 'ftp://nope.test/s'$$, 'non-http stream URL rejected');
select t.fails($$insert into public.site_settings (id) values (2)$$, 'second site_settings row rejected (singleton)');
select t.fails($$insert into public.news_articles (slug, title, status, published_at, is_breaking) values ('brk-no-expiry','T','published', now(), true)$$, 'breaking article requires an expiry time');
reset role;

-- breaking flag: accepted with an expiry, defaults to off, and drafts stay hidden from the public
insert into public.news_articles (slug, title, status, published_at, is_breaking, breaking_until)
  values ('brk-ok','Breaking story','published', now() - interval '1 minute', true, now() + interval '2 hours');
select t.ok((select bool_and(not is_breaking) from public.news_articles where slug <> 'brk-ok'), 'is_breaking defaults to false');
set role anon;
select t.ok((select count(*) from public.news_articles where is_breaking and breaking_until > now()) = 1, 'anon can read the active breaking story');
reset role;

-- updated_at trigger actually fires (superuser, later transaction than the insert)
select pg_sleep(0.05);
update public.categories set name = 'Local News' where slug = 'local';
select t.ok((select updated_at > created_at from public.categories where slug = 'local'), 'updated_at is bumped by the trigger');

\echo ALL TESTS PASSED
