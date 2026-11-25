-- ════════════════════════════════════════════════════════════════════
--  0011: admin-editable interface text (buttons, labels, messages, …).
--  Shape: { "en": { "<path>": "<text>" }, "de": { … } }. Empty or missing
--  entries fall back to the built-in text, so nothing breaks by default.
-- ════════════════════════════════════════════════════════════════════

alter table public.site_settings add column if not exists ui_text jsonb not null default '{}'::jsonb;

do $$
begin
  alter table public.site_settings add constraint site_settings_ui_text_object check (jsonb_typeof(ui_text) = 'object');
exception when duplicate_object then null;
end $$;
