-- ════════════════════════════════════════════════════════════════════
--  0005: explicit Data API privileges
--
--  Hosted Supabase projects do not always auto-grant API roles access to
--  tables created by migrations (the local CLI stack does). Grant exactly what
--  the app needs; Row Level Security (0002) still decides WHICH rows each role
--  can see or change.
-- ════════════════════════════════════════════════════════════════════

grant usage on schema public to anon, authenticated, service_role;

-- Server-side only (Netlify Functions): full access, bypasses RLS by design.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all routines in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- Public portfolio content: readable by visitors and signed-in users
-- (RLS limits rows to published / visible content; admins see everything).
grant select on
  public.profile,
  public.site_settings,
  public.experiences,
  public.skill_categories,
  public.skills,
  public.projects,
  public.project_images,
  public.education,
  public.documents
to anon, authenticated;

-- Admin CMS writes happen as `authenticated`; RLS only lets admins through.
grant insert, update, delete on
  public.profile,
  public.site_settings,
  public.experiences,
  public.skill_categories,
  public.skills,
  public.projects,
  public.project_images,
  public.education,
  public.documents,
  public.contact_messages,
  public.private_settings
to authenticated;

-- Private tables: only signed-in users can even attempt to read them (RLS: admins only).
grant select on public.contact_messages, public.private_settings to authenticated;

-- admin_users: a user may read only their own row (RLS); it is never written through the API.
grant select on public.admin_users to authenticated;
revoke insert, update, delete, truncate on public.admin_users from anon, authenticated;

-- Defence in depth: visitors never write anything and never touch private tables.
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke all on public.private_settings, public.contact_messages, public.admin_users from anon;

grant execute on function public.is_admin() to anon, authenticated;
