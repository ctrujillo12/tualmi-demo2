import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function ShippingPage() {
  return (
    <PolicyPage title="shipping">
      <Section>
        <P>
          We ship within the United States. Shipping cost and estimated delivery time are calculated
          at checkout based on your address.
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
          guaranteed. If your tracking stalls or a package goes missing, email us at hello@tualmi.com and
          we&apos;ll help you sort it out.
        </P>
      </Section>

      <Section heading="questions">
        <P>Anything shipping-related, reach us at hello@tualmi.com.</P>
      </Section>
    </PolicyPage>
  );
}
