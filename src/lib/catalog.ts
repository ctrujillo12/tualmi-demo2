/**
 * Which products have a real detail page.
 *
 * ONE list, imported everywhere. This existed as three independent copies —
 * DETAIL_HANDLES in products/[id]/page.tsx, UPSELL_HANDLES in CartUpsell and
 * GATED_HANDLES in useShopAccess — that happened to agree, with nothing
 * enforcing it. The tote is the case that proves why it matters: it is
 * buyable but has no page, and CartItem linked to it anyway, so any cart
 * containing one had two links that dumped the shopper on the homepage.
 */
export const DETAIL_HANDLES = ['sierra-shorts', 'juniper-pant'] as const;

/** True when /products/<handle> renders something rather than redirecting. */
export function hasDetailPage(handle: string | undefined | null): boolean {
  return !!handle && (DETAIL_HANDLES as readonly string[]).includes(handle);
}
