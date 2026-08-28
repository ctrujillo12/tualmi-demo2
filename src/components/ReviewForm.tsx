'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * The review form. Posts to /api/reviews, which stores it as pending.
 *
 * ── WHAT IT ASKS FOR, AND WHY ────────────────────────────────────────────
 * Five required things and nothing else: product, rating, name, the review,
 * and permission to publish it. Every extra required field costs completions,
 * and a review with only those five is still worth having.
 *
 * The fit questions — height, usual size, size ordered, how it ran — are the
 * ones that actually sell apparel ("she's my height and ordered her usual
 * size" is what stops someone worrying about a $68 gamble), so they get their
 * own clearly-optional block rather than being buried or made mandatory.
 *
 * ── ON THE ONE OVERALL RATING ────────────────────────────────────────────
 * One question, not four. The old Tally form asked fit / performance / fun /
 * style and never asked for an overall, which left nothing honest to put in a
 * star row — see the note at the bottom of lib/reviews.ts.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';
const ink    = '#3B2F1E';

const PRODUCTS = [
  { handle: 'sierra-shorts', name: 'Sierra Shorts', colorways: ['Jam', 'Picnic', 'Confetti'] },
  { handle: 'juniper-pant',  name: 'Juniper Pant',  colorways: ['Birch', 'Olive'] },
];

const SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'];

const FIT_OPTIONS = [
  { value: 'small', label: 'runs small' },
  { value: 'true',  label: 'true to size' },
  { value: 'large', label: 'runs large' },
];

export default function ReviewForm({ initialProduct }: { initialProduct?: string }) {
  const [productHandle, setProductHandle] = useState(
    initialProduct && PRODUCTS.some((p) => p.handle === initialProduct) ? initialProduct : '',
  );
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fit, setFit] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Stamped once on mount. The API rejects anything submitted within three
  // seconds of the form appearing — a human cannot read, rate and write that
  // fast, and a bot usually does.
  const renderedAt = useRef(Date.now());
  useEffect(() => { renderedAt.current = Date.now(); }, []);

  const product = PRODUCTS.find((p) => p.handle === productHandle);
  const shown = hoverRating || rating;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus('sending');

    const form = new FormData(e.currentTarget);
    const payload = {
      productHandle,
      rating,
      fit,
      renderedAt: renderedAt.current,
      consent,
      name:          form.get('name'),
      email:         form.get('email'),
      orderNumber:   form.get('orderNumber'),
      title:         form.get('title'),
      body:          form.get('body'),
      height:        form.get('height'),
      usualSize:     form.get('usualSize'),
      sizePurchased: form.get('sizePurchased'),
      colorway:      form.get('colorway'),
      activity:      form.get('activity'),
      website:       form.get('website'), // honeypot
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError(
        'We couldn’t reach the server. Please check your connection, or email hello@tualmi.com.',
      );
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rf-root">
        <style>{CSS}</style>
        <div className="rf-done">
          <p className="rf-done-h">thank you — that really helps.</p>
          <p className="rf-done-b">
            We read every one. Yours goes up on the product page once we&apos;ve had a look
            at it, usually within a day or two.
          </p>
          <p className="rf-done-b">
            Got a photo of them out in the wild? Send it to{' '}
            <a href="mailto:hello@tualmi.com?subject=Review%20photo" className="rf-link">
              hello@tualmi.com
            </a>{' '}
            and we&apos;ll add it to your review.
          </p>
          <Link href="/" className="rf-link">back to the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rf-root">
      <style>{CSS}</style>
      <form onSubmit={onSubmit} noValidate>
        {/* Honeypot. Hidden from people, tempting to bots. Not display:none —
            some bots skip those; off-screen with aria-hidden is stronger. */}
        <div className="rf-hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {/* ── Which product ── */}
        <fieldset className="rf-field">
          <legend className="rf-label">which did you buy?</legend>
          <div className="rf-chips">
            {PRODUCTS.map((p) => (
              <button
                key={p.handle}
                type="button"
                className={`rf-chip ${productHandle === p.handle ? 'is-on' : ''}`}
                onClick={() => setProductHandle(p.handle)}
                aria-pressed={productHandle === p.handle}
              >
                {p.name.toLowerCase()}
              </button>
            ))}
          </div>
        </fieldset>

        {/* ── The one rating that matters ── */}
        <fieldset className="rf-field">
          <legend className="rf-label">overall, how would you rate them?</legend>
          <div className="rf-stars" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`rf-star ${shown >= n ? 'is-on' : ''}`}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onFocus={() => setHoverRating(n)}
                onBlur={() => setHoverRating(0)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={rating === n}
              >
                ★
              </button>
            ))}
            {rating > 0 && <span className="rf-star-note">{rating} of 5</span>}
          </div>
        </fieldset>

        {/* ── The review ── */}
        <div className="rf-field">
          <label className="rf-label" htmlFor="title">headline <span className="rf-opt">optional</span></label>
          <input id="title" name="title" type="text" maxLength={90} placeholder="did 14 miles in these" />
        </div>

        <div className="rf-field">
          <label className="rf-label" htmlFor="body">your review</label>
          <textarea
            id="body"
            name="body"
            rows={5}
            maxLength={2000}
            placeholder="What did you wear them for? How did they hold up?"
            required
          />
          <p className="rf-hint">A sentence or two is plenty — what you did in them is the useful part.</p>
        </div>

        {/* ── Fit block. Optional, and the most valuable thing here. ── */}
        <div className="rf-block">
          <p className="rf-block-h">fit <span className="rf-opt">all optional — but this is what helps people most</span></p>

          <div className="rf-row">
            <div className="rf-field">
              <label className="rf-label" htmlFor="height">your height</label>
              <input id="height" name="height" type="text" maxLength={40} placeholder={`5'6"`} />
            </div>
            <div className="rf-field">
              <label className="rf-label" htmlFor="usualSize">size you usually wear</label>
              <select id="usualSize" name="usualSize" defaultValue="">
                <option value="">—</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="rf-field">
              <label className="rf-label" htmlFor="sizePurchased">size you ordered</label>
              <select id="sizePurchased" name="sizePurchased" defaultValue="">
                <option value="">—</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <fieldset className="rf-field">
            <legend className="rf-label">how did they fit?</legend>
            <div className="rf-chips">
              {FIT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`rf-chip ${fit === o.value ? 'is-on' : ''}`}
                  onClick={() => setFit(fit === o.value ? '' : o.value)}
                  aria-pressed={fit === o.value}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rf-row">
            <div className="rf-field">
              <label className="rf-label" htmlFor="colorway">colorway</label>
              <select id="colorway" name="colorway" defaultValue="">
                <option value="">—</option>
                {(product?.colorways ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rf-field">
              <label className="rf-label" htmlFor="activity">where did you wear them?</label>
              <input id="activity" name="activity" type="text" maxLength={40} placeholder="climbing gym" />
            </div>
          </div>
        </div>

        {/* ── Who ── */}
        <div className="rf-row">
          <div className="rf-field">
            <label className="rf-label" htmlFor="name">name to show</label>
            <input id="name" name="name" type="text" maxLength={80} placeholder="Gracelyn Q." required />
            <p className="rf-hint">First name and last initial is perfect.</p>
          </div>
          <div className="rf-field">
            <label className="rf-label" htmlFor="email">email <span className="rf-opt">never shown</span></label>
            <input id="email" name="email" type="email" maxLength={160} placeholder="you@example.com" />
          </div>
          <div className="rf-field">
            <label className="rf-label" htmlFor="orderNumber">order # <span className="rf-opt">optional</span></label>
            <input id="orderNumber" name="orderNumber" type="text" maxLength={40} placeholder="1053" />
            <p className="rf-hint">Lets us mark you a verified buyer.</p>
          </div>
        </div>

        {/* ── Consent. Required, and not pre-ticked. ── */}
        <label className="rf-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            It&apos;s OK to show my review, the name above, my height and any photo I send
            on the Tualmi website.
          </span>
        </label>

        {error && <p className="rf-error" role="alert">{error}</p>}

        <button type="submit" className="rf-submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'sending…' : 'submit review'}
        </button>

        <p className="rf-hint rf-center">
          Reviews are read before they go up. We fix typos, never words.
        </p>
      </form>
    </div>
  );
}

const CSS = `
  .rf-root { max-width: 640px; margin: 0 auto; }
  .rf-hp {
    position: absolute; left: -9999px; width: 1px; height: 1px;
    overflow: hidden;
  }
  .rf-field { margin-bottom: 20px; border: 0; padding: 0; min-width: 0; }
  .rf-label {
    display: block; font-family: ${sans}; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: lowercase; color: ${ink};
    margin-bottom: 7px; padding: 0;
  }
  .rf-opt {
    font-weight: 500; letter-spacing: 0.02em; text-transform: none;
    color: ${soft}; font-size: 11px;
  }
  .rf-hint {
    font-family: ${sans}; font-size: 11.5px; line-height: 1.6;
    color: ${soft}; margin: 6px 0 0;
  }
  .rf-center { text-align: center; margin-top: 14px; }

  .rf-root input[type="text"],
  .rf-root input[type="email"],
  .rf-root select,
  .rf-root textarea {
    width: 100%; box-sizing: border-box;
    font-family: ${sans}; font-size: 15px; color: ${ink};
    background: #fff; border: 1px solid ${rule}; border-radius: 10px;
    padding: 11px 12px; line-height: 1.5;
    -webkit-appearance: none; appearance: none;
  }
  .rf-root select { background-image: none; }
  .rf-root textarea { resize: vertical; min-height: 118px; }
  .rf-root input::placeholder, .rf-root textarea::placeholder { color: #D9C5CD; }
  .rf-root input:focus, .rf-root select:focus, .rf-root textarea:focus {
    outline: 2px solid ${maroon}; outline-offset: 1px; border-color: transparent;
  }

  /* Three across on desktop, stacked on a phone. 15px inputs above are
     deliberate: anything under 16px makes iOS Safari zoom on focus, and a
     form that jumps when you tap it feels broken. */
  .rf-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 620px) { .rf-row { grid-template-columns: 1fr; gap: 0; } }

  .rf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .rf-chip {
    font-family: ${sans}; font-size: 13px; font-weight: 600;
    color: ${maroon}; background: #fff;
    border: 1px solid ${rule}; border-radius: 999px;
    padding: 9px 16px; cursor: pointer; line-height: 1;
    min-height: 40px;
  }
  .rf-chip.is-on { background: ${maroon}; border-color: ${maroon}; color: #fff; }

  .rf-stars { display: flex; align-items: center; gap: 2px; }
  .rf-star {
    background: none; border: 0; cursor: pointer; padding: 2px 3px;
    font-size: 30px; line-height: 1; color: ${rule};
    /* 44px of tappable height on a phone without a 44px-tall glyph. */
    min-height: 44px;
  }
  .rf-star.is-on { color: ${maroon}; }
  .rf-star:focus-visible { outline: 2px solid ${maroon}; outline-offset: 2px; border-radius: 4px; }
  .rf-star-note { font-family: ${sans}; font-size: 12px; color: ${soft}; margin-left: 8px; }

  .rf-block {
    background: #FBF1F5; border-radius: 14px;
    padding: 18px 16px 4px; margin: 0 0 22px;
  }
  .rf-block-h {
    font-family: ${sans}; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: lowercase; color: ${ink};
    margin: 0 0 14px;
  }

  .rf-consent {
    display: flex; gap: 10px; align-items: flex-start;
    font-family: ${sans}; font-size: 12.5px; line-height: 1.65; color: ${ink};
    margin: 4px 0 18px; cursor: pointer;
  }
  .rf-consent input { margin-top: 2px; width: 17px; height: 17px; accent-color: ${maroon}; flex-shrink: 0; }

  .rf-submit {
    width: 100%; min-height: 50px;
    font-family: ${sans}; font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: lowercase;
    color: #fff; background: ${maroon};
    border: 0; border-radius: 999px; cursor: pointer;
  }
  .rf-submit:disabled { opacity: 0.6; cursor: default; }

  .rf-error {
    font-family: ${sans}; font-size: 13px; line-height: 1.6;
    color: #B3261E; background: #FDECEA;
    border-radius: 10px; padding: 11px 13px; margin: 0 0 14px;
  }

  .rf-done { text-align: center; padding: 24px 0 8px; }
  .rf-done-h {
    font-family: ${sans}; font-size: clamp(19px, 3vw, 24px); font-weight: 700;
    color: ${maroon}; margin: 0 0 12px; text-transform: lowercase;
  }
  .rf-done-b {
    font-family: ${sans}; font-size: 14px; line-height: 1.8;
    color: ${ink}; margin: 0 0 12px;
  }
  .rf-link { color: ${maroon}; font-weight: 600; text-underline-offset: 3px; }
`;
