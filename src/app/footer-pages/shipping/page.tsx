import { PolicyPage, Section, P, Bullets, DataTable } from '@/components/PolicyPage';

export default function ShippingPage() {
  return (
    <PolicyPage title="shipping">
      <Section>
        <P>
          We ship worldwide from Los Angeles, California. Shipping cost and estimated delivery time
          are shown at checkout based on your address and order weight.
        </P>
      </Section>

      <Section heading="united states">
        <P>Flat rate standard shipping:</P>
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
          The Juniper Pant is a preorder and ships in late August. If you order the pant together with
          shorts, your whole order ships in late August — place separate orders if you&apos;d like the
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

      <Section heading="questions">
        <P>Anything shipping-related, reach us at hello@tualmi.com.</P>
      </Section>
    </PolicyPage>
  );
}
