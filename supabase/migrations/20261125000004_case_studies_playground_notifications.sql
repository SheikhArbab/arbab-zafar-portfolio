-- ════════════════════════════════════════════════════════════════════
--  0004: richer case studies, project-link display mode, admin-only
--        notification settings (where contact-form emails are delivered)
-- ════════════════════════════════════════════════════════════════════

-- Case study fields
alter table public.projects add column if not exists role    text not null default '' check (char_length(role) <= 2000);
alter table public.projects add column if not exists outcome text not null default '' check (char_length(outcome) <= 4000);

-- Where live/code links appear: only inside case studies (default), also on cards, or nowhere
alter table public.site_settings add column if not exists project_links text not null default 'case_study';
do $$ begin
  alter table public.site_settings add constraint site_settings_project_links_chk check (project_links in ('case_study', 'cards', 'hidden'));
exception when duplicate_object then null; end $$;

-- Private, admin-only settings (never readable by visitors, unlike site_settings)
create table if not exists public.private_settings (
  id              smallint primary key default 1 check (id = 1),
  notify_email    text not null default '' check (notify_email = '' or notify_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  notify_enabled  boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.private_settings enable row level security;
revoke all on public.private_settings from anon;

drop policy if exists "admin full access" on public.private_settings;
create policy "admin full access" on public.private_settings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop trigger if exists private_settings_updated_at on public.private_settings;
create trigger private_settings_updated_at before update on public.private_settings
  for each row execute function public.set_updated_at();
