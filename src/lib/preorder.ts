/**
 * The one place the Juniper preorder ship date lives.
 *
 * ── WHY THIS IS NOT JUST A STRING ────────────────────────────────────────
 * It was a string, twice. Both times the date passed and the site went on
 * announcing it: "ships the week of September 21" was still on the shipping
 * page, the returns page, the product metadata and the homepage band months
 * after that week ended. Nothing in the code could tell that the sentence had
 * become false, because a string has no opinion about what day it is.
 *
 * So the date is a DATE here, and the copy is derived from it. Once it passes,
 * shipWindowPassed() goes true and every surface falls back to neutral wording
 * instead of naming a day that is already history. That does not make the
 * promise come true -- somebody still has to update the date -- but it means
 * the failure mode is vague copy rather than a lie.
 *
 * ── THE STATE THIS DESCRIBES ─────────────────────────────────────────────
 * Stock is in transit, expected in hand by Fri 25 Sept 2026. Shopify has
 * inventory loaded and no `preorder` tag, so Shopify BELIEVES the pant is in
 * stock and the product page derived availability from that -- which is why
 * the live site advertised 1-2 day shipping for a product on a truck.
 *
 * PREORDER_HANDLES (below) is the site-side override that wins
 * over Shopify's answer. Shopify should be corrected too; until it is, this is
 * what keeps the page honest.
 */

/** ISO date the order actually goes out by. Merchant Center wants this as availabilityDate. */
export const PREORDER_SHIP_BY = '2026-09-25';

/** Shown while the date is still ahead of us. */
const SHIP_BY_COPY = 'Ships by Friday, September 25';

/**
 * Deliberately undated. Reached only when the ship-by date has passed without
 * anyone updating it, i.e. exactly the situation where naming a day is the
 * worst thing the page can do.
 */
const LAPSED_COPY = 'Ships as soon as stock lands';

/** True once PREORDER_SHIP_BY is in the past, in US Pacific (where we ship from). */
export function shipWindowPassed(now: Date = new Date()): boolean {
  // End of the ship-by day, Pacific. Compared as a UTC instant so the answer
  // doesn't depend on the server's timezone -- Vercel runs UTC, a laptop
  // doesn't, and "is it still Friday?" should not have two answers.
  const endOfDayPacific = Date.parse(`${PREORDER_SHIP_BY}T23:59:59-07:00`);
  return now.getTime() > endOfDayPacific;
}

/** The ship-window sentence, or neutral wording once the date has gone by. */
export function preorderShipLabel(now?: Date): string {
  return shipWindowPassed(now) ? LAPSED_COPY : SHIP_BY_COPY;
}

/**
 * availabilityDate for structured data. Null once the date has passed, because
 * a preorder whose availabilityDate is in the past is a product-feed error,
 * not merely stale copy.
 */
export function preorderAvailabilityDate(now?: Date): string | null {
  return shipWindowPassed(now) ? null : PREORDER_SHIP_BY;
}

/**
 * Handles the SITE treats as preorder, regardless of what Shopify says.
 *
 * ── WHY IT LIVES HERE AND NOT IN useShopAccess ───────────────────────────
 * It used to live in lib/useShopAccess, which carries 'use client'. A server
 * component importing a value out of a client module does not get the value —
 * it gets a client-reference proxy, so `PREORDER_HANDLES.includes(...)` threw
 * "includes is not a function" and the product page 500'd. Type-checking
 * passed the whole way: the types are right, the runtime object is not.
 *
 * This module is plain TypeScript with no directive, so both sides get the
 * real array. useShopAccess re-exports it so existing client imports keep
 * working and there is still only one list.
 */
export const PREORDER_HANDLES = ['juniper-pant'];

/** True when the site should present this handle as a preorder. */
export function isPreorderHandle(handle: string | undefined | null): boolean {
  return !!handle && PREORDER_HANDLES.includes(handle);
}
