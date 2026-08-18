# Inventory & stock

How Shopify inventory reaches the storefront, and what to do in Shopify admin
to make it work.

## The short version

Three layers, in order of how much they actually protect you:

1. **Shopify admin settings** are the only real guarantee against overselling.
2. **The storefront** reads live availability and refuses to add sold-out
   things to the cart. This is UX, not enforcement.
3. **A webhook** flushes the storefront's cache the moment stock moves, so
   layer 2 isn't working from stale numbers.

## 1. Shopify admin — do this first

Per product, per variant, under **Inventory**:

- **Track quantity** — ON. Without this Shopify has no count to enforce and
  `availableForSale` is permanently true, so nothing downstream can help.
- **Continue selling when out of stock** — OFF, unless you're deliberately
  taking backorders on that variant.

With those two set, Shopify re-validates inventory at payment and refuses the
order. That's the guarantee. Everything in this codebase is the experience
wrapped around it.

**What this still can't prevent:** Shopify does not reserve inventory when
someone adds to cart — only briefly during checkout. Two shoppers can always
race for the last unit, and the loser sees an error at payment. That's inherent
to hosted checkout, not something the storefront can fix.

### Storefront token scope

To show real quantities ("only 3 left") rather than a hand-kept list, the
Storefront API token needs the **`unauthenticated_read_product_inventory`**
scope.

Shopify admin → **Settings → Apps and sales channels → Develop apps** → the app
that owns your Storefront token → **Configuration → Storefront API
integration** → check the inventory scope → **Save**. If the storefront is
wired through the Headless channel instead, the equivalent lives in that
channel's Storefront API permissions.

You may need to regenerate the token afterwards; if you do, update
`NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`.

**This is safe to get wrong.** `lib/shopify.ts` asks for the inventory fields
optimistically and, if the token can't read them, silently retries the same
query without them. Missing scope means you fall back to `availableForSale`
plus the manual overrides in `lib/lowStock.ts` — it does not take the store
down. (It used to: requesting `quantityAvailable` without the scope made
Shopify reject the whole request, dropping every product to local data with no
variants. That's what the old warning comments in the codebase were about.)

Check the server logs for `[shopify] Inventory quantities readable` to confirm
the scope is live.

## 2. Webhooks

Shopify admin → **Settings → Notifications → Webhooks**. Create these, both
pointing at the same URL:

| Event | Format | URL |
| --- | --- | --- |
| `inventory_levels/update` | JSON | `https://tualmi.com/api/webhooks/shopify/inventory` |
| `products/update` | JSON | `https://tualmi.com/api/webhooks/shopify/inventory` |

Shopify shows a signing secret when you create the first one. It goes in
`SHOPIFY_WEBHOOK_SECRET` — the same variable the orders webhook already uses.
Requests without a valid HMAC are rejected with a 401.

The route calls `revalidateTag('shopify-products')`, which invalidates every
tagged Shopify read. Without it, a sell-out could sit on the storefront for up
to 60 seconds — a long time mid-drop.

## 3. Environment variables

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_LOW_STOCK_THRESHOLD` | `6` | At or below this many units, a size reads "only a few left" |
| `NEXT_PUBLIC_SHOPIFY_API_VERSION` | `2024-01` | Storefront API version. Bump after smoke-testing a product page and a checkout |
| `SHOPIFY_WEBHOOK_SECRET` | — | Shared by both Shopify webhook routes |

## How the code decides

Everything routes through `src/lib/inventory.ts`. The rule that matters:

**There are three answers, not two — available, sold out, and unknown. Unknown
always behaves like available.**

Unknown covers Shopify being unreachable (the product falls back to local data
with no variants), the token not being allowed to read quantities, and
size/colour combinations that aren't real variants. If any of those were
treated as sold out, one Shopify hiccup would make the whole store unbuyable.
Letting a rare oversell through to a checkout that re-validates stock anyway is
the better failure.

| Signal | Used for | Notes |
| --- | --- | --- |
| `availableForSale` | Can this be bought at all | Authoritative. Stays true for variants set to continue selling when out of stock |
| `quantityAvailable` | "only N left", quantity caps | `undefined` when the scope is missing — means unknown, never zero |
| `currentlyNotInStock` | Detecting backorders | Sellable but not in stock; deliberately not flagged as low stock |

## What happens where

- **Product page** — sold-out sizes render struck through and unclickable; a
  fully sold-out colourway gets a slash through its swatch; the quantity
  stepper caps at real stock; switching colourway clears a size that's gone in
  the new one.
- **Quick add** (landing page, cart upsell) — same size gating; a sold-out
  colourway's tile becomes a "sold out" link instead of "+ add".
- **Cart** — every line re-checks availability on load (`refreshFromShopify`
  pulls live variants), sold-out lines are flagged on the line itself, and
  checkout is blocked until they're removed.
- **Checkout** — `resolveVariant` in `store/cartStore.ts` matches size + colour
  **exactly**, or fails. It used to fall back to any variant in the same size
  regardless of colour, and then to the first available variant, which meant a
  shopper could be charged for and shipped a different colourway than the one
  they picked, with no error raised anywhere.
- **SEO** — the product page's JSON-LD `availability` reflects real stock
  instead of being hardcoded to `PreOrder`.

## Editing low-stock by hand

`src/lib/lowStock.ts` is now an override list, consulted only when quantities
aren't readable. When they are, real numbers win and the file is ignored. Clear
entries when you restock — "only a few left" on a well-stocked size is the kind
of small lie shoppers notice, and the FTC treats manufactured urgency as a
deceptive practice.

## Checking the rules still hold

```
npx tsx scripts/inventory.test.ts
```

24 assertions covering the sold-out, low-stock, backorder, offline-fallback and
variant-matching cases. Worth running after touching `lib/inventory.ts`.
