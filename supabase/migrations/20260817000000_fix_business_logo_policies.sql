-- Recreate logo policies for projects where the bucket was created manually.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-logos', 'business-logos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Users can read their business logo" on storage.objects;
drop policy if exists "Users can upload their business logo" on storage.objects;
drop policy if exists "Users can update their business logo" on storage.objects;
drop policy if exists "Users can delete their business logo" on storage.objects;

create policy "Users can read their business logo" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'business-logos'
    and name like ((select auth.uid())::text || '/%')
  );

create policy "Users can upload their business logo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'business-logos'
    and name like ((select auth.uid())::text || '/%')
  );

create policy "Users can update their business logo" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'business-logos'
    and name like ((select auth.uid())::text || '/%')
  )
  with check (
    bucket_id = 'business-logos'
    and name like ((select auth.uid())::text || '/%')
  );

create policy "Users can delete their business logo" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'business-logos'
    and name like ((select auth.uid())::text || '/%')
  );
