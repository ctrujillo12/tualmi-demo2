/**
 * The current ship-by promise, in one place.
 *
 * ── WHY THIS IS A DATE AND NOT A STRING ──────────────────────────────────
 * It was a string, twice, and both times the date passed and the site went on
 * announcing it: "ships the week of September 21" sat on the shipping page,
 * the returns page, the product metadata and the homepage band long after that
 * week ended. A string has no opinion about what day it is.
 *
 * So the date is a DATE, and the copy is derived from it. Once SHIP_BY passes,
 * shipWindowPassed() goes true and every surface falls back to LAPSED_COPY
 * instead of naming a day that is already history.
 *
 * The lapse copy is now also TRUE rather than merely vague, which it could not
 * be while the stock was in transit: the goods are on hand, so "ships in 1-3
 * business days" is a correct statement on any day after the 24th. That is the
 * ideal shape for this kind of promise -- a specific date while it is useful,
 * an accurate general statement afterwards, and no window where it lies.
 *
 * ── THIS WAS lib/preorder.ts ─────────────────────────────────────────────
 * Renamed 22 Sept 2026 when the Juniper stock landed. Nothing here is about
 * preorders any more; it is about when an order goes out, which is a question
 * every product has whether or not it is a preorder.
 */

/** ISO date orders placed now actually go out by. */
export const SHIP_BY = '2026-09-24';

/** Shown while the date is still ahead of us. */
const SHIP_BY_COPY = 'Ships by Thursday, September 24';

/**
 * How long an order takes to leave us, once. Days for the structured data,
 * copy for humans, derived from the same pair.
 *
 * This existed as four independent literals: the product page said 1-2, the
 * feed said 1-3, and the shipping page and the shorts' own product data said
 * 2-3. Nobody chose those numbers to differ; they were typed at different
 * times. A shopper comparing the product page to the shipping page found two
 * answers, which is the same failure as the preorder date, just quieter.
 *
 * Transit time is separate and lives in the Offer's deliveryTime.transitTime.
 * This is only the part before the carrier has it.
 */
export const HANDLING_DAYS = { min: 1, max: 3 } as const;
export const HANDLING_COPY = `${HANDLING_DAYS.min}–${HANDLING_DAYS.max} business days`;

/**
 * Shown once SHIP_BY has passed. True on its own terms: stock is on hand, so
 * this needs no one to update it to stay accurate.
 */
const LAPSED_COPY = `In stock, ships in ${HANDLING_COPY}`;

/** True once SHIP_BY is in the past, in US Pacific (where we ship from). */
export function shipWindowPassed(now: Date = new Date()): boolean {
  // End of the ship-by day, Pacific, compared as a UTC instant so the answer
  // does not depend on the server's timezone -- Vercel runs UTC, a laptop does
  // not, and "is it still Thursday?" should not have two answers.
  const endOfDayPacific = Date.parse(`${SHIP_BY}T23:59:59-07:00`);
  return now.getTime() > endOfDayPacific;
}

/** The ship-window sentence, or the standing one once the date has gone by. */
export function shipByLabel(now?: Date): string {
  return shipWindowPassed(now) ? LAPSED_COPY : SHIP_BY_COPY;
}

/**
 * Handles the SITE presents as preorder regardless of what Shopify says.
 *
 * EMPTY as of 22 Sept 2026 -- the Juniper stock arrived, so nothing on the
 * site is a preorder. The mechanism stays because it earned its place: it
 * exists so the site can be MORE cautious than Shopify, never less. Shopify
 * had inventory loaded and no `preorder` tag while the boxes were still on a
 * truck, and the product page repeated that as 1-2 day shipping. If that
 * happens again, put the handle here.
 *
 * It lives in this module, not in lib/useShopAccess, because that file carries
 * 'use client': a server component importing a value out of a client module
 * gets a client-reference proxy rather than the array, which threw
 * "includes is not a function" and 500'd the product page. Type-checking
 * passed the whole way. useShopAccess re-exports it for client callers.
 */
export const PREORDER_HANDLES: string[] = [];

/** True when the site should present this handle as a preorder. */
export function isPreorderHandle(handle: string | undefined | null): boolean {
  return !!handle && PREORDER_HANDLES.includes(handle);
}
