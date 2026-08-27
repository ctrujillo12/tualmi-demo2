import { createClient } from '@supabase/supabase-js';

/**
 * Product reviews, read from Supabase.
 *
 * ── WHY THE ANON KEY ─────────────────────────────────────────────────────
 * Reads go through the public anon key, not the service role key. Published
 * reviews are public information — they're rendered to everyone — and the RLS
 * policy in supabase/reviews.sql already refuses to return anything that isn't
 * published. Using the service role key here would bypass that policy and make
 * the database's own guarantee meaningless, so a query bug could leak an
 * unmoderated review. Let the database enforce it.
 */

/** Below this many reviews for a product, the section doesn't render at all. */
export const MIN_REVIEWS_TO_SHOW = 3;

export type Review = {
  id: string;
  createdAt: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  color: string | null;
  height: string | null;
  usualSize: string | null;
  sizePurchased: string | null;
  source: 'tally' | 'manual' | 'gifted' | 'email';
  verified: boolean;
};

export type ReviewSummary = {
  reviews: Review[];
  count: number;
  /** Mean rating to one decimal, or null when there aren't enough to show. */
  average: number | null;
  /** Whether the product page should render the section at all. */
  show: boolean;
};

const EMPTY: ReviewSummary = { reviews: [], count: 0, average: null, show: false };

type Row = {
  id: string;
  created_at: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  color: string | null;
  height: string | null;
  usual_size: string | null;
  size_purchased: string | null;
  source: Review['source'];
  verified: boolean;
};

function toReview(r: Row): Review {
  return {
    id: r.id,
    createdAt: r.created_at,
    rating: r.rating,
    title: r.title,
    body: r.body,
    authorName: r.author_name,
    color: r.color,
    height: r.height,
    usualSize: r.usual_size,
    sizePurchased: r.size_purchased,
    source: r.source,
    verified: r.verified,
  };
}

/**
 * Published reviews for one product, newest first.
 *
 * Never throws. A review section is decoration on a page whose job is to sell a
 * product — if Supabase is down or misconfigured, the page should render
 * without it rather than fail. Same principle as the Shopify fallback in
 * lib/products.ts: degrade, don't disappear.
 */
export async function getReviews(productHandle: string): Promise<ReviewSummary> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return EMPTY;

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, created_at, rating, title, body, author_name, color, height, usual_size, size_purchased, source, verified',
      )
      // Belt and braces. The RLS policy already restricts this to published
      // rows; saying it here too means the intent is readable at the call site
      // and a policy edit can't silently widen what the storefront shows.
      .eq('status', 'published')
      .eq('product_handle', productHandle)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[reviews] Supabase read failed, rendering without reviews:', error.message);
      return EMPTY;
    }

    return summarize((data ?? []) as Row[]);
  } catch (err) {
    console.warn('[reviews] Supabase read threw, rendering without reviews:', err);
    return EMPTY;
  }
}

function summarize(rows: Row[]): ReviewSummary {
  const reviews = rows.map(toReview);
  const count = reviews.length;

  /**
   * A product page showing "1 review" reads worse than one showing none — a
   * lone review looks like nobody has bought this, which is the opposite of
   * what a review section is for. Below the threshold, render nothing and let
   * the page stand on its own.
   */
  if (count < MIN_REVIEWS_TO_SHOW) return { reviews, count, average: null, show: false };

  const mean = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  return { reviews, count, average: Math.round(mean * 10) / 10, show: true };
}

/**
 * The fit line: "5'6\" · usually M · bought M".
 *
 * Returns null when the review carries none of it, so the caller can skip the
 * element rather than render an empty one. Reviews collected before the fit
 * questions existed simply don't have it.
 */
export function fitLine(review: Review): string | null {
  const parts = [
    review.height,
    review.usualSize ? `usually ${review.usualSize}` : null,
    review.sizePurchased ? `bought ${review.sizePurchased}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}
