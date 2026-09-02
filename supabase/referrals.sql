-- ───────────────────────────────────────────────────────────────────────────
-- Refer a friend: both sides get 10% when the friend joins the mailing list.
--
-- Run once in the Supabase SQL editor, after reviews.sql. Safe to re-run.
--
-- Two tables, because they answer different questions:
--   referral_codes  — who owns which link  ("whose code is TRAIL-7F2K?")
--   referrals       — who referred whom    ("has this friend been counted?")
--
-- ── WHY THE CAPS EXIST ───────────────────────────────────────────────────
-- Rewarding on a list JOIN rather than a purchase means a referral costs a
-- throwaway email address. Left open, that is a machine for turning your
-- margin into unengaged subscribers — and unengaged subscribers are already
-- what is dragging your open rates down. The constraints below are what make
-- the join-triggered version survivable:
--
--   * friend_email is UNIQUE — one address can only ever be referred once,
--     by anyone, ever. Enforced by the database, not by application code.
--   * normalized_email strips Gmail dots and +aliases, so foo+1@gmail.com and
--     f.o.o@gmail.com collapse to one identity and cannot each earn a reward.
--   * The reward cap per referrer is enforced in lib/referrals.ts.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.referral_codes (
  code            text primary key,
  email           text not null,
  normalized      text not null unique,
  created_at      timestamptz not null default now()
);

create table if not exists public.referrals (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),

  code                     text not null references public.referral_codes(code),
  referrer_email           text not null,
  referrer_normalized      text not null,

  friend_email             text not null,
  -- The real guard. One person, one referral, forever — whichever spelling of
  -- their address they use and whoever refers them.
  friend_normalized        text not null unique,

  -- Set once the Klaviyo events have been fired for this pair, so a retry or a
  -- double form submission can't hand out a second pair of codes.
  rewarded                 boolean not null default false
);

create index if not exists referrals_by_referrer_idx
  on public.referrals (referrer_normalized, created_at desc);

-- ── Row level security ─────────────────────────────────────────────────────
-- Nothing here is public. Referral codes map to customer email addresses, and
-- the referrals table is a social graph of who knows whom — neither should be
-- readable with the anon key that ships in the browser bundle. Every read and
-- write goes through the API routes using the service role key, which bypasses
-- RLS. Enabling it with no policy means "deny all" to everyone else.
alter table public.referral_codes enable row level security;
alter table public.referrals      enable row level security;

-- ── Useful views for you ───────────────────────────────────────────────────
-- Who is actually referring people:
--
--   select referrer_email, count(*) as friends_joined
--     from public.referrals
--    group by referrer_email
--    order by friends_joined desc;
--
-- Anyone at the cap (investigate before raising it for them):
--
--   select referrer_email, count(*)
--     from public.referrals
--    group by referrer_email
--   having count(*) >= 5;
