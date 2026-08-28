import Image from 'next/image';
import Link from 'next/link';
import { fitFacts, MIN_FIT_SAMPLE, REVIEWABLE_HANDLES, type Review, type ReviewSummary } from '@/lib/reviews';

/**
 * The review section on a product page, plus the star row that links to it.
 *
 * A server component with no state and no fetch — the data is a static import,
 * so this prerenders into the HTML. No spinner, no layout shift.
 *
 * Two exports:
 *   <ReviewStars>   the summary row, used up beside the price
 *   <ProductReviews> the list, further down the page
 *
 * Both go quiet on their own when there's nothing to show, so callers can
 * render them unconditionally.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';
const ink    = '#3B2F1E';

/**
 * Stars drawn as one clipped overlay rather than five glyphs, so 4.8 renders
 * as four and four-fifths rather than being rounded to a number nobody gave.
 * The label carries the meaning; a screen reader spelling out five separate
 * star characters is noise.
 */
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      role="img"
      aria-label={`${value} out of 5 stars`}
      style={{ position: 'relative', display: 'inline-block', lineHeight: 1, fontSize: `${size}px`, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
    >
      <span aria-hidden style={{ color: rule }}>★★★★★</span>
      <span
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: `${pct}%`, overflow: 'hidden', whiteSpace: 'nowrap', color: maroon }}
      >
        ★★★★★
      </span>
    </span>
  );
}

/**
 * The summary row, directly under the price.
 *
 * The highest-leverage element of the whole feature: everyone who lands on the
 * page sees it, whereas only people who scroll reach the reviews themselves. A
 * stranger deciding whether $68 of unfamiliar shorts is a risk sees a number
 * instead of nothing.
 *
 * Renders nothing below MIN_FOR_SUMMARY — see lib/reviews.ts.
 */
export function ReviewStars({ summary }: { summary: ReviewSummary }) {
  if (!summary.showSummary) return null;

  return (
    <a
      href="#reviews"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        margin: '0 0 18px', textDecoration: 'none',
        fontFamily: sans, fontSize: '13px', color: ink,
      }}
    >
      <Stars value={summary.average} />
      <strong style={{ fontWeight: 700 }}>{summary.average.toFixed(1)}</strong>
      <span style={{ color: soft, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
        {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
      </span>
    </a>
  );
}

/**
 * One sentence for the "fit & sizing" block: the brand's "true to size" claim
 * restated as a customer count, right where the objection lives.
 */
export function FitConsensus({ summary }: { summary: ReviewSummary }) {
  if (summary.fitSample < MIN_FIT_SAMPLE) return null;
  return (
    <p style={{ fontFamily: sans, fontSize: '13px', lineHeight: 1.7, color: maroon, margin: '12px 0 0', fontWeight: 600 }}>
      {summary.fitTruePct}% of {summary.fitSample} buyers say they run true to size.
    </p>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const facts = fitFacts(review);

  return (
    <article className="rv-card">
      <div className="rv-head">
        <Stars value={review.rating} size={13} />
        {review.title && <h3 className="rv-title">{review.title}</h3>}
      </div>

      {review.photo && (
        <div className="rv-photo">
          <Image
            src={review.photo}
            alt=""
            width={320}
            height={400}
            sizes="(max-width: 640px) 45vw, 260px"
            style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
          />
        </div>
      )}

      <p className="rv-body">{review.body}</p>

      {/* Above the byline on purpose: this is the part that helps someone pick
          a size, which is the objection the whole section exists to answer.
          A definition list, not a sentence — each fact is labelled so it can be
          scanned rather than read, and so a single fact still looks intentional
          instead of like a field somebody forgot to fill in. */}
      {facts.length > 0 && (
        <dl className="rv-facts">
          {facts.map((f) => (
            <div key={f.label} className="rv-fact">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="rv-by">
        <span style={{ fontWeight: 600 }}>{review.name}</span>
        {review.verified && <span className="rv-tag">verified buyer</span>}
        {review.activity && <span className="rv-muted">{review.activity}</span>}
      </p>
    </article>
  );
}

export default function ProductReviews({
  summary,
  productHandle,
}: {
  summary: ReviewSummary;
  productHandle: string;
}) {
  // The form only accepts Sierra Shorts, so the pant must not advertise a
  // link that would reject whatever someone wrote in it.
  const canReview = REVIEWABLE_HANDLES.includes(productHandle);
  const writeHref = '/review';

  /**
   * No reviews yet: one quiet line, not an empty "what people are saying"
   * heading. A section with a heading and nothing under it reads as a product
   * nobody bought; a single invitation reads as a new product and gives the
   * one person who did buy somewhere to go.
   */
  if (!summary.showList) {
    if (!canReview) return null;
    return (
      <section id="reviews" className="rv-root rv-empty">
        <style>{CSS}</style>
        <p className="rv-empty-line">
          Bought these?{' '}
          <Link href={writeHref} className="rv-write">write the first review</Link>
        </p>
      </section>
    );
  }

  return (
    <section id="reviews" className="rv-root" aria-labelledby="rv-heading">
      <style>{CSS}</style>

      <div className="rv-top">
        <h2 id="rv-heading" className="rv-h">what people are saying</h2>
        {summary.showSummary && (
          <>
            <Stars value={summary.average} />
            <span className="rv-count">
              {summary.average.toFixed(1)} · {summary.count} reviews
            </span>
          </>
        )}
        {/* Deliberately in the heading row rather than under the last card:
            the people most likely to write one are past customers who came
            back to the page, and they shouldn't have to scroll the wall of
            reviews to find the link. */}
        {canReview && <Link href={writeHref} className="rv-write">write a review</Link>}
      </div>

      <div className="rv-list">
        {summary.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

const CSS = `
        .rv-root {
          max-width: 780px;
          margin: 0 auto;
          padding: clamp(36px, 6vw, 60px) 20px clamp(48px, 7vw, 72px);
        }
        .rv-top {
          display: flex; align-items: baseline; gap: 12px;
          flex-wrap: wrap; margin-bottom: 4px;
        }
        .rv-h {
          font-family: ${sans};
          font-size: clamp(19px, 2.4vw, 24px);
          font-weight: 700; letter-spacing: -0.02em;
          color: ${maroon}; margin: 0; text-transform: lowercase;
        }
        .rv-count { font-family: ${sans}; font-size: 13px; color: ${soft}; }

        /* One column on a phone, two once there's room. Reviews are short;
           a single 780px column of them reads as a lot of empty space. */
        .rv-list {
          display: grid; grid-template-columns: 1fr;
          gap: clamp(14px, 2vw, 20px); margin-top: 22px;
        }
        @media (min-width: 720px) {
          .rv-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        .rv-card {
          background: #fff; border: 1px solid ${rule};
          border-radius: 14px; padding: clamp(14px, 2vw, 18px);
          display: flex; flex-direction: column;
        }
        .rv-head { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-bottom: 8px; }
        .rv-title {
          font-family: ${sans}; font-size: 13px; font-weight: 700;
          color: ${ink}; margin: 0; text-transform: lowercase;
        }
        .rv-photo { margin: 0 0 10px; max-width: 220px; }
        .rv-body {
          font-family: ${sans}; font-size: 13.5px; line-height: 1.75;
          color: ${ink}; margin: 0 0 10px;
        }
        .rv-facts {
          display: flex; flex-wrap: wrap; gap: 6px;
          margin: 0 0 10px; padding: 0;
        }
        .rv-fact {
          display: flex; align-items: baseline; gap: 5px;
          background: #FBF1F5; border-radius: 999px; padding: 4px 10px;
        }
        .rv-fact dt {
          font-family: ${sans}; font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: ${soft}; margin: 0;
        }
        .rv-fact dd {
          font-family: ${sans}; font-size: 12px; font-weight: 700;
          color: ${maroon}; margin: 0;
        }
        /* Pushes the byline to the bottom so cards line up in the two-column
           layout even when one review is twice as long as its neighbour. */
        .rv-by {
          margin: auto 0 0; padding-top: 4px;
          font-family: ${sans}; font-size: 11px; color: ${soft};
          display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        }
        .rv-tag {
          background: #FBF1F5; color: ${maroon};
          border-radius: 999px; padding: 2px 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
        }
        .rv-muted { color: ${soft}; }

        .rv-empty { padding-top: clamp(28px, 4vw, 40px); padding-bottom: clamp(28px, 4vw, 40px); }
        .rv-empty-line {
          font-family: ${sans}; font-size: 13.5px; color: ${soft};
          margin: 0; text-align: center;
        }
        .rv-write {
          font-family: ${sans}; font-size: 12.5px; font-weight: 700;
          letter-spacing: 0.04em; color: ${maroon};
          text-decoration: underline; text-underline-offset: 3px;
          margin-left: auto;
        }
        .rv-empty-line .rv-write { margin-left: 0; }
`;
