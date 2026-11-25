-- ════════════════════════════════════════════════════════════════════
--  Arbab Zafar Portfolio: core schema
--  Run order: 0001_schema → 0002_security → 0003_storage → seed.sql
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- updated_at maintenance ------------------------------------------------
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

-- profile (singleton) ---------------------------------------------------
create table if not exists public.profile (
  id                 smallint primary key default 1 check (id = 1),
  full_name          text not null default '' check (char_length(full_name) <= 120),
  short_name         text not null default '' check (char_length(short_name) <= 40),
  title              text not null default '' check (char_length(title) <= 160),
  location           text not null default '',
  email              text not null default '' check (email = '' or email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  is_available       boolean not null default true,
  availability_text  text not null default '',
  avatar_url         text,
  hero_eyebrow       text not null default '',
  hero_heading       text not null default '' check (char_length(hero_heading) <= 200),
  hero_highlight     text not null default '',
  hero_description   text not null default '' check (char_length(hero_description) <= 600),
  hero_roles         text[] not null default '{}',
  terminal_lines     jsonb not null default '[]'::jsonb check (jsonb_typeof(terminal_lines) = 'array'),
  about_heading      text not null default '',
  about_lead         text not null default '',
  about_body         text not null default '' check (char_length(about_body) <= 6000),
  about_highlights   jsonb not null default '[]'::jsonb check (jsonb_typeof(about_highlights) = 'array'),
  about_cards        jsonb not null default '[]'::jsonb check (jsonb_typeof(about_cards) = 'array'),
  about_image_url    text,
  socials            jsonb not null default '[]'::jsonb check (jsonb_typeof(socials) = 'array'),
  german             jsonb not null default '{}'::jsonb check (jsonb_typeof(german) = 'object'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- site_settings (singleton) ---------------------------------------------
create table if not exists public.site_settings (
  id                   smallint primary key default 1 check (id = 1),
  site_name            text not null default '',
  site_url             text not null default '' check (site_url = '' or site_url ~* '^https?://'),
  seo_title            text not null default '' check (char_length(seo_title) <= 120),
  seo_description      text not null default '' check (char_length(seo_description) <= 400),
  seo_keywords         text[] not null default '{}',
  og_image_url         text,
  favicon_url          text,
  twitter_handle       text not null default '',
  robots_index         boolean not null default true,
  accent_primary       text not null default '#3dff9a' check (accent_primary ~* '^#[0-9a-f]{6}$'),
  accent_secondary     text not null default '#38d6ff' check (accent_secondary ~* '^#[0-9a-f]{6}$'),
  animation_level      text not null default 'full' check (animation_level in ('full', 'reduced', 'off')),
  enable_3d            boolean not null default true,
  sections             jsonb not null default '{}'::jsonb check (jsonb_typeof(sections) = 'object'),
  maintenance_mode     boolean not null default false,
  maintenance_message  text not null default '',
  content              jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- experiences -----------------------------------------------------------
create table if not exists public.experiences (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 1 and 160),
  company           text not null default '' check (char_length(company) <= 160),
  employment_type   text not null default '',
  location          text not null default '',
  start_date        date,
  end_date          date,
  is_current        boolean not null default false,
  description       text not null default '' check (char_length(description) <= 2000),
  responsibilities  text[] not null default '{}',
  technologies      text[] not null default '{}',
  achievements      text[] not null default '{}',
  logo_url          text,
  sort_order        integer not null default 0,
  is_visible        boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint experiences_dates_chk check (end_date is null or start_date is null or end_date >= start_date)
);
create index if not exists experiences_order_idx on public.experiences (sort_order);

-- skill_categories ------------------------------------------------------
create table if not exists public.skill_categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 80),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text not null default '',
  sort_order   integer not null default 0,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- skills ----------------------------------------------------------------
create table if not exists public.skills (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null check (char_length(name) between 1 and 80),
  category_id        uuid references public.skill_categories (id) on delete set null,
  icon               text not null default '' check (icon ~ '^[a-z0-9.+-]*$'),
  icon_url           text,
  proficiency        text not null default 'hidden' check (proficiency in ('hidden', 'beginner', 'intermediate', 'advanced', 'custom')),
  proficiency_label  text not null default '' check (char_length(proficiency_label) <= 60),
  is_featured        boolean not null default false,
  is_visible         boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists skills_category_idx on public.skills (category_id, sort_order);

-- projects --------------------------------------------------------------
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null check (char_length(title) between 1 and 160),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description  text not null default '' check (char_length(short_description) <= 400),
  description        text not null default '' check (char_length(description) <= 12000),
  thumbnail_url      text,
  technologies       text[] not null default '{}',
  category           text not null default '',
  live_url           text not null default '' check (live_url = '' or live_url ~* '^https?://'),
  repo_url           text not null default '' check (repo_url = '' or repo_url ~* '^https?://'),
  is_featured        boolean not null default false,
  status             text not null default '',
  started_on         date,
  completed_on       date,
  challenges         text not null default '' check (char_length(challenges) <= 6000),
  solutions          text not null default '' check (char_length(solutions) <= 6000),
  key_features       text[] not null default '{}',
  sort_order         integer not null default 0,
  is_published       boolean not null default false,
  seo_title          text not null default '' check (char_length(seo_title) <= 120),
  seo_description    text not null default '' check (char_length(seo_description) <= 400),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists projects_order_idx on public.projects (is_published, sort_order);

-- project_images --------------------------------------------------------
create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  url         text not null,
  alt         text not null default '' check (char_length(alt) <= 300),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

-- education -------------------------------------------------------------
create table if not exists public.education (
  id               uuid primary key default gen_random_uuid(),
  kind             text not null default 'education' check (kind in ('education', 'course', 'certification', 'training')),
  title            text not null check (char_length(title) between 1 and 200),
  institution      text not null default '',
  date_label       text not null default '' check (char_length(date_label) <= 80),
  description      text not null default '' check (char_length(description) <= 2000),
  certificate_url  text,
  credential_url   text not null default '' check (credential_url = '' or credential_url ~* '^https?://'),
  sort_order       integer not null default 0,
  is_visible       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- documents (CVs etc.) --------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'other' check (kind in ('cv_en', 'cv_de', 'other')),
  title       text not null default '',
  file_path   text,
  file_url    text not null,
  file_name   text not null default '',
  file_size   bigint,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- Only one English and one German CV at a time.
create unique index if not exists documents_single_cv_idx on public.documents (kind) where kind in ('cv_en', 'cv_de');

-- contact_messages ------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) <= 200 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  subject     text not null check (char_length(subject) between 3 and 150),
  message     text not null check (char_length(message) between 10 and 5000),
  status      text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  ip_hash     text,
  user_agent  text check (char_length(user_agent) <= 400),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);

-- updated_at triggers ---------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profile','site_settings','experiences','skill_categories','skills','projects','project_images','education','documents','contact_messages']
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;
