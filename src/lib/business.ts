/**
 * Who Tualmi is, as a business, in one place.
 *
 * ── WHY THIS FILE EXISTS ─────────────────────────────────────────────────
 * Merchant Center suspended the account for Misrepresentation, which for a
 * new store almost always means "we cannot confirm a real business is behind
 * this site". The site had the policy pages (returns, shipping, privacy,
 * terms) but no verifiable identity: "contact us" in the footer was a mailto:
 * link rather than a page, and there was no postal address or phone anywhere
 * a crawler could find.
 *
 * Google's automated check reads PAGES. So the address and phone now live
 * here, and three things read from them: the contact page, the footer, and
 * the Organization structured data in the root layout. One edit moves all
 * three, and none of them can disagree with the others -- which matters,
 * because "information that does not match across your site" is itself a
 * thing the policy names.
 */

export const BUSINESS = {
  legalName: 'Tualmi',
  email: 'hello@tualmi.com',

  /** E.164 for machines. */
  phone: '+14152980371',
  /** Human formatting, for anything a person reads. */
  phoneDisplay: '(415) 298-0371',

  address: {
    street: '145 N Rossmore Ave',
    city: 'Los Angeles',
    region: 'CA',
    // 90004 was looked up from the street address, not supplied -- worth one
    // glance before this is used to answer a suspension appeal.
    postalCode: '90004',
    country: 'US',
  },

  /** What we actually promise, so the contact page is not writing a cheque. */
  responseTime: '1–2 business days',
} as const;

/** True once the address is complete enough to publish. */
export const ADDRESS_READY =
  BUSINESS.address.street.trim().length > 0 &&
  /\d/.test(BUSINESS.address.street) &&
  BUSINESS.address.postalCode.trim().length > 0;

/** "123 N Rossmore Ave, Los Angeles, CA 90004" */
export function formatAddress(): string {
  const a = BUSINESS.address;
  return `${a.street}, ${a.city}, ${a.region}${a.postalCode ? ` ${a.postalCode}` : ''}`;
}
