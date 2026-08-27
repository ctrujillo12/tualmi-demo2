import Link from 'next/link';
import { PolicyPage, Section, P, Bullets, DataTable, maroon } from '@/components/PolicyPage';
import { FREE_SHIPPING_SENTENCE, FREE_SHIPPING_THRESHOLD, money } from '@/lib/shipping';

export default function ShippingPage() {
  return (
    <PolicyPage title="shipping">
      <Section>
        <P>
          We ship worldwide from Los Angeles, California. Shipping cost and estimated delivery time
          are shown at checkout based on your address and order weight.
        </P>
      </Section>

      <Section heading="free shipping">
        {/* The threshold is promised in the header strip, the cart bar and on
            every product page, but the policy page never stated it — which is
            the one page a shopper opens to check whether the promise is real.
            Reads from lib/shipping so it can't drift from those surfaces. */}
        <P>
          <strong>{FREE_SHIPPING_SENTENCE}</strong> The discount applies automatically at
          checkout once your order subtotal reaches {money(FREE_SHIPPING_THRESHOLD)}, before
          tax. International orders are quoted live by the carrier and aren&apos;t covered.
        </P>
      </Section>

      <Section heading="united states">
        <P>Flat rate standard shipping under {money(FREE_SHIPPING_THRESHOLD)}:</P>
        <DataTable
          headers={['service', 'order weight', 'rate']}
          rows={[
            ['Standard', '0–1 lb', '$7.99'],
            ['Standard', '1–5 lb', '$9.99'],
          ]}
        />
      </Section>

      <Section heading="international">
        <P>
          International rates are calculated live at checkout by the carrier, so you&apos;ll see the
          exact cost and estimated transit time before you pay. Available services include:
        </P>
        <Bullets
          items={[
            'DHL Express Worldwide',
            'FedEx International Connect Plus®',
            'USPS First Class Package International, Priority Mail International, and Priority Mail Express International (select countries)',
          ]}
        />
        <P>
          USPS options are available in select countries. Everywhere else, DHL Express and FedEx are
          offered.
        </P>
      </Section>

      <Section heading="duties &amp; taxes">
        <P>
          Import duties, taxes, and customs fees are set by the destination country and are the
          customer&apos;s responsibility. DHL Express orders support prepaid duties at checkout —
          when that option is shown, you can pay everything upfront and avoid a bill on delivery.
          Otherwise, the carrier will collect any charges before your package is released.
        </P>
      </Section>

      <Section heading="processing time">
        <P>
          Sierra Shorts are in stock and ship within 2–3 business days of your order.
        </P>
        <P>
          The Juniper Pant is a preorder and ships in mid September. If you order the pant together with
          shorts, your whole order ships in mid September — place separate orders if you&apos;d like the
          shorts sooner.
        </P>
      </Section>

      <Section heading="tracking">
        <P>You&apos;ll receive a confirmation email with tracking as soon as your order ships.</P>
      </Section>

      <Section heading="delays &amp; lost packages">
        <P>
          Once a package is handed to the carrier, delivery is in their hands and timelines aren&apos;t
          guaranteed. International orders can also be held in customs, which is outside our control.
          If your tracking stalls or a package goes missing, email us at hello@tualmi.com and we&apos;ll
          help you sort it out.
        </P>
      </Section>

      <Section heading="returns &amp; exchanges">
        <P>
          Need to send something back or swap a size? Start with our{' '}
          <Link href="/footer-pages/exchanges" style={{ color: maroon, fontWeight: 600 }}>
            return &amp; exchange form
          </Link>
          {' '}— it collects your order number so we can get straight to it. Full terms are in our{' '}
          <Link href="/footer-pages/returns" style={{ color: maroon, fontWeight: 600 }}>
            returns &amp; refunds policy
          </Link>.
        </P>
      </Section>

      <Section heading="questions">
        <P>Anything shipping-related, reach us at hello@tualmi.com.</P>
      </Section>
    </PolicyPage>
  );
}
