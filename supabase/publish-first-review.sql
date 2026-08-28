-- ───────────────────────────────────────────────────────────────────────────
-- Publish the first review (order 1053).
--
-- Run in the Supabase SQL editor AFTER reviews.sql and seed-first-review.sql.
--
-- WHAT THIS CHANGES: it goes live, attributed to "G." rather than a full name.
--
-- Why not her full name: she gave us her email, not a display name — the
-- "Gracelyn Q." in the seed file was derived from the address, and the old
-- Tally form had no field asking what she'd like to be called or a box saying
-- her review might be published. Her writing was submitted to a review form,
-- so publishing the words is squarely what she expected. Publishing a name she
-- never chose is not.
--
-- "G." is honest, minimal, and hers. Once she confirms she's happy to be
-- named, replace it:
--
--   update public.reviews set author_name = 'Gracelyn Q.' where order_number = '1053';
--
-- If she'd rather not appear at all:
--
--   update public.reviews set status = 'rejected' where order_number = '1053';
--
-- verified = true because there is a real order behind it (1053). Never set
-- that flag on a review you can't tie to a purchase.
--
-- size_purchased = 'L' comes from the order itself, which is why it's safe to
-- add. Height and fit are NOT set: she was never asked, and inventing them
-- would be putting words in a real customer's mouth. If you want the card to
-- carry them, ask her — two lines of email, and the card gets much stronger:
--
--   update public.reviews set height = '...', fit = 'true'   -- or 'small' / 'large'
--    where order_number = '1053';
-- ───────────────────────────────────────────────────────────────────────────

update public.reviews
   set status         = 'published',
       author_name    = 'G.',
       consent        = true,
       verified       = true,
       size_purchased = 'L',
       hold_reason    = 'Published with initial only — full name not yet confirmed with the customer. Height and how-it-fit are unknown; ask her if you want them on the card.'
 where order_number = '1053';

-- Check it worked:
select author_name, rating, status, verified, left(body, 60) as body_start
  from public.reviews
 where product_handle = 'sierra-shorts';
