-- ───────────────────────────────────────────────────────────────────────────
-- The one review that already exists, from the old Tally form.
--
-- Run AFTER reviews.sql, once. Safe to re-run: it does nothing if the review
-- is already there.
--
-- It lands as PENDING and must stay that way until you have spoken to her.
-- Two things are missing and neither can be fixed in code:
--
--   1. No consent. The Tally form had no publish-permission checkbox, so she
--      has never agreed to appear on the site.
--   2. No name. The form captured her email only — "Gracelyn Q." was derived
--      from the address, which is not the same as her agreeing to be named.
--
-- Email her, ask if she's happy to be shown as first name + last initial, and
-- while you're there ask her height and the size she ordered. Then:
--
--   update public.reviews
--      set status = 'published', consent = true, verified = true,
--          hold_reason = null
--    where order_number = '1053';
--
-- The rating is a 5, and that is safe ONLY because the old form's four
-- sub-questions (fit, performance, fun, style) were all 5 and she answered
-- "Already have" to would-you-recommend. Do not average sub-scores into a star
-- rating as a habit — see the note at the bottom of src/lib/reviews.ts.
-- ───────────────────────────────────────────────────────────────────────────

insert into public.reviews (
  created_at, product_handle, rating, body, author_name, email, order_number,
  activity, source, consent, verified, status, hold_reason
)
select
  '2026-08-15T22:21:00Z',
  'sierra-shorts',
  5,
  'Material great! I''ve already worn them out for a paddle board day and at the climbing gym. A very versatile pair of shorts! Deeeep pockets too which is so nice ❤️',
  'Gracelyn Q.',
  'gracelynquevedo@gmail.com',
  '1053',
  'gym & climbing',
  'tally',
  false,
  false,
  'pending',
  'No publish consent on file (the Tally form had no consent checkbox) and no display-name field — "Gracelyn Q." was derived from her email. Ask her before publishing.'
where not exists (
  select 1 from public.reviews where order_number = '1053'
);
