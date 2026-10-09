import type { Metadata } from 'next';
import Link from 'next/link';
import { PolicyPage, Section, P, maroon } from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: 'size + fit',
  description:
    "Tualmi size charts, inseam and rise measurements, and fit notes for the Sierra Shorts and Juniper Pant.",
  alternates: { canonical: '/footer-pages/size-fit' },
};

export default function SizeFitPage() {
  return (
    <PolicyPage title="size + fit">
      <Section>
        <P>
          Each product page has its own full size guide with exact garment measurements — head there for
          the details on any piece. Below is our general fit guidance.
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
