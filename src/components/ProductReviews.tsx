import { fitLine, type Review, type ReviewSummary } from '@/lib/reviews';

/**
 * Reviews on a product page.
 *
 * A server component — the data is public, unchanging between renders, and
 * needs no interactivity, so there's no reason to ship it to the browser or to
 * make the shopper wait for a client fetch to fill it in.
 *
 * Renders nothing at all when summary.show is false. See MIN_REVIEWS_TO_SHOW in
 * lib/reviews.ts for why a nearly-empty review section is worse than none.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';
const ink    = '#3B2F1E';

function Stars({ rating, label }: { rating: number; label: string }) {
  const full = Math.round(rating);
  return (
    <span
      role="img"
      aria-label={label}
      style={{ color: maroon, fontSize: '13px', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}
    >
      {/* aria-label carries the meaning; the glyphs are decorative, and a
          screen reader spelling out five separate stars is noise. */}
      <span aria-hidden="true">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const fit = fitLine(review);

  return (
    <li style={{ borderTop: `1px solid ${rule}`, padding: '20px 0', listStyle: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <Stars rating={review.rating} label={`${review.rating} out of 5`} />
        {review.title && (
          <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: ink }}>
            {review.title}
          </span>
        )}
      </div>

      <p style={{ fontFamily: sans, fontSize: '13px', lineHeight: 1.8, color: ink, margin: '0 0 8px' }}>
        {review.body}
      </p>

      {/* The fit line is the part that actually helps someone choose a size,
          so it sits above the byline rather than buried under it. */}
      {fit && (
        <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '0.04em', color: maroon, margin: '0 0 6px' }}>
          {fit}
          {review.color ? ` · ${review.color}` : ''}
        </p>
      )}

      <p style={{ fontFamily: sans, fontSize: '11px', color: soft, margin: 0, letterSpacing: '0.04em' }}>
        {review.authorName}
        {review.verified && ' · verified buyer'}
        {/* The FTC requires the material connection behind a gifted review to
            be disclosed. This tag is that disclosure — it is not optional
            styling, and it should not be removed to make the wall look
            cleaner. See supabase/reviews.sql. */}
        {review.source === 'gifted' && ' · gifted product'}
      </p>
    </li>
  );
}

export default function ProductReviews({ summary }: { summary: ReviewSummary }) {
  if (!summary.show || summary.average === null) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 64px' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <h2
          id="reviews-heading"
          style={{ fontFamily: sans, fontSize: '13px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ink, margin: 0 }}
        >
          reviews
        </h2>
        <Stars rating={summary.average} label={`Average ${summary.average} out of 5`} />
        <span style={{ fontFamily: sans, fontSize: '12px', color: soft }}>
          {summary.average} · {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <ul style={{ margin: '16px 0 0', padding: 0 }}>
        {summary.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
    </section>
  );
}
