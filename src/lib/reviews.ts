import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

/**
 * Product reviews.
 *
 * ── WHY THIS IS A DATABASE AGAIN ─────────────────────────────────────────
 * This was briefly a static JSON file, which is the right shape when only you
 * add reviews: no network on the product page, nothing to fail. It stopped
 * being the right shape the moment customers needed to submit their own — a
 * file in the repo cannot take a write from a stranger's browser.
 *
 * The objection to a database here was never the database. It was adding an
 * uncached network call to the one page whose Shopify calls were already
 * timing out. So the read is cached: unstable_cache holds the result for
 * REVALIDATE_SECONDS across every visitor, which means a product page does at
 * most one review query per five minutes per region rather than one per view.
 * And it still never throws — an outage costs the review section, not the
 * page.
 *
 * Reads use the anon key and are constrained by row-level security to
 * published rows. Writes never happen here; see app/api/reviews/route.ts.
 */

export type Fit = 'small' | 'true' | 'large';

export type Review = {
  id: string;
  /** ISO date. Sort key, and datePublished in the structured data. */
  date: string;
  rating: number;
  name: string;
  body: string;
  title?: string;
  height?: string;
  usualSize?: string;
  sizePurchased?: string;
  fit?: Fit;
  colorway?: string;
  activity?: string;
  photo?: string;
  verified: boolean;
};

/**
 * Stars, the count and the JSON-LD aggregate stay hidden below this many
 * published reviews.
 *
 * "★★★★★ (2)" is worse than showing nothing: a shopper reads two reviews as
 * unproven rather than as praise, and Google treats an aggregateRating built
 * from a couple of reviews as a manual-action risk. Individual reviews still
 * render below this line — a quote is evidence on its own, an average of two
 * is not.
 */
export const MIN_FOR_SUMMARY = 5;

/** Same reasoning: a percentage of three people is not a finding. */
export const MIN_FIT_SAMPLE = 5;

/**
 * How long a product page may serve reviews it already has.
 *
 * Five minutes. Publishing a review in the Supabase table editor can't call
 * revalidateTag, so freshness here is time-based — and reviews are not
 * time-critical. If you publish one and want it immediately, redeploy.
 */
const REVALIDATE_SECONDS = 300;

export type ReviewSummary = {
  reviews: Review[];
  count: number;
  average: number;
  fitTruePct: number;
  fitSample: number;
  /** Render the star row, the count and the JSON-LD aggregate. */
  showSummary: boolean;
  /** Render the review section at all. */
  showList: boolean;
};

const EMPTY: ReviewSummary = {
  reviews: [], count: 0, average: 0, fitTruePct: 0, fitSample: 0,
  showSummary: false, showList: false,
};

type Row = {
  id: string;
  created_at: string;
  rating: number;
  title: string | null;
  body: string;
  author_name: string;
  height: string | null;
  usual_size: string | null;
  size_purchased: string | null;
  fit: Fit | null;
  colorway: string | null;
  activity: string | null;
  photo_url: string | null;
  verified: boolean;
};

function toReview(r: Row): Review {
  return {
    id: r.id,
    date: r.created_at.slice(0, 10),
    rating: r.rating,
    name: r.author_name,
    body: r.body,
    title: r.title ?? undefined,
    height: r.height ?? undefined,
    usualSize: r.usual_size ?? undefined,
    sizePurchased: r.size_purchased ?? undefined,
    fit: r.fit ?? undefined,
    colorway: r.colorway ?? undefined,
    activity: r.activity ?? undefined,
    photo: r.photo_url ?? undefined,
    verified: r.verified,
  };
}

/** Uncached fetch. Wrapped below — call getSummary, not this. */
async function fetchReviews(productHandle: string): Promise<Review[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const { data, error } = await createClient(url, key)
      .from('reviews')
      // One string literal, deliberately. supabase-js parses this at the TYPE
      // level with template-literal types to work out the row shape, which
      // only works on a literal — building it by concatenating lines widens it
      // to `string`, the parse fails, and the result degrades to
      // GenericStringError. That is a compile error at the .map() below, and
      // it is why this is one long line instead of three readable ones.
      .select(
        'id, created_at, rating, title, body, author_name, height, usual_size, size_purchased, fit, colorway, activity, photo_url, verified',
      )
      // The RLS policy already restricts this to published rows. Saying it
      // here too keeps the intent readable at the call site and means a policy
      // edit can't silently widen what the storefront shows.
      .eq('status', 'published')
      .eq('product_handle', productHandle)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('[reviews] read failed, rendering without reviews:', error.message);
      return [];
    }
    // Through `unknown` on purpose: the client is untyped (no generated
    // database types), so whatever supabase-js infers here is not related to
    // Row by structure and a direct cast is rejected. Row is the contract —
    // if the select list above and Row ever drift, this cast will not catch
    // it, so change them together.
    return (data ?? []).map((r) => toReview(r as unknown as Row));
  } catch (err) {
    console.warn('[reviews] read threw, rendering without reviews:', err);
    return [];
  }
}

const cachedReviews = unstable_cache(fetchReviews, ['product-reviews'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['reviews'],
});

export async function getSummary(productHandle: string): Promise<ReviewSummary> {
  const reviews = await cachedReviews(productHandle);
  const count = reviews.length;
  if (!count) return EMPTY;

  const average = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;
  const withFit = reviews.filter((r) => r.fit);
  const fitTruePct = withFit.length
    ? Math.round((withFit.filter((r) => r.fit === 'true').length / withFit.length) * 100)
    : 0;

  return {
    reviews,
    count,
    average,
    fitTruePct,
    fitSample: withFit.length,
    showSummary: count >= MIN_FOR_SUMMARY,
    showList: true,
  };
}

/** "5'7" · usually S · wearing S · jam" — whichever parts exist, else null. */
export function fitLine(review: Review): string | null {
  const parts = [
    review.height,
    review.usualSize ? `usually ${review.usualSize}` : null,
    review.sizePurchased ? `wearing ${review.sizePurchased}` : null,
    review.colorway ? review.colorway.toLowerCase() : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * NOTE ON MEASURING RATINGS, since the Tally form got this wrong.
 *
 * The form asked four separate 1-5 questions (fit, performance, fun, style)
 * and never asked for an overall rating, so there was no honest source for the
 * single number a star row shows.
 *
 * Do not average sub-scores. A shopper reading "3.8 stars" believes a customer
 * chose 3.8; nobody did. Someone who rates fit 5 and fun 2 has not said the
 * shorts are a 3.5 — she has said one specific thing disappointed her.
 *
 * The form at /review asks the question directly instead: one required
 * "overall, how would you rate them?". Sub-questions are good product research
 * and belong in a survey, not in the star rating.
 */
