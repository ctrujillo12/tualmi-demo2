# GA4 setup — what's done and what's left

The code side is finished and deploys with your next push. The rest is
settings in GA4 and Shopify that can't be done from the codebase.

---

## Already done in code

| Event | Fires when | Where |
|---|---|---|
| `page_view` | every page | `app/layout.tsx` (gtag) |
| `view_item` | product page opens | `ProductDetailClient.tsx` |
| `add_to_cart` | add to cart pressed | `ProductDetailClient.tsx` |
| `begin_checkout` | checkout pressed, before redirect | `store/cartStore.ts` |

Also in code:

- **Cross-domain linker** — `layout.tsx` lists `tualmi.com`, `www.tualmi.com`,
  and `tualmi.myshopify.com`. This is only half the job; see Step 1 below.
- **Creator codes as a campaign** — `/discount/CAMI10` links carry no `utm_*`
  params, so GA4 would file them as "direct". `DiscountRedirect.tsx` sets
  campaign source = the code, medium = `affiliate`.
- **Every analytics call is a no-op if gtag is blocked**, so an ad blocker can
  never break a purchase.

`purchase` is **not** in that list, and can't be — see Step 2.

---

## Step 1. Tell GA4 about both domains

Without this, a shopper who reaches checkout is counted as a second user, and
the sale gets attributed to a "referral" from your own site.

1. analytics.google.com → **Admin** (bottom left)
2. **Data streams** → click your web stream
3. **Configure tag settings** → **Configure your domains**
4. Add both:
   - `tualmi.com`
   - `tualmi.myshopify.com`
5. Save

---

## Step 2. Get purchases into GA4 (server-side — the reliable way)

Checkout is on Shopify's domain, and Shop Pay adds a further hop through
`shop.app`, so browser-based tracking loses the thread and purchases land as
"direct". Instead of relying on that, we replay the purchase server-side.

**How it works:** at checkout the cart is stamped with the GA4 `client_id` and
`session_id` (hidden attributes, prefixed `_`) plus the original `Referred by` /
`Channel` / `Campaign`. Shopify carries them onto the order. A webhook reads
them back and POSTs a `purchase` to GA4's Measurement Protocol with the same
ids, so the revenue attaches to the session that earned it.

### 2a. Create a Measurement Protocol secret

1. GA4 → **Admin** → **Data streams** → your web stream
2. Scroll to **Measurement Protocol API secrets** → **Create**
3. Nickname it `shopify-webhook`, copy the secret value

### 2b. Add environment variables in Vercel

Settings → Environment Variables → Add New (all environments):

| Name | Value |
|---|---|
| `GA4_API_SECRET` | the secret from 2a |
| `SHOPIFY_WEBHOOK_SECRET` | from 2c below |
| `GA4_DEBUG` | `1` while testing, then delete it |

### 2c. Create the Shopify webhook

1. Shopify admin → **Settings** → **Notifications** → scroll to **Webhooks**
2. **Create webhook**
   - Event: **Order payment** (`orders/paid`)
   - Format: **JSON**
   - URL: `https://tualmi.com/api/webhooks/shopify/orders`
3. Save. Shopify shows a **signing secret** — that's `SHOPIFY_WEBHOOK_SECRET`
4. Put it in Vercel and **redeploy**

### 2d. Optional: Shopify's own GA4 integration

Shopify's built-in GA4 integration also sends purchases, but it can't attach
them to the original session across the Shop Pay hop. If you enable it *as well
as* the webhook you'll double-count revenue.

**Pick one.** The webhook (2a–2c) is the accurate one. Only use Shopify's
integration instead if you'd rather not run a webhook at all.

Once live you'll see the full funnel: session → view_item → add_to_cart →
begin_checkout → purchase, with purchase credited to the real source.

### 2e. Verify in DebugView

1. Set `GA4_DEBUG=1` in Vercel, redeploy
2. Place a test order (100%-off code + free-shipping discount = $0)
3. GA4 → **Admin** → **DebugView**, look for the `purchase` event
4. Check Vercel logs for `[ga-webhook] purchase sent — order #1042 | source cami10`
5. Confirm the event shows the campaign source, **not** "direct"
6. Delete `GA4_DEBUG` and redeploy — debug events don't appear in reports

---

## Step 3. Verify (do this, don't assume)

1. GA4 → **Reports** → **Realtime**
2. Open tualmi.com in another tab and walk through: homepage → product → add to
   cart → checkout
3. In Realtime's event list you should see `page_view`, `view_item`,
   `add_to_cart`, `begin_checkout` appear within ~30 seconds

If events don't show, the usual causes are an ad blocker in your own browser
(test in a clean profile) or the tag not deployed yet.

---

## The three reports to actually use

Ignore the rest of GA4 for now.

- **Realtime** — confirm tracking works after any change
- **Acquisition → Traffic acquisition** — sessions and conversions by
  source/medium. This is where creator performance shows up.
- **Monetization → Ecommerce purchases** — revenue, once Step 2 is done

---

## What GA4 still can't tell you

**Story mentions with no link.** Nothing fixes this at the analytics layer.
Your creator codes are the workaround — a sale with `CAMI10` is attributable
whether or not anyone clicked anything.

**Revenue by creator, reliably.** Cross-domain tracking is fragile: ad blockers,
Safari's ITP, and consent tools all break it. Don't build payouts on GA4.

The dependable source is the **Shopify order itself** — every order carries
`Referred by`, `Channel`, and `Campaign` under Additional details, stamped by
`lib/attribution.ts` at checkout. That's server-side data Shopify recorded, not
a browser event that may or may not have fired.

So: **GA4 for traffic and behaviour, Shopify orders for money.**

---

## Requirements to give creators going forward

- A **UTM-tagged link** or their `/discount/CODE` link in bio — never a bare
  tualmi.com
- Their **unique code** mentioned out loud in stories, so unlinked mentions
  still convert traceably
- Story links where the platform allows them
