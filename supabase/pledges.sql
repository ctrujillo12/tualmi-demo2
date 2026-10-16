-- Restock pledges: how many people have committed to buy each sold-out size.
--
-- Pledges come from the product page (Sierra Shorts, sold-out sizes) through
-- app/api/restock-interest/route.ts and land in public.signups with
-- source = 'pledge'. No payment was taken, so expect some drop-off between a
-- pledge and a purchase when you set a restock threshold.
--
-- One person can pledge for several sizes in one go, so each size is counted
-- separately. Duplicate emails for the same color + size are counted once.

select
  attribution -> 'restock' ->> 'color'  as color,
  size.value                            as size,
  count(distinct lower(email))          as pledges
from public.signups,
     jsonb_array_elements_text(attribution -> 'restock' -> 'sizes') as size(value)
where source = 'pledge'
group by 1, 2
order by pledges desc;

-- Who to email when a size comes back (swap in the color and size):
--
-- select distinct lower(email) as email, min(created_at) as pledged_at
-- from public.signups,
--      jsonb_array_elements_text(attribution -> 'restock' -> 'sizes') as size(value)
-- where source = 'pledge'
--   and attribution -> 'restock' ->> 'color' = 'Picnic'
--   and size.value = 'M'
-- group by 1
-- order by pledged_at;
