-- Breaking news banner: an editor flags a published article as breaking for a limited time.
-- The banner shows only while is_breaking is true AND breaking_until is in the future,
-- so a forgotten flag can never leave an old story as "breaking".
alter table public.news_articles
  add column is_breaking    boolean not null default false,
  add column breaking_until timestamptz,
  add constraint news_breaking_needs_expiry check (not is_breaking or breaking_until is not null);

create index news_breaking_idx on public.news_articles (breaking_until desc) where is_breaking;
