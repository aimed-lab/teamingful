-- Storage policies for the private "captures" bucket. Run after 0002_capture.sql.
-- Create the bucket first (Storage > New bucket > name: captures, Public: off).
-- Files live at <user_id>/<capture_id>/<n>.<ext>, so the first folder is the owner.

create policy "captures insert own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "captures select own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "captures delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- upload with upsert (used when a failed upload is retried) needs update too
create policy "captures update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
