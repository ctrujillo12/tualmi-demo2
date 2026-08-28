-- ───────────────────────────────────────────────────────────────────────────
-- Product reviews
--
-- Run once in the Supabase SQL editor:
--   dashboard → SQL Editor → New query → paste → Run
--
-- Safe to re-run: every statement is idempotent.
--
-- ── HOW A REVIEW GETS ONTO THE SITE ──────────────────────────────────────
--   1. Someone fills in the form at /review (or from a product page)
--   2. POST /api/reviews validates it and inserts with status = 'pending'
--   3. You read it in the Supabase table editor and set status = 'published'
--   4. It appears on the product page within ~5 minutes (cache window)
--
-- Nothing a stranger types is ever visible until you have looked at it. That
-- is the whole moderation system, and at your volume it is the right size.
--
-- ── WHY THERE IS NO INSERT POLICY ────────────────────────────────────────
-- Reads use the anon key, which ships in the browser bundle and is public by
-- design — the SELECT policy below is what makes that safe. Writes do NOT use
-- it. If anonymous inserts were allowed, anyone who read the key out of the
-- page source could write straight to this table and skip the rate limiting,
-- the honeypot and the validation in the API route. So inserts go through
-- SUPABASE_SERVICE_ROLE_KEY server-side only, which bypasses RLS by design.
-- Keep that key out of anything prefixed NEXT_PUBLIC_.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- What was reviewed. The SITE handle ('sierra-shorts'), not Shopify's.
  product_handle  text not null,
  colorway        text,

  rating          smallint not null check (rating between 1 and 5),
  title           text,
  body            text not null,

  -- Display name: first name + last initial. A fully anonymous review reads
  -- as invented. Email and order number are for verifying a real purchase and
  -- are never selected by the storefront query.
  author_name     text not null,
  email           text,
  order_number    text,

  -- Fit context. The most useful thing in an apparel review, and the reason
  -- someone stops worrying about ordering the wrong size.
  height          text,
  usual_size      text,
  size_purchased  text,
  fit             text check (fit in ('small', 'true', 'large')),

  -- Where they wore them: "gym & climbing", "Middle Teton". Adds credibility
  -- for free.
  activity        text,
  photo_url       text,

  -- Permission to show their name, height and photo. Reviews without it can
  -- still be read privately; they must not be published.
  consent         boolean not null default false,

  verified        boolean not null default false,
  source          text not null default 'form'
                    check (source in ('form', 'tally', 'manual', 'gifted', 'email')),
  status          text not null default 'pending'
                    check (status in ('pending', 'published', 'rejected')),
  hold_reason     text
);

-- Columns added after the first version of this file. Written as separate
-- statements so an existing table picks them up on a re-run.
alter table public.reviews add column if not exists colorway     text;
alter table public.reviews add column if not exists order_number text;
alter table public.reviews add column if not exists fit          text;
alter table public.reviews add column if not exists activity     text;
alter table public.reviews add column if not exists photo_url    text;
alter table public.reviews add column if not exists consent      boolean not null default false;
alter table public.reviews add column if not exists hold_reason  text;

-- The storefront only ever asks for published rows of one product.
create index if not exists reviews_published_by_handle_idx
  on public.reviews (product_handle, created_at desc)
  where status = 'published';

-- Moderation queue: "what came in that I haven't looked at".
create index if not exists reviews_pending_idx
  on public.reviews (created_at desc)
  where status = 'pending';

-- ── Row level security ─────────────────────────────────────────────────────
alter table public.reviews enable row level security;

drop policy if exists "published reviews are world readable" on public.reviews;
create policy "published reviews are world readable"
  on public.reviews
  for select
  using (status = 'published');

-- Deliberately no insert / update / delete policy. See the note at the top.
