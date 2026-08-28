-- ───────────────────────────────────────────────────────────────────────────
-- Moderation queue.
--
-- Paste into the Supabase SQL editor whenever you want to clear the queue.
-- Faster than scrolling the table editor: it shows only what's waiting, and
-- only the columns you need to make the call.
-- ───────────────────────────────────────────────────────────────────────────

-- 1. WHAT'S WAITING
-- For each row: search the email in Shopify (Orders -> filter by customer
-- email). If there's a paid order for Sierra Shorts, it's real. If there is
-- no order at all, reject it.
--
-- order_number is usually blank — the form no longer asks for it, since the
-- email answers the same question. When it IS filled in (older submissions,
-- or someone being helpful) it makes the lookup instant.
select
  created_at::date  as submitted,
  order_number,
  email,
  author_name       as shows_as,
  rating,
  size_purchased    as ordered,
  fit,
  height,
  body
from public.reviews
where status = 'pending'
order by created_at desc;


-- 2. PUBLISH ONE  (paste the id from above)
-- verified = true only when you have actually seen the order. That badge is a
-- claim about a real purchase, and it is the one thing on the card a shopper
-- has no way to check for herself.
--
-- update public.reviews
--    set status = 'published', verified = true
--  where id = 'paste-the-id-here';


-- 3. REJECT ONE
-- Rejected rather than deleted, so a resubmission of the same thing is
-- recognisable and you have a record of what you turned down and why.
--
-- update public.reviews
--    set status = 'rejected', hold_reason = 'no matching order'
--  where id = 'paste-the-id-here';


-- 4. WHAT'S LIVE RIGHT NOW
-- The count here is what drives the star row: under 5 published, the product
-- page shows the review cards but no average, no count, and no Google star
-- markup. See MIN_FOR_SUMMARY in src/lib/reviews.ts.
select
  product_handle,
  count(*)                       as published,
  round(avg(rating), 1)          as average,
  count(*) filter (where fit is not null) as answered_fit
from public.reviews
where status = 'published'
group by product_handle;
