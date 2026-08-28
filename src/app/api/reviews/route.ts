import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

/**
 * Review submissions from the form at /review.
 *
 * Everything lands as status = 'pending'. Nothing a stranger types reaches the
 * site until it is published by hand in the Supabase table editor. That is
 * deliberate and it is the entire moderation system: at this volume, a human
 * reading each one is both cheap and better than any filter.
 *
 * ── WHY THE SERVICE ROLE KEY ─────────────────────────────────────────────
 * The anon key is public — it ships in the browser bundle. If the reviews
 * table allowed anonymous inserts, anyone could read that key out of the page
 * source and write straight to the table, skipping the rate limit, the
 * honeypot and every check below. So there is no insert policy, and writes
 * happen here with SUPABASE_SERVICE_ROLE_KEY, which never leaves the server.
 *
 * ── THE RULE THIS ROUTE FOLLOWS ──────────────────────────────────────────
 * Never tell someone their review was received unless it actually was. A
 * customer who took four minutes to write about her shorts and gets a false
 * "thanks!" has been silently thrown away, and she will not write it twice.
 * Same rule as app/api/returns/route.ts, for the same reason.
 */

export const runtime = 'nodejs';

const MAX = { name: 80, body: 2000, title: 90, short: 40, email: 160 };

/** Per IP, per window. Generous — a real person might review two products. */
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;

// Sierra Shorts only. The pant is a preorder that hasn't shipped, so nobody
// could honestly review it yet — and an open endpoint for a product with no
// customers is a spam target with no upside. Add it back when it ships, here
// and in components/ReviewForm.tsx.
const VALID_HANDLES = ['sierra-shorts'];
const VALID_FIT = ['small', 'true', 'large'];

type Body = Record<string, unknown>;

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim().replace(/\s+/g, ' ');
  return s ? s.slice(0, max) : null;
};

/**
 * Rate limit by IP, failing OPEN.
 *
 * If Upstash is unreachable this lets the submission through rather than
 * refusing it. The cost of being wrong in that direction is a spam row I
 * delete; the cost of being wrong in the other direction is losing a real
 * review to an outage that has nothing to do with the customer.
 */
async function overRateLimit(ip: string): Promise<boolean> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  try {
    const redis = new Redis({ url, token });
    const key = `reviews:rl:${ip}`;
    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, RATE_WINDOW_SECONDS);
    return hits > RATE_LIMIT;
  } catch (err) {
    console.warn('[reviews] rate limit unavailable, allowing submission:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Could not read that submission.' }, { status: 400 });
  }

  // ── Honeypot ──
  // A field hidden from people and irresistible to form-filling bots. Answer
  // 200 rather than an error: telling a bot it was detected teaches whoever
  // wrote it to adapt, and nothing is lost by letting it think it succeeded.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  // ── Time trap ──
  // The form stamps when it was rendered. A human does not read the questions,
  // pick a rating and write a paragraph in under three seconds.
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0;
  if (renderedAt && Date.now() - renderedAt < 3000) {
    return NextResponse.json({ ok: true });
  }

  // ── Required fields ──
  const productHandle = str(body.productHandle, 60)?.toLowerCase() ?? null;
  const authorName = str(body.name, MAX.name);
  const reviewBody = str(body.body, MAX.body);
  const rating = Number(body.rating);
  const email = str(body.email, MAX.email)?.toLowerCase() ?? null;
  // Shopify writes order numbers as "#1053"; people type them either way.
  const orderNumber = str(body.orderNumber, MAX.short)?.replace(/^#/, '') ?? null;

  if (!productHandle || !VALID_HANDLES.includes(productHandle)) {
    return NextResponse.json({ error: 'Please choose which product you’re reviewing.' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please pick a rating from 1 to 5.' }, { status: 400 });
  }
  if (!authorName) {
    return NextResponse.json({ error: 'Please add a name we can show.' }, { status: 400 });
  }
  if (!reviewBody || reviewBody.length < 15) {
    return NextResponse.json({ error: 'Please write a little more — even a sentence or two helps.' }, { status: 400 });
  }
  // Proof of purchase. Required, because this is the value that gets searched
  // against Shopify's orders before a review is published — a review from an
  // address that never bought anything doesn't go up. Only shape is validated
  // here; whether it corresponds to a real order is a human check at
  // moderation time (see supabase/moderate.sql).
  //
  // The order number is accepted when offered but not demanded. It makes the
  // lookup instant rather than a search, and that convenience isn't worth
  // another required box on the form.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please add the email you ordered with — it’s never shown on the site.' },
      { status: 400 },
    );
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { error: 'We need your permission before we can show your review on the site.' },
      { status: 400 },
    );
  }

  // ── Rate limit ──
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (await overRateLimit(ip)) {
    return NextResponse.json(
      { error: 'That’s a few reviews in a short time — try again a bit later, or email hello@tualmi.com.' },
      { status: 429 },
    );
  }

  // ── Store ──
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      '[reviews] SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing — ' +
      'the review form cannot store anything. Submission was:',
      { productHandle, rating, authorName },
    );
    return NextResponse.json(
      { error: 'We couldn’t save that just now. Please email hello@tualmi.com — we’d really like to read it.' },
      { status: 500 },
    );
  }

  const fitRaw = str(body.fit, 10)?.toLowerCase();

  const record = {
    product_handle: productHandle,
    rating,
    title:          str(body.title, MAX.title),
    body:           reviewBody,
    author_name:    authorName,
    email,
    order_number:   orderNumber,
    height:         str(body.height, MAX.short),
    usual_size:     str(body.usualSize, MAX.short),
    size_purchased: str(body.sizePurchased, MAX.short),
    fit:            fitRaw && VALID_FIT.includes(fitRaw) ? fitRaw : null,
    colorway:       str(body.colorway, MAX.short),
    activity:       str(body.activity, MAX.short),
    consent:        true,
    source:         'form',
    // Never trusted from the client. Set it by hand when you can see the
    // order behind the review — that badge is a claim about a real purchase.
    verified:       false,
    status:         'pending',
  };

  try {
    const { error } = await createClient(url, key).from('reviews').insert(record);
    if (error) throw new Error(error.message);
  } catch (err) {
    // Log the whole thing. A serverless function has no durable disk, so if
    // this is lost here it is lost everywhere — the log is the only copy.
    console.error('[reviews] insert failed. Submission was:', record, err);
    return NextResponse.json(
      { error: 'We couldn’t save that just now. Please email hello@tualmi.com — we’d really like to read it.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
