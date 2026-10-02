-- ───────────────────────────────────────────────────────────────────────────
-- Signups: a backup copy of every email / phone / event RSVP
--
-- Run once in the Supabase SQL editor:
--   dashboard → SQL Editor → New query → paste → Run
--
-- Safe to re-run: every statement is idempotent.
--
-- ── WHAT THIS IS FOR ─────────────────────────────────────────────────────
-- Klaviyo is where emails and texts are sent from. This table is the second
-- copy, so a signup can never be lost if Klaviyo rejects it or is misconfigured.
-- /api/subscribe writes a row here BEFORE calling Klaviyo, then sets
-- klaviyo_status to 'ok' or 'failed'.
--
-- One row per form submission (append-only). The same person can appear more
-- than once, e.g. an email signup followed later by the phone step.
--
-- ── FINDING SIGNUPS THAT NEVER REACHED KLAVIYO ───────────────────────────
--   select created_at, email, phone, source, event_id, klaviyo_error
--   from public.signups
--   where klaviyo_status <> 'ok'
--   order by created_at desc;
-- Anything that shows up there can be re-imported into Klaviyo by hand
-- (Klaviyo → Lists → Trailblazing Club → Add profiles → upload CSV).
--
-- ── WHO IS GOING TO AN EVENT ─────────────────────────────────────────────
--   select first_name, email, phone, sms_consent, created_at
--   from public.signups
--   where event_id = 'ojai-hike-day'
--   order by created_at;
--
-- ── EVENT INTEREST ANSWERS (ride: need_ride/own_ride, camera: has_camera/need_disposable, instagram) ──────────────────────
-- Stored inside the attribution jsonb under 'rsvp':
--   select first_name, email,
--          attribution->'rsvp'->>'ride'      as ride,
--          attribution->'rsvp'->>'camera'    as camera,
--          attribution->'rsvp'->>'instagram' as instagram
--   from public.signups
--   where event_id = 'logging-off-idyllwild'
--   order by created_at;
--
-- ── PRIVACY: WHY THERE ARE NO POLICIES ───────────────────────────────────
-- This table holds emails and phone numbers. Row level security is ON with no
-- policies, so the public anon key (which ships in the browser bundle) can
-- neither read nor write it. Only the server, using SUPABASE_SERVICE_ROLE_KEY,
-- can touch it. Keep that key out of anything prefixed NEXT_PUBLIC_.
-- Phone numbers are stored only when the person ticked the SMS consent box.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.signups (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  email           text not null,
  first_name      text,

  -- E.164 (+13105551234). Only present when sms_consent is true.
  phone           text,
  sms_consent     boolean not null default false,

  -- Which form: 'event-rsvp', 'invite', 'footer', 'popup', ...
  source          text,
  -- lib/events.ts id for event RSVPs, e.g. 'ojai-hike-day'.
  event_id        text,
  -- Referral code from a friend's ?ref= link, if any.
  ref             text,
  -- UTM params + referrer captured client-side (lib/attribution.ts).
  attribution     jsonb,

  -- How Klaviyo answered. 'pending' that never changes means the request died
  -- between the insert and the answer; treat it like 'failed'.
  klaviyo_status  text not null default 'pending'
                    check (klaviyo_status in ('pending', 'ok', 'failed', 'not_configured')),
  klaviyo_error   text
);

create index if not exists signups_email_idx   on public.signups (lower(email));
create index if not exists signups_event_idx   on public.signups (event_id) where event_id is not null;
create index if not exists signups_status_idx  on public.signups (klaviyo_status) where klaviyo_status <> 'ok';
create index if not exists signups_created_idx on public.signups (created_at desc);

alter table public.signups enable row level security;
-- Intentionally NO policies. See the privacy note above.
