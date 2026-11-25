-- Education entries: Intermediate (in progress) and Matric (completed).
-- Institution, board and years are filled in later in /admin → Education. Existing rows are never touched.

insert into public.education (id, kind, title, institution, date_label, description, certificate_url, credential_url, sort_order, is_visible, translations) values
  ('00000000-0000-4000-8000-000000004000', 'education', 'Intermediate (HSSC)', '', 'In progress', 'Currently studying for the Higher Secondary School Certificate (Intermediate), Pakistan.', null, '', 0, true, '{"de":{"date_label":"Laufend","description":"Aktuell: Higher Secondary School Certificate (Intermediate), Pakistan."}}'::jsonb),
  ('00000000-0000-4000-8000-000000004001', 'education', 'Matric (SSC)', '', 'Completed', 'Secondary School Certificate (Matric), Pakistan.', null, '', 1, true, '{"de":{"date_label":"Abgeschlossen","description":"Secondary School Certificate (Matric), Pakistan."}}'::jsonb)
on conflict (id) do nothing;
