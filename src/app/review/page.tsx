import type { Metadata } from 'next';
import ReviewForm from '@/components/ReviewForm';

/**
 * /review — the one link you send people.
 *
 * Works from anywhere: the Klaviyo post-delivery email, an Instagram story,
 * a packaging insert, or the "write a review" link on a product page. Add
 * ?product=sierra-shorts to preselect the product so the first question is
 * already answered.
 *
 * Not indexed — it's a form for customers, not a page for search results, and
 * an indexed review form attracts exactly the submissions you don't want.
 */

export const metadata: Metadata = {
  title: 'write a review',
  description: 'Tell us how your Tualmi gear held up.',
  robots: { index: false, follow: false },
};

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;

  return (
    <main style={{ backgroundColor: '#FAFAF7', minHeight: '100vh', padding: 'clamp(32px, 6vw, 64px) 20px clamp(56px, 8vw, 88px)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <p style={{ fontFamily: sans, fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: soft, margin: '0 0 18px', textAlign: 'center' }}>
          Tualmi
        </p>
        <h1 style={{ fontFamily: sans, fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', color: maroon, margin: '0 0 12px', textAlign: 'center', textTransform: 'lowercase' }}>
          how did they hold up?
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', lineHeight: 1.8, color: '#3B2F1E', margin: '0 0 32px', textAlign: 'center' }}>
          Two minutes, and it genuinely helps the next person work out whether
          these are right for her.
        </p>

        <ReviewForm initialProduct={product} />
      </div>
    </main>
  );
}
