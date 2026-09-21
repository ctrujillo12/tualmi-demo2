import type { Metadata } from 'next';
import Link from 'next/link';
import { PolicyPage, Section, P, maroon } from '@/components/PolicyPage';
import { BUSINESS, ADDRESS_READY, formatAddress } from '@/lib/business';

/**
 * /footer-pages/contact — a real page, because a mailto: link is not one.
 *
 * The footer said "contact us" and pointed at mailto:hello@tualmi.com. For a
 * person that is arguably better than a page. For Google's automated
 * Misrepresentation check it is nothing at all: the check crawls pages, and a
 * mailto: href is not a page, so from the outside the site had no reachable
 * contact information and no postal address anywhere. That is the usual reason
 * a new store gets suspended.
 *
 * Everything here reads from lib/business.ts so this page, the footer and the
 * Organization structured data state the same address and the same phone
 * number. Mismatched contact details across a site is itself something the
 * policy calls out.
 */

export const metadata: Metadata = {
  title: 'contact — tualmi',
  description:
    'Get in touch with Tualmi. Email, phone and mailing address, plus how long we take to reply.',
  alternates: { canonical: '/footer-pages/contact' },
};

const link = { color: maroon, fontWeight: 600 };

export default function ContactPage() {
  return (
    <PolicyPage title="contact">
      <Section>
        <P>
          We&apos;re a two-person company and we answer our own email. Anything at all — sizing,
          an order, a return, a question about the fabric — reach us and you&apos;ll hear back
          from one of us within {BUSINESS.responseTime}.
        </P>
      </Section>

      <Section heading="email">
        <P>
          <a href={`mailto:${BUSINESS.email}`} style={link}>{BUSINESS.email}</a>
          {' '}— the fastest way to reach us, and the best one for anything about a specific
          order, since you can send us the order number.
        </P>
      </Section>

      <Section heading="phone">
        <P>
          <a href={`tel:${BUSINESS.phone}`} style={link}>{BUSINESS.phoneDisplay}</a>
        </P>
      </Section>

      {/* Rendered only once the address is complete. A street with no number
          and no ZIP is worse than nothing on the one page whose job is to
          prove a real business is here -- see the note in lib/business.ts. */}
      {ADDRESS_READY && (
        <Section heading="mailing address">
          <P>
            {BUSINESS.legalName}
            <br />
            {formatAddress()}
          </P>
          <P>
            Please don&apos;t send returns here without starting a{' '}
            <Link href="/footer-pages/exchanges" style={link}>return or exchange</Link> first —
            we&apos;ll email you the right address for it.
          </P>
        </Section>
      )}

      <Section heading="orders, returns and exchanges">
        <P>
          Start with the{' '}
          <Link href="/footer-pages/exchanges" style={link}>return &amp; exchange form</Link>.
          It asks for your order number, so it saves a round of email. The full terms are in our{' '}
          <Link href="/footer-pages/returns" style={link}>returns &amp; refunds policy</Link>, and
          delivery times are on the{' '}
          <Link href="/footer-pages/shipping" style={link}>shipping page</Link>.
        </P>
      </Section>
    </PolicyPage>
  );
}
