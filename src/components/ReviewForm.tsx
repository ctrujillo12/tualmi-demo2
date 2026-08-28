'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * The review form. Posts to /api/reviews, which stores it as pending.
 *
 * Sierra Shorts only — the pant is a preorder that hasn't shipped, so there is
 * nobody who could honestly review it yet. When it ships, add it back here and
 * to VALID_HANDLES in app/api/reviews/route.ts.
 *
 * ── WHAT IT ASKS, AND WHAT IT DELIBERATELY DOESN'T ───────────────────────
 * Three required things: a rating, the review, and a name to show. Plus the
 * consent checkbox, which isn't optional for legal reasons rather than design
 * ones.
 *
 * Everything else was cut. An earlier version also asked for a headline, the
 * size you usually wear, the colourway, where you wore them, and an order
 * number — all defensible on their own, and collectively a wall that makes
 * people close the tab. The three optional fields left (height, size ordered,
 * how it ran) are the ones that answer "will these fit me", which is the
 * objection the whole review section exists to solve.
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

const PRODUCT_HANDLE = 'sierra-shorts';
const PRODUCT_NAME   = 'Sierra Shorts';

const SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'];

const FIT_OPTIONS = [
  { value: 'small', label: 'runs small' },
  { value: 'true',  label: 'true to size' },
  { value: 'large', label: 'runs large' },
];

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fit, setFit] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Stamped on mount. The API rejects anything submitted within three seconds
  // of the form appearing — a person cannot read, rate and write that fast; a
  // bot usually does.
  const renderedAt = useRef(Date.now());
  useEffect(() => { renderedAt.current = Date.now(); }, []);

  const shown = hoverRating || rating;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus('sending');

    const form = new FormData(e.currentTarget);
    const payload = {
      productHandle: PRODUCT_HANDLE,
      rating,
      fit,
      consent,
      renderedAt: renderedAt.current,
      name:          form.get('name'),
      email:         form.get('email'),
      body:          form.get('body'),
      height:        form.get('height'),
      sizePurchased: form.get('sizePurchased'),
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
      setError('We couldn’t reach the server. Please check your connection, or email hello@tualmi.com.');
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
            We read every one. Yours goes up on the product page once we&apos;ve had a look,
            usually within a day or two.
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
        {/* Honeypot. Hidden from people, tempting to bots. Off-screen rather
            than display:none — some bots skip anything set to none. */}
        <div className="rf-hp" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <p className="rf-product">{PRODUCT_NAME}</p>

        {/* ── Rating ── */}
        <fieldset className="rf-field">
          <legend className="rf-label">how would you rate them?</legend>
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
          <label className="rf-label" htmlFor="body">your review</label>
          <textarea
            id="body"
            name="body"
            rows={5}
            maxLength={2000}
            placeholder="What did you wear them for? How did they hold up?"
            required
          />
        </div>

        {/* ── Fit. Optional, and the most useful thing on the page. ── */}
        <div className="rf-block">
          <p className="rf-block-h">
            fit <span className="rf-opt">optional — but this is what helps people most</span>
          </p>

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
              <label className="rf-label" htmlFor="height">your height</label>
              <input id="height" name="height" type="text" maxLength={40} inputMode="text" />
            </div>
            <div className="rf-field">
              <label className="rf-label" htmlFor="sizePurchased">size you ordered</label>
              <select id="sizePurchased" name="sizePurchased" defaultValue="">
                <option value="">—</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Who ── */}
        <div className="rf-row">
          <div className="rf-field">
            <label className="rf-label" htmlFor="name">name to show</label>
            <input id="name" name="name" type="text" maxLength={80} required />
            <p className="rf-hint">First name and last initial is perfect.</p>
          </div>
          <div className="rf-field">
            <label className="rf-label" htmlFor="email">email <span className="rf-opt">never shown</span></label>
            <input id="email" name="email" type="email" maxLength={160} />
            <p className="rf-hint">So we can check it against your order.</p>
          </div>
        </div>

        {/* ── Consent. Required, and never pre-ticked. ── */}
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
  .rf-root { max-width: 560px; margin: 0 auto; }
  .rf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

  .rf-product {
    font-family: ${sans}; font-size: 11px; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase; color: ${soft};
    margin: 0 0 22px; text-align: center;
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
  .rf-hint { font-family: ${sans}; font-size: 11.5px; line-height: 1.6; color: ${soft}; margin: 6px 0 0; }
  .rf-center { text-align: center; margin-top: 14px; }

  .rf-root input[type="text"],
  .rf-root input[type="email"],
  .rf-root select,
  .rf-root textarea {
    width: 100%; box-sizing: border-box;
    font-family: ${sans}; font-size: 16px; color: ${ink};
    background: #fff; border: 1px solid ${rule}; border-radius: 10px;
    padding: 11px 12px; line-height: 1.5;
    -webkit-appearance: none; appearance: none;
  }
  /* 16px is not a style choice: anything smaller makes iOS Safari zoom the
     page on focus, and a form that lurches when you tap it feels broken. */
  .rf-root textarea { resize: vertical; min-height: 118px; }
  .rf-root input::placeholder, .rf-root textarea::placeholder { color: #D9C5CD; }
  .rf-root input:focus, .rf-root select:focus, .rf-root textarea:focus {
    outline: 2px solid ${maroon}; outline-offset: 1px; border-color: transparent;
  }

  .rf-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 560px) { .rf-row { grid-template-columns: 1fr; gap: 0; } }

  .rf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .rf-chip {
    font-family: ${sans}; font-size: 13px; font-weight: 600;
    color: ${maroon}; background: #fff;
    border: 1px solid ${rule}; border-radius: 999px;
    padding: 9px 16px; cursor: pointer; line-height: 1; min-height: 40px;
  }
  .rf-chip.is-on { background: ${maroon}; border-color: ${maroon}; color: #fff; }

  .rf-stars { display: flex; align-items: center; gap: 2px; }
  .rf-star {
    background: none; border: 0; cursor: pointer; padding: 2px 3px;
    font-size: 32px; line-height: 1; color: ${rule}; min-height: 44px;
  }
  .rf-star.is-on { color: ${maroon}; }
  .rf-star:focus-visible { outline: 2px solid ${maroon}; outline-offset: 2px; border-radius: 4px; }
  .rf-star-note { font-family: ${sans}; font-size: 12px; color: ${soft}; margin-left: 8px; }

  .rf-block { background: #FBF1F5; border-radius: 14px; padding: 18px 16px 4px; margin: 0 0 22px; }
  .rf-block-h {
    font-family: ${sans}; font-size: 12px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: lowercase; color: ${ink}; margin: 0 0 14px;
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
    color: #fff; background: ${maroon}; border: 0; border-radius: 999px; cursor: pointer;
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
  .rf-done-b { font-family: ${sans}; font-size: 14px; line-height: 1.8; color: ${ink}; margin: 0 0 12px; }
  .rf-link { color: ${maroon}; font-weight: 600; text-underline-offset: 3px; }
`;
