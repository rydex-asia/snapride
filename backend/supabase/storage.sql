-- Run once in the Supabase SQL editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('parcel-proofs', 'parcel-proofs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('support-attachments', 'support-attachments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their private objects" on storage.objects;
create policy "Users can read their private objects"
on storage.objects for select
to authenticated
using (
  bucket_id in ('avatars', 'parcel-proofs', 'support-attachments')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can upload their private objects" on storage.objects;
create policy "Users can upload their private objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('avatars', 'parcel-proofs', 'support-attachments')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can update their private objects" on storage.objects;
create policy "Users can update their private objects"
on storage.objects for update
to authenticated
using (
  bucket_id in ('avatars', 'parcel-proofs', 'support-attachments')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id in ('avatars', 'parcel-proofs', 'support-attachments')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can delete their private objects" on storage.objects;
create policy "Users can delete their private objects"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('avatars', 'parcel-proofs', 'support-attachments')
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
