-- ───────────────────────────────────────────────────────────────────────────
-- Product reviews
--
-- Run this once in the Supabase SQL editor:
--   Supabase dashboard → SQL Editor → New query → paste → Run
--
-- Design notes, so the next person doesn't have to guess:
--
--  * `product_handle` is the SITE handle ('sierra-shorts', 'juniper-pant'),
--    not Shopify's. Shopify's handles differ and are being renamed; the site's
--    are what the product page knows about.
--
--  * The fit columns are the point. For apparel, "5'6\", usually a M, bought M"
--    does more for conversion and for the return rate than the star rating
--    does. They're all nullable — an older review that predates the question
--    just renders without that line.
--
--  * `status` defaults to 'pending'. Nothing appears on the site until someone
--    sets it to 'published'. The RLS policy below enforces that at the database
--    level, not just in the query, so a mistake in application code can't leak
--    an unmoderated review.
--
--  * `source` separates a verified buyer from a gifted creator. The FTC
--    requires the material connection behind a gifted review to be disclosed,
--    and the product page renders a visible tag for source = 'gifted'. Don't
--    file a gifted review as 'tally' to make the tag go away.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- What was reviewed
  product_handle  text not null,
  color           text,

  -- The review
  rating          smallint not null check (rating between 1 and 5),
  title           text,
  body            text not null,

  -- Who wrote it. Display name only — keep surnames and emails out of the
  -- column that gets rendered. `email` is for matching against orders, and is
  -- never selected by the storefront query.
  author_name     text not null,
  email           text,

  -- Fit context. The most useful thing in an apparel review.
  height          text,          -- e.g. "5'6\""
  usual_size      text,          -- e.g. "M"
  size_purchased  text,          -- e.g. "M"

  -- Provenance and moderation
  source          text not null default 'tally'
                    check (source in ('tally', 'manual', 'gifted', 'email')),
  verified        boolean not null default false,
  status          text not null default 'pending'
                    check (status in ('pending', 'published', 'rejected'))
);

-- The storefront only ever queries published rows for one handle.
create index if not exists reviews_published_by_handle_idx
  on public.reviews (product_handle, created_at desc)
  where status = 'published';

-- ── Row level security ─────────────────────────────────────────────────────
-- The storefront reads with the ANON key, so the database itself has to be the
-- thing that refuses to hand out unpublished reviews.
alter table public.reviews enable row level security;

drop policy if exists "published reviews are world readable" on public.reviews;
create policy "published reviews are world readable"
  on public.reviews
  for select
  using (status = 'published');

-- No insert/update/delete policy is defined on purpose: writes go through the
-- service role key (the import script, the Supabase table editor), which
-- bypasses RLS. Nothing anonymous can write a review until there's a form,
-- and when there is one it should insert with status = 'pending'.
