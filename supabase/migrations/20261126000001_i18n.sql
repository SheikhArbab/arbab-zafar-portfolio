-- ════════════════════════════════════════════════════════════════════
--  0006: per-language content (English is the base row; German lives in
--  translations.de and falls back to English field by field)
--  Shape: { "de": { "<column>": <value>, ... } }
--  site_settings.translations.de may also hold "content" (deep-merged).
-- ════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['profile','site_settings','experiences','skill_categories','projects','education','documents']
  loop
    execute format('alter table public.%I add column if not exists translations jsonb not null default ''{}''::jsonb', t);
    begin
      execute format('alter table public.%I add constraint %I check (jsonb_typeof(translations) = ''object'')', t, t || '_translations_object');
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
