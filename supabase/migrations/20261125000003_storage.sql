-- ════════════════════════════════════════════════════════════════════
--  Storage buckets & policies
--   media      → images (profile, project thumbnails/galleries, logos, icons, OG)
--   documents  → CV PDFs, certificates
--  Both are public-READ by URL (that's what a portfolio needs) but not listable,
--  and only admins can upload / replace / delete.
-- ════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']),
  ('documents', 'documents', true, 10485760,
    array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio admin select" on storage.objects;
drop policy if exists "portfolio admin insert" on storage.objects;
drop policy if exists "portfolio admin update" on storage.objects;
drop policy if exists "portfolio admin delete" on storage.objects;

create policy "portfolio admin select" on storage.objects
  for select to authenticated
  using (bucket_id in ('media', 'documents') and (select public.is_admin()));

create policy "portfolio admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('media', 'documents') and (select public.is_admin()));

create policy "portfolio admin update" on storage.objects
  for update to authenticated
  using (bucket_id in ('media', 'documents') and (select public.is_admin()))
  with check (bucket_id in ('media', 'documents') and (select public.is_admin()));

create policy "portfolio admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('media', 'documents') and (select public.is_admin()));
