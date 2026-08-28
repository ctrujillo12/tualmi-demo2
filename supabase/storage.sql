-- ───────────────────────────────────────────────────────────────────────────
-- Storage bucket for customer review photos.
--
-- Run once in the Supabase SQL editor, after reviews.sql.
-- Safe to re-run.
--
-- PUBLIC bucket, on purpose: these images are rendered on the product page to
-- everyone, so there is nothing to protect and a signed URL would only add an
-- expiry to something that must not expire.
--
-- Note what "public" does and doesn't mean. Anyone with the URL can VIEW a
-- file. Nobody can upload — there is no insert policy below, so writes only
-- happen through app/api/reviews/route.ts using the service role key, after
-- the file has been size- and type-checked. An anonymous upload policy here
-- would let anyone with the public anon key fill your storage quota.
--
-- A photo is only ever visible on the site if its review is published, because
-- the product page reads photo_url off published rows only. An unpublished
-- review's photo is technically reachable by URL, but the URL is a random
-- filename nobody has.
-- ───────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  5242880,                                            -- 5 MB hard ceiling
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read. Deliberately no insert/update/delete policy — see the note above.
drop policy if exists "review photos are world readable" on storage.objects;
create policy "review photos are world readable"
  on storage.objects
  for select
  using (bucket_id = 'review-photos');
