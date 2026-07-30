import { PolicyPage, Section, P, Bullets } from '@/components/PolicyPage';

export default function ReturnsPage() {
  return (
    <PolicyPage title="returns & refunds">
      <Section>
        <P>
          We want you to love what you ordered. If something isn&apos;t right, here&apos;s how it works.
          For anything below, email us at hello@tualmi.com with your order number and we&apos;ll take it
          from there.
        </P>
      </Section>

      <Section heading="cancellations">
        <P>
          You can cancel your order for a full refund any time before it ships — just email us. This
          includes preorders: you can cancel the Juniper Pant for a full refund any time before it ships
          in late August.
        </P>
      </Section>

      <Section heading="returns">
        <P>
          We accept returns within 14 days of delivery, as long as the item is unworn, unwashed, and has
          its tags still attached.
        </P>
        <Bullets
          items={[
            'Email hello@tualmi.com within 14 days of delivery with your order number',
            'Ship the item back to us — return shipping is covered by the customer',
            'Once we receive and inspect it, we’ll refund your original payment method',
          ]}
        />
        <P>
          Refunds are issued to your original payment method and typically take a few business days to
          appear after we process the return.
        </P>
      </Section>

      <Section heading="faulty or wrong items">
        <P>
          If your order arrives damaged, faulty, or wrong, email us at hello@tualmi.com within 14 days
          with a photo. We&apos;ll make it right and cover the return shipping.
        </P>
      </Section>

      <Section heading="return address">
        <P>
          We&apos;ll confirm return details over email before you ship anything back. Please don&apos;t
          send returns without contacting us first.
        </P>
      </Section>
    </PolicyPage>
  );
}
