import Link from 'next/link';
import { PolicyPage, Section, P, Bullets, maroon } from '@/components/PolicyPage';

/** Shared link style so every pointer to the form looks the same. */
const formLink = { color: maroon, fontWeight: 600 };

export default function ReturnsPage() {
  return (
    <PolicyPage title="returns & refunds">
      <Section>
        <P>
          We want you to love what you ordered. If something isn&apos;t right, start with our{' '}
          <Link href="/footer-pages/exchanges" style={formLink}>
            return &amp; exchange form
          </Link>{' '}
          — it takes about a minute and asks for your order number, so we have everything we need to
          sort you out. Please use the form before shipping anything back.
        </P>
      </Section>

      <Section heading="how it works">
        <Bullets
          items={[
            <>
              Fill out the{' '}
              <Link href="/footer-pages/exchanges" style={formLink}>
                return &amp; exchange form
              </Link>{' '}
              with your order number, the item, and what you&apos;d like to happen
            </>,
            'We’ll email you back within 1–2 business days with return details and the address',
            'Ship the item back once we’ve confirmed',
            'Once we receive and inspect it, we’ll refund your original payment method',
          ]}
        />
        <P>
          Refunds go to your original payment method and typically take a few business days to appear
          after we process the return.
        </P>
      </Section>

      <Section heading="returns">
        <P>
          We accept returns within 14 days of delivery, as long as the item is unworn, unwashed, and has
          its tags still attached. Return shipping is covered by the customer.
        </P>
      </Section>

      <Section heading="exchanges">
        <P>
          Wrong size? Use the same{' '}
          <Link href="/footer-pages/exchanges" style={formLink}>
            form
          </Link>{' '}
          and tell us the size you have and the size you want — we&apos;ll check availability and hold it
          for you where we can.
        </P>
      </Section>

      <Section heading="cancellations">
        <P>
          You can cancel your order for a full refund any time before it ships — submit the{' '}
          <Link href="/footer-pages/exchanges" style={formLink}>
            form
          </Link>{' '}
          and choose cancellation as your request type. This includes preorders: you can cancel the
          Juniper Pant any time before it ships in mid September.
        </P>
      </Section>

      <Section heading="faulty or wrong items">
        <P>
          If your order arrives damaged, faulty, or wrong, submit the{' '}
          <Link href="/footer-pages/exchanges" style={formLink}>
            form
          </Link>{' '}
          within 14 days and describe the problem. We&apos;ll follow up by email to ask for a photo,
          make it right, and cover the return shipping.
        </P>
      </Section>

      <Section heading="return address">
        <P>
          We&apos;ll confirm return details over email before you ship anything back, so please don&apos;t
          send returns without submitting the form first — unannounced returns are hard for us to match
          to an order.
        </P>
      </Section>

      <Section heading="need a hand?">
        <P>
          The form is the fastest route, but if you&apos;re stuck you can always reach a real person at
          hello@tualmi.com.
        </P>
      </Section>
    </PolicyPage>
  );
}
