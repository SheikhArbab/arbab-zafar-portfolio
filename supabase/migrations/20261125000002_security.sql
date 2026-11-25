-- ════════════════════════════════════════════════════════════════════
--  Authorization & Row Level Security
--
--  Model:
--   • anon / any visitor  → SELECT published/visible portfolio content only
--   • admin (row in admin_users) → full CRUD
--   • contact_messages    → no public access at all; inserts happen only in the
--                           Netlify function using the service-role key (bypasses RLS)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- SECURITY DEFINER so it can read admin_users regardless of the caller's RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Enable RLS everywhere -------------------------------------------------
alter table public.admin_users       enable row level security;
alter table public.profile           enable row level security;
alter table public.site_settings     enable row level security;
alter table public.experiences       enable row level security;
alter table public.skill_categories  enable row level security;
alter table public.skills            enable row level security;
alter table public.projects          enable row level security;
alter table public.project_images    enable row level security;
alter table public.education         enable row level security;
alter table public.documents         enable row level security;
alter table public.contact_messages  enable row level security;

-- Defence in depth: anonymous role can never write, regardless of policies.
revoke insert, update, delete, truncate on all tables in schema public from anon;

-- Helper to (re)create policies idempotently.
do $$
declare t text;
begin
  foreach t in array array['profile','site_settings','experiences','skill_categories','skills','projects','project_images','education','documents','contact_messages','admin_users']
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('drop policy if exists "read own admin row" on public.%I', t);
  end loop;
end $$;

-- Admin: full access on content tables + messages ------------------------
do $$
declare t text;
begin
  foreach t in array array['profile','site_settings','experiences','skill_categories','skills','projects','project_images','education','documents','contact_messages']
  loop
    execute format(
      'create policy "admin full access" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
  end loop;
end $$;

-- Public read: only what is published / visible ----------------------------
create policy "public read" on public.profile       for select to anon, authenticated using (true);
create policy "public read" on public.site_settings for select to anon, authenticated using (true);

create policy "public read" on public.experiences      for select to anon, authenticated using (is_visible);
create policy "public read" on public.skill_categories for select to anon, authenticated using (is_visible);
create policy "public read" on public.education        for select to anon, authenticated using (is_visible);
create policy "public read" on public.documents        for select to anon, authenticated using (is_visible);
create policy "public read" on public.projects         for select to anon, authenticated using (is_published);

create policy "public read" on public.skills for select to anon, authenticated using (
  is_visible and (
    category_id is null
    or exists (select 1 from public.skill_categories c where c.id = category_id and c.is_visible)
  )
);

create policy "public read" on public.project_images for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.is_published)
);

-- contact_messages: intentionally NO public policy (no read, no insert).

-- admin_users: a signed-in user may only see whether *they* are an admin.
-- Rows are managed from the Supabase SQL editor (see README), never from the app.
create policy "read own admin row" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.admin_users from anon, authenticated;
