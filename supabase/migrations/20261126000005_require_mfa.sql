-- ════════════════════════════════════════════════════════════════════
--  0010: admin access requires MFA.
--  Every admin policy (tables + storage) goes through is_admin(), so it is
--  enough to require an aal2 session here: a password-only (aal1) session
--  of an admin gets nothing beyond what anonymous visitors can read.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Lets a password-only session learn whether it belongs to an admin, so the app can show the
-- authenticator setup / code step. Grants no access by itself.
create or replace function public.is_admin_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin_account() from public;
grant execute on function public.is_admin_account() to authenticated;
