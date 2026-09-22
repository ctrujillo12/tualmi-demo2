/**
 * How long an order takes to leave us, and the copy that says so.
 *
 * ── THERE IS NO DATE HERE ANY MORE ───────────────────────────────────────
 * There was, three times over: "the week of September 21", then "by Friday
 * the 25th", then "by Saturday the 26th", then "by Thursday the 24th". Every
 * one of them was correct when written and wrong shortly after, and the first
 * of them sat on four pages for two months announcing a week that had already
 * passed. The last version expired itself automatically, which was better,
 * but it still meant the pant and the shorts said different things for no
 * reason a shopper could infer.
 *
 * So: no date. Both products make the same standing promise, it is true every
 * day, and nothing has to be edited when a week goes by. If a genuine preorder
 * ever comes back, the ship window belongs on that product in Shopify's
 * custom.shipping_window metafield -- next to the stock it describes -- not in
 * a constant here that outlives the situation that produced it.
 *
 * Transit time is separate and lives in the Offer's deliveryTime.transitTime.
 * This is only the part before the carrier has it.
 */
export const HANDLING_DAYS = { min: 1, max: 3 } as const;
export const HANDLING_COPY = `${HANDLING_DAYS.min}–${HANDLING_DAYS.max} business days`;

/**
 * TWO SHAPES, ONE FACT.
 *
 * shipPhrase() is the verb clause alone -- "ships in 1-3 business days" --
 * for a sentence that has already said the item is in stock.
 *
 * shipLabel() is the standalone version with the stock state on the front,
 * which is what a product page or a cart line needs.
 *
 * They exist as a pair because the single-string version produced "The Juniper
 * Pant is in stock. In stock, ships in 1-3 business days" on the shipping page
 * and "in stock · in stock, ships..." on the homepage band.
 */
export function shipPhrase(): string {
  return `ships in ${HANDLING_COPY}`;
}

export function shipLabel(): string {
  return `In stock, ${shipPhrase()}`;
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
