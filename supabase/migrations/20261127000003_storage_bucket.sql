-- Public image bucket for the Media Library (Supabase Storage).
-- Reads are public (images are public website content). There are deliberately
-- NO insert/update/delete policies for clients: uploads and deletes happen only
-- from the server, after the admin check, using the secret key.
-- Skipped automatically where the storage schema does not exist (local tests).
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('media', 'media', true, 5242880, array['image/webp','image/jpeg','image/png','image/avif','image/gif'])
    on conflict (id) do update
      set public = true, file_size_limit = 5242880,
          allowed_mime_types = array['image/webp','image/jpeg','image/png','image/avif','image/gif'];
  end if;
end $$;
