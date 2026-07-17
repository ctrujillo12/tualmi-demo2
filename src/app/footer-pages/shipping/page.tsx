import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function ShippingPage() {
  return (
    <PolicyPage title="shipping">
      <Section>
        <P>Shipping is available worldwide.</P>
        <P>We aim to process and ship all orders within 1–2 business days.</P>
        <P style={{ fontStyle: 'italic' }}>
          During busy sale periods, we aim to ship all orders within 3–5 business days. Thank you for your patience.
        </P>
      </Section>

      <Section heading="united states">
        <P>Express Shipping — $13.00 USD · 2–3 Business Days</P>
        <P>Standard Shipping — $10.00 USD · 5+ Business Days</P>
        <P>Free standard shipping when you spend over $200 USD</P>
        <P>
          Please note that our warehouse is located in Los Angeles, and express next-day delivery is not guaranteed for eastern states.
        </P>
      </Section>

      <Section heading="australia">
        <P>Express Shipping — $16.50 USD · 3–5 Business Days</P>
        <P>Free express shipping when you spend over $231.00 USD</P>
        <P>
          Please note that some items have weight-based shipping rates and may incur a higher shipping cost. You will be notified at checkout.
        </P>
      </Section>

      <Section heading="united kingdom">
        <P>Standard Shipping — $16.50 USD · 14+ Business Days</P>
        <P>Express Shipping — $23.10 USD · 10+ Business Days</P>
      </Section>

      <Section heading="rest of the world">
        <P>Standard Shipping — $16.50 USD · 14+ Business Days</P>
        <P>DHL Express — $33.00 USD · 6+ Business Days</P>
        <P>We will not be held liable for any loss, damage, or delay caused through postal services.</P>
      </Section>

      <Section heading="pre-orders">
        <P>If you ordered a pre-order item along with in-stock items, we will wait to receive your full order before shipping.</P>
        <P>If you would like to receive in-stock products earlier, please place separate orders.</P>
        <P>Alternatively, you can request split shipping by emailing us at hello@tualmi.com.</P>
        <P>Please allow 2–3 business days for shipping once the pre-order shipment is delivered to us.</P>
        <P>Pre-order timeframes are estimated and may be subject to change.</P>
      </Section>

      <Section heading="duties and taxes">
        <P>
          The customer is responsible for all customs and duty fees payable upon delivery. Duties and taxes are not included in the
          shipping price. Please contact your local customs office for more information.
        </P>
        <P>
          If you choose to reject or refuse delivery due to customs fees, a $46.20 USD return fee will be deducted from your refund or
          store credit. This covers return shipping and associated fees.
        </P>
      </Section>

      <Section heading="delivery">
        <P>
          Once your package has been accepted by the postal service, we are no longer responsible for delivery. We are not liable for
          shipment delays, missing, lost, or stolen packages. If you experience delivery issues, please contact your local postal
          service directly.
        </P>
        <P>To avoid any issues, we recommend requesting signature confirmation on delivery.</P>
      </Section>
    </PolicyPage>
  );
}
