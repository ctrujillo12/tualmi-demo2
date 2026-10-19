import type { Metadata } from 'next';
import { PolicyPage, Section, P } from '@/components/PolicyPage';
import { BUSINESS, formatAddress } from '@/lib/business';

export const metadata: Metadata = {
  title: 'terms & conditions',
  description:
    "The terms that govern use of tualmi.com and purchases from Tualmi.",
  alternates: { canonical: '/footer-pages/legal' },
};

export default function LegalPage() {
  return (
    <PolicyPage title="terms & conditions" updated="October 19, 2026">
      <Section>
        <P>
          These terms govern your use of tualmi.com and any purchase you make from us. By using the site
          or placing an order, you agree to them. &ldquo;Tualmi&rdquo;, &ldquo;we&rdquo; and &ldquo;us&rdquo;
          mean {BUSINESS.legalName}, {formatAddress()}.
        </P>
      </Section>

      <Section heading="orders &amp; pricing">
        <P>
          Prices are shown at checkout and may change over time. We do our best to keep product details
          and availability accurate, and we reserve the right to correct errors, cancel an order, or
          refuse service if needed. If we cancel an order you&apos;ve paid for, we&apos;ll refund you in full.
        </P>
      </Section>

      {/* The "preorders" section was removed 22 Sept 2026. Nothing on the site
          is sold as a preorder any more, and a policy section describing one
          is a customer reading about a thing we do not do — on the page they
          open to find out what we DO do. The cancellation right it described
          is not lost: /footer-pages/returns already grants a full refund on
          any order cancelled before it ships, preorder or not. */}
      <Section heading="shipping, returns &amp; refunds">
        <P>Your order is covered by our Shipping and Returns &amp; Refunds policies, linked in the footer.</P>
      </Section>

      <Section heading="intellectual property">
        <P>
          The content on this site — including our name, logo, designs, text, and images — belongs to
          Tualmi and may not be used without our permission.
        </P>
      </Section>

      <Section heading="intended audience">
        <P>This site is intended for use by adults 18 and older.</P>
      </Section>

      <Section heading="limitation of liability">
        <P>
          The site and our products are provided as is, to the fullest extent permitted by law. We
          aren&apos;t liable for indirect or consequential damages arising from your use of the site.
        </P>
      </Section>

      <Section heading="governing law">
        <P>
          These terms are governed by the laws of the State of California, without regard to its
          conflict of law rules.
        </P>
      </Section>

      <Section heading="contact">
        <P>
          {BUSINESS.legalName}
          <br />
          {formatAddress()}
          <br />
          Phone: {BUSINESS.phoneDisplay}
          <br />
          Email: {BUSINESS.email}
        </P>
      </Section>
    </PolicyPage>
  );
}
