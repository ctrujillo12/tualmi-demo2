import type { Metadata } from 'next';

/**
 * The site-wide link preview: what tualmi.com, and any page without its own
 * preview, shows when shared (iMessage, Instagram DMs, Linktree, WhatsApp...).
 *
 * In one place because Next.js REPLACES a parent's `openGraph` rather than
 * merging into it. The homepage set `openGraph: { url: '/' }` to fix its URL,
 * and that silently dropped the image, title and description the root layout
 * set, so a bare tualmi.com link previewed with no photo at all. Any page that
 * sets `openGraph` should spread DEFAULT_OG into it.
 *
 * The image is the homepage hero photo, rendered from
 * scripts/og-templates/home.html (see the README there).
 */
const TITLE = 'Tualmi | Gear for a new kind of outdoorsy';
const DESCRIPTION =
  'Flattering hiking pants and shorts designed for women, in prints you’ll actually want to wear. Designed in LA, shipped worldwide.';
const IMAGE = '/og/home-og.jpg';

export const DEFAULT_OG: NonNullable<Metadata['openGraph']> = {
  siteName: 'Tualmi',
  type: 'website',
  title: TITLE,
  description: DESCRIPTION,
  images: [{ url: IMAGE, width: 1200, height: 630, alt: 'Two women laughing and running down a mountain road in Tualmi Juniper Pants' }],
};

export const DEFAULT_TWITTER: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  title: TITLE,
  description: DESCRIPTION,
  images: [IMAGE],
};
