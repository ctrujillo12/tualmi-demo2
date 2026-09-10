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
 *
 * ── WHY THE FETCH THROWS AND THE CALLER CATCHES ──────────────────────────
 * It used to swallow its own errors and return [] — an outage cost the review
 * section, not the page. That was the bug. unstable_cache cannot tell a
 * legitimately empty result from a swallowed failure, so it cached the []
 * and served it for the rest of the window, to everyone. Worse, the cache
 * serves stale while it revalidates: one timed-out read at 21:50 was still
 * being handed to visitors at 22:06, long after Supabase had recovered, and
 * only the visitor who happened to trigger the background refresh got it back.
 * That is what "the reviews come and go" looks like from the outside.
 *
 * So the fetch throws, which unstable_cache does not store, and readReviews
 * below catches — falling back to the last good read rather than to nothing.
 * A failed read still costs the review section, not the page; it just no
 * longer costs it for everyone else for the next several minutes.
 *
 * Reads use the anon key and are constrained by row-level security to
 * published rows. Writes never happen here; see app/api/reviews/route.ts.
 */

/**
 * Products the review form accepts. Sierra Shorts only for now — the pant is a
 * preorder that hasn't shipped. Keep this in step with VALID_HANDLES in
 * app/api/reviews/route.ts, which is the half that actually enforces it.
 */
export const REVIEWABLE_HANDLES = ['sierra-shorts'];

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
 * One minute — deliberately shorter than the product page's own 5-minute
 * revalidate. Publishing a review in the Supabase table editor can't call
 * revalidateTag, so freshness is time-based, and if this window were the
 * longer of the two the delays would stack: a review could take ten minutes to
 * appear instead of five. Keeping it inside the page's window means the page
 * regeneration always reads something current.
 */
const REVALIDATE_SECONDS = 60;

/**
 * A read that hangs is worse than one that fails: the product page is waiting
 * on it. The error in the logs was `write ETIMEDOUT` — a socket that accepted
 * the connection and then never completed the write — and nothing in the
 * default stack puts a ceiling on how long that takes to give up.
 *
 * ── WHY THIS IS 10s AND NOT 4s ───────────────────────────────────────────
 * It was 4s for two days, on the reasoning that four seconds is "far past a
 * healthy Supabase read". That reasoning was wrong, and production said so:
 * 150 aborted reads across 115 visitors in 40 hours, against roughly 20
 * genuine network failures in the equivalent window before the ceiling
 * existed. A large share of reads from this function legitimately take longer
 * than four seconds — so the ceiling was not catching hangs, it was cutting
 * off reads that were about to succeed.
 *
 * Ten seconds is still a bound, which is the point: it ends the unbounded
 * hang that started all this. It is not a latency target. If reads are
 * routinely taking anywhere near this long, that is the actual problem and
 * this constant is not where it gets fixed.
 */
const READ_TIMEOUT_MS = 10_000;

const timeoutFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(READ_TIMEOUT_MS) });

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
  /**
   * The read failed and this is a fallback, not an answer. Distinguishes
   * "nobody has reviewed this yet" from "we could not find out" — see the
   * empty state in components/ProductReviews.tsx.
   */
  degraded: boolean;
};

const EMPTY: ReviewSummary = {
  reviews: [], count: 0, average: 0, fitTruePct: 0, fitSample: 0,
  showSummary: false, showList: false, degraded: false,
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

/**
 * Uncached fetch. Throws on failure, deliberately — see the note up top.
 * Wrapped below; call getSummary, not this.
 */
async function fetchReviews(productHandle: string): Promise<Review[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Loud, because the silent version of this is indistinguishable from
    // "nobody has written a review yet". .env.local is gitignored, so these
    // have to be set separately in Vercel — and the anon key in particular is
    // easy to miss, since nothing else on the site reads it (the newsletter
    // route uses the service role key instead).
    console.error(
      '[reviews] Missing ' +
      (!url ? 'NEXT_PUBLIC_SUPABASE_URL' : '') +
      (!url && !key ? ' and ' : '') +
      (!key ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : '') +
      ' — the product page will render as if there are no reviews. Set it in ' +
      'Vercel → Settings → Environment Variables and redeploy.',
    );
    return [];
  }

  try {
    const { data, error } = await createClient(url, key, { global: { fetch: timeoutFetch } })
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

    // Thrown, not returned as []: a caching layer that cannot tell the
    // difference will happily serve "no reviews" to everyone for a minute.
    //
    // WHY ALL FOUR FIELDS GET LOGGED. supabase-js does not throw on a network
    // failure — it catches the fetch error and hands it back here as an error
    // whose message is the literal string "TypeError: fetch failed", with no
    // cause and no host. That is indistinguishable, in a log, from Supabase
    // answering and refusing, which is why twenty failures in a day told us
    // nothing about where they happened. details/hint/code are empty on a
    // network failure and populated on a genuine PostgREST rejection, so
    // printing all of them is what separates "never reached Supabase" from
    // "Supabase said no".
    if (error) {
      console.error(
        '[reviews] Supabase read returned an error —',
        'message:', error.message,
        '| details:', error.details || '(none — likely a network failure, not a PostgREST rejection)',
        '| hint:', error.hint || '(none)',
        '| code:', error.code || '(none)',
        '| host:', url,
      );
      throw new Error(`Supabase read failed: ${error.message}`);
    }
    // Through `unknown` on purpose: the client is untyped (no generated
    // database types), so whatever supabase-js infers here is not related to
    // Row by structure and a direct cast is rejected. Row is the contract —
    // if the select list above and Row ever drift, this cast will not catch
    // it, so change them together.
    return (data ?? []).map((r) => toReview(r as unknown as Row));
  } catch (err) {
    // Log the CAUSE, not just the message. Node's fetch reports every network
    // problem as the same useless "TypeError: fetch failed" and hides the
    // actual reason — DNS failure, connection refused, TLS reset, a paused
    // Supabase project — one level down in err.cause. Without this line the
    // log tells you something broke and nothing about what.
    const cause = err instanceof Error ? err.cause : undefined;
    console.error(
      '[reviews] read threw:',
      err instanceof Error ? err.message : err,
      '— cause:',
      cause ?? '(none reported)',
      '— host:',
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(NEXT_PUBLIC_SUPABASE_URL not set)',
    );
    // Rethrown so the failure is never what gets cached. readReviews decides
    // what the page shows instead.
    throw err;
  }
}

const cachedReviews = unstable_cache(fetchReviews, ['product-reviews'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['reviews'],
});

/**
 * How long a fallback may stand in for a real read.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────
 * The fallback originally had no expiry: it lived as long as the warm
 * instance did. That is fine for the failure it was written for (a blip) and
 * badly wrong for a case nobody thought about — unpublishing a review.
 * Setting status away from 'published' has to actually take a review off the
 * site, and a fallback with no clock will happily keep serving the copy it
 * captured before the change, for as long as that instance stays warm. A
 * moderation decision must not be quietly outlived by a cache.
 *
 * Five minutes: long enough to ride out a Supabase blip, short enough that
 * "I took that review down" stays true. Past it, the page shows no reviews
 * rather than reviews that may no longer be publishable.
 */
const FALLBACK_MAX_AGE_MS = 5 * 60_000;

/**
 * The last read that worked, per handle, in module scope.
 *
 * Not a second cache — it is never consulted while the real one is healthy,
 * and holds one small array per product. It exists so that a single failed
 * read degrades to the previous reviews rather than to a page that claims the
 * shorts have never been reviewed. Bounded by FALLBACK_MAX_AGE_MS above, and
 * gone entirely on the next deploy.
 */
const lastGood = new Map<string, { reviews: Review[]; at: number }>();

async function readReviews(
  productHandle: string,
): Promise<{ reviews: Review[]; degraded: boolean }> {
  try {
    const reviews = await cachedReviews(productHandle);
    lastGood.set(productHandle, { reviews, at: Date.now() });
    return { reviews, degraded: false };
  } catch {
    // fetchReviews has already logged what went wrong and why.
    const held = lastGood.get(productHandle);
    const ageMs = held ? Date.now() - held.at : Infinity;
    const usable = held && ageMs < FALLBACK_MAX_AGE_MS ? held.reviews : undefined;

    // Drop a fallback the moment it is too old to stand behind, so a later
    // failure cannot resurrect it.
    if (held && !usable) lastGood.delete(productHandle);

    console.warn(
      `[reviews] serving ${usable ? `the last good read (${usable.length}, ${Math.round(ageMs / 1000)}s old)` : 'nothing'} ` +
      `for ${productHandle}` +
      (held && !usable ? ` — the held copy was ${Math.round(ageMs / 1000)}s old, past the ${FALLBACK_MAX_AGE_MS / 1000}s limit, and has been discarded` : '') +
      `; the failure was not cached, so the next request retries.`,
    );
    return { reviews: usable ?? [], degraded: true };
  }
}

export async function getSummary(productHandle: string): Promise<ReviewSummary> {
  const { reviews, degraded } = await readReviews(productHandle);
  const count = reviews.length;
  if (!count) return { ...EMPTY, degraded };

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
    degraded,
  };
}

export type FitFact = { label: string; value: string };

/**
 * The fit details on a review, as labelled facts rather than one run-on line.
 *
 * This used to render as "5'7" · usually S · wearing S · jam" in small muted
 * type under the review. That reads as a byline — decoration you skim past —
 * when it is actually the most decision-useful thing on the card. A shopper
 * working out whether to size up is scanning for exactly these numbers, and
 * she should be able to find them without reading a sentence.
 *
 * Labelled also means it survives a sparse review. "L" on its own is a
 * mystery; "ordered · L" is a fact, and a card carrying only that still looks
 * deliberate rather than half-filled.
 *
 * Ordered by what someone checks first: their own body, then what that person
 * chose, then whether it worked.
 */
export function fitFacts(review: Review): FitFact[] {
  const facts: FitFact[] = [];
  if (review.height) facts.push({ label: 'height', value: review.height });
  if (review.usualSize) facts.push({ label: 'usually', value: review.usualSize });
  if (review.sizePurchased) facts.push({ label: 'ordered', value: review.sizePurchased });
  if (review.fit) {
    facts.push({
      label: 'fit',
      value: { small: 'runs small', true: 'true to size', large: 'runs large' }[review.fit],
    });
  }
  if (review.colorway) facts.push({ label: 'colour', value: review.colorway.toLowerCase() });
  return facts;
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
