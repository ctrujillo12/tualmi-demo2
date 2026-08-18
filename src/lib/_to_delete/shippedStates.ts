/**
 * States Tualmi has shipped orders to — the pins on the /in-the-wild map.
 *
 * ── KEEPING THIS CURRENT ─────────────────────────────────────────────────
 * Hand-maintained for now. When you ship somewhere new, add its two-letter
 * code to the array below and the pin appears. Order doesn't matter; the map
 * sorts by geography, and the caption counts the array.
 *
 * Seeded from the USPS labels in Shopify as of 16 Aug 2026. Deliberately just
 * a list of states: no counts, no cities, no names. Order volume is not
 * something a young brand benefits from publishing, and a customer's town is
 * their business — a state is anonymous enough to be nobody's.
 *
 * ── MAKING IT SELF-MAINTAINING ───────────────────────────────────────────
 * This is a function rather than a bare array so it can start reading real
 * orders without anything that renders the map having to change.
 *
 * The order webhook (src/app/api/webhooks/shopify/orders/route.ts) already
 * receives every order, shipping address included — it just forwards to GA4
 * and throws the rest away. The upgrade is:
 *
 *   1. add a `shipped_states` table in Supabase (one row per state code,
 *      or a code + first_seen if you want "newest" ordering)
 *   2. in that webhook, upsert order.shipping_address.province_code
 *   3. make this function async and select the distinct codes
 *
 * At that point it maintains itself and this list becomes the fallback for
 * when Supabase is unreachable, which is the right shape for it anyway: a map
 * with no pins is worse than a map with slightly stale ones.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Two-letter USPS codes. See the note above before editing. */
const SHIPPED: string[] = [
  'CA', 'CO', 'IL', 'MD', 'ME', 'MN',
  'NC', 'NM', 'NY', 'OR', 'UT', 'VA', 'WA', 'WY',
];

/**
 * The states to pin. Uppercased and de-duplicated so a stray lowercase entry
 * or an accidental double-add can't produce a missing pin or a doubled count.
 */
export function getShippedStates(): string[] {
  return Array.from(new Set(SHIPPED.map((s) => s.trim().toUpperCase()))).filter(Boolean);
}
