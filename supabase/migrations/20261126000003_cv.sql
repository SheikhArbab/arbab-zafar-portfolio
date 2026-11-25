-- ════════════════════════════════════════════════════════════════════
--  0008: CV generator details on the profile (phone, nationality,
--  languages, …). Public like the rest of the profile, so every field is
--  optional and empty fields are left off the generated CV.
-- ════════════════════════════════════════════════════════════════════

alter table public.profile add column if not exists cv jsonb not null default '{}'::jsonb;

do $$
begin
  alter table public.profile add constraint profile_cv_object check (jsonb_typeof(cv) = 'object');
exception when duplicate_object then null;
end $$;
