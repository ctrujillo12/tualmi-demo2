import type { Metadata } from 'next';
import Link from 'next/link';
import { PolicyPage, Section, P, DataTable, maroon } from '@/components/PolicyPage';
import { PRODUCT_DETAILS } from '@/lib/productDetails';

/**
 * The size charts, printed in full.
 *
 * This page used to say "each product page has its own size guide" and stop,
 * so the one URL on the site whose subject is fit had no measurements on it.
 * Fit is the most-asked question in women's outdoor clothing ("hiking pants
 * for petite women", "what size Juniper Pant"), and an assistant answering it
 * needs a page with the numbers. The tables come from lib/productDetails.ts,
 * the same data as the product pages' size guide, so the two can't disagree.
 */
const CHARTS = [
  { handle: 'juniper-pant', name: 'Juniper Pant', kind: 'women’s flare cargo hiking pants' },
  { handle: 'sierra-shorts', name: 'Sierra Shorts', kind: 'women’s mid-rise hiking shorts' },
] as const;

export const metadata: Metadata = {
  title: 'size chart + fit guide',
  description:
    'Tualmi size charts for the Juniper Pant (29" inseam, XXS–XXL) and Sierra Shorts (1.5" inseam, XXS–XXL): waist, hip, thigh and rise measurements, plus how each one fits.',
  alternates: { canonical: '/footer-pages/size-fit' },
};

export default function SizeFitPage() {
  return (
    <PolicyPage title="size + fit">
      <Section>
        <P>
          How each piece fits, then the full garment measurements for every size. The same size guide
          is on each product page.
        </P>
      </Section>

      <Section heading="how our pieces fit">
        <P>
          Most people order their usual size. If you&apos;re between sizes, it depends on the piece:
        </P>
        <P>
          Sierra Shorts — relaxed fit. Between sizes, it comes down to how you like your shorts to fit:
          size down for a snugger fit, or size up for more room.
        </P>
        <P>
          Juniper Pant — relaxed flared leg, roomy through the hip and thigh. If you&apos;re between sizes
          or want a looser fit, size up. Waist and hip in different sizes? Go by your hip; the waist adjusts.
        </P>
      </Section>

      {CHARTS.map(({ handle, name, kind }) => {
        const chart = PRODUCT_DETAILS[handle]?.sizeChart;
        if (!chart) return null;
        return (
          <Section key={handle} heading={`${name.toLowerCase()} size chart`}>
            <P>
              <Link href={`/products/${handle}`} style={{ color: maroon, fontWeight: 600 }}>
                {name}
              </Link>
              {`, ${kind}. `}
              {chart.note}
            </P>
            <DataTable
              headers={['', ...chart.sizes]}
              rows={chart.rows.map((r) => [r.label, ...r.values])}
            />
          </Section>
        );
      })}

      <Section heading="still not sure?">
        <P>Reference the size guide on the product page, or email us at hello@tualmi.com and we&apos;ll help you find your fit.</P>
      </Section>

      <Section heading="ordered the wrong size?">
        <P>
          It happens — fill out our{' '}
          <Link href="/footer-pages/exchanges" style={{ color: maroon, fontWeight: 600 }}>
            return &amp; exchange form
          </Link>{' '}
          with your order number and the size you&apos;d like instead, and we&apos;ll check availability
          and hold it for you where we can.
        </P>
      </Section>
    </PolicyPage>
  );
}
