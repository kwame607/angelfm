-- Angel FM — core schema.
-- Conventions: UUID primary keys, timestamptz, validation via CHECK constraints,
-- indexes on every foreign key and common filter. JSONB is used only for the
-- small, display-only social_links lists.

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles
-- One row per dashboard user. Rows are created ONLY by the server-side admin
-- setup script (service role). There is no signup path: no trigger creates a
-- profile for new auth users, and RLS grants no INSERT to clients.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'admin' check (role in ('admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- media
create table public.media (
  id          uuid primary key default gen_random_uuid(),
  object_key  text not null unique,              -- key inside the R2 bucket
  public_url  text not null check (public_url ~ '^https?://'),
  filename    text not null,                     -- original name, display only
  mime_type   text not null check (mime_type in
                ('image/jpeg','image/png','image/webp','image/avif','audio/mpeg','audio/aac','audio/mp4')),
  size_bytes  bigint not null check (size_bytes > 0),
  width       integer check (width > 0),
  height      integer check (height > 0),
  alt_text    text,
  folder      text not null default 'general'
                check (folder in ('news','presenters','programmes','ads','general')),
  created_at  timestamptz not null default now()
);
create index media_folder_created_idx on public.media (folder, created_at desc);

-- ---------------------------------------------------------------- categories
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) between 1 and 60),
  slug       text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_key unique (slug),
  constraint categories_name_key unique (name)
);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- news_articles
create table public.news_articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  title              text not null check (length(btrim(title)) between 1 and 200),
  excerpt            text not null default '' check (length(excerpt) <= 500),
  body_html          text not null default '',          -- sanitised again at render time
  category_id        uuid references public.categories (id) on delete restrict,
  author_name        text,
  featured_image_id  uuid references public.media (id) on delete set null,
  image_alt          text not null default '',
  status             text not null default 'draft' check (status in ('draft','published')),
  published_at       timestamptz,
  is_featured        boolean not null default false,
  is_trending        boolean not null default false,
  seo_title          text check (length(seo_title) <= 70),
  seo_description    text check (length(seo_description) <= 200),
  created_by         uuid references public.profiles (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint news_articles_slug_key unique (slug),
  constraint news_published_needs_date check (status <> 'published' or published_at is not null)
);
create index news_status_published_idx on public.news_articles (status, published_at desc);
create index news_category_idx         on public.news_articles (category_id);
create index news_featured_idx         on public.news_articles (published_at desc) where is_featured;
create index news_image_idx            on public.news_articles (featured_image_id);
create trigger news_articles_updated_at before update on public.news_articles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- presenters
create table public.presenters (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name           text not null check (length(btrim(name)) between 1 and 120),
  bio            text not null default '' check (length(bio) <= 5000),
  photo_media_id uuid references public.media (id) on delete set null,
  social_links   jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint presenters_slug_key unique (slug)
);
create index presenters_photo_idx on public.presenters (photo_media_id);
create trigger presenters_updated_at before update on public.presenters
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- programmes
create table public.programmes (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title          text not null check (length(btrim(title)) between 1 and 120),
  description    text not null default '' check (length(description) <= 3000),
  image_media_id uuid references public.media (id) on delete set null,
  days           text[] not null
                   check (cardinality(days) between 1 and 7
                          and days <@ array['mon','tue','wed','thu','fri','sat','sun']::text[]),
  start_time     time not null,
  end_time       time not null,                         -- may be earlier than start (past midnight)
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint programmes_slug_key unique (slug),
  constraint programmes_times_differ check (start_time <> end_time)
);
create index programmes_active_idx on public.programmes (is_active, start_time);
create index programmes_image_idx  on public.programmes (image_media_id);
create trigger programmes_updated_at before update on public.programmes
  for each row execute function public.set_updated_at();

create table public.programme_presenters (
  programme_id uuid not null references public.programmes (id) on delete cascade,
  presenter_id uuid not null references public.presenters (id) on delete cascade,
  primary key (programme_id, presenter_id)
);
create index programme_presenters_presenter_idx on public.programme_presenters (presenter_id);

-- ---------------------------------------------------------------- advertisements
create table public.advertisements (
  id              uuid primary key default gen_random_uuid(),
  advertiser_name text not null check (length(btrim(advertiser_name)) between 1 and 120),
  placement       text not null check (placement in
                    ('home_banner','home_featured','news_list_banner','news_article_sidebar')),
  image_media_id  uuid not null references public.media (id) on delete restrict,
  alt_text        text not null default '',
  destination_url text not null check (destination_url ~* '^https?://[^\s]+$' and length(destination_url) <= 2000),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  is_enabled      boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint ads_window_valid check (ends_at > starts_at)
);
create index ads_serving_idx on public.advertisements (placement, is_enabled, starts_at, ends_at);
create index ads_image_idx   on public.advertisements (image_media_id);
create trigger advertisements_updated_at before update on public.advertisements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- site_settings (singleton)
create table public.site_settings (
  id           smallint primary key default 1 check (id = 1),
  site_name    text not null default 'Angel 96.1 FM',
  address      text,
  phone        text,
  email        text,
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  updated_at   timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
insert into public.site_settings (id) values (1);

-- ---------------------------------------------------------------- radio_settings (singleton)
-- PUBLIC by design: every column here is sent to listeners' browsers.
-- NEVER store provider credentials or API secrets in this table.
create table public.radio_settings (
  id                  smallint primary key default 1 check (id = 1),
  station_name        text not null default 'Angel 96.1 FM',
  tagline             text not null default '…the finest',
  frequency           text not null default '96.1 FM',
  stream_url          text check (stream_url ~* '^https?://[^\s]+$'),
  stream_format       text not null default 'mp3' check (stream_format in ('mp3','aac','hls')),
  streaming_provider  text,
  metadata_url        text check (metadata_url ~* '^https?://[^\s]+$'),
  fallback_stream_url text check (fallback_stream_url ~* '^https?://[^\s]+$'),
  updated_at          timestamptz not null default now()
);
create trigger radio_settings_updated_at before update on public.radio_settings
  for each row execute function public.set_updated_at();
insert into public.radio_settings (id) values (1);   -- stream_url stays NULL until supplied

-- ---------------------------------------------------------------- audit_logs
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null check (length(action) between 1 and 60),   -- e.g. 'article.publish'
  entity_type text not null,
  entity_id   uuid,
  summary     text not null default '',
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_idx   on public.audit_logs (actor_id);
