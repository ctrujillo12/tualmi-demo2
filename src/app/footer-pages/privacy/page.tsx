import { PolicyPage, Section, P, Bullets } from '@/components/PolicyPage';

export default function PrivacyPage() {
  return (
    <PolicyPage title="privacy policy">
      <Section>
        <P>
          This policy explains what information we collect, how we use it, and your choices. Questions?
          Email us at hello@tualmi.com.
        </P>
      </Section>

      <Section heading="what we collect">
        <P>When you shop with us or join our list, we may collect:</P>
        <Bullets
          items={[
            'Contact and order details you provide — name, email, shipping address',
            'Payment information, which is processed securely by Shopify (we never see or store full card numbers)',
            'Basic technical data like your device and browsing activity on our site',
          ]}
        />
      </Section>

      <Section heading="how we use it">
        <Bullets
          items={[
            'To process and ship your orders and provide customer support',
            'To send order updates, and — if you opt in — marketing emails you can unsubscribe from any time',
            'To improve our site and understand how it’s used',
          ]}
        />
      </Section>

      <Section heading="who we share it with">
        <P>
          We don&apos;t sell your personal information. We share it only with the services that help us
          run the store — for example Shopify (hosting and payments), our email platform, and shipping
          carriers — and only as needed to do their job. We may also disclose information if required by
          law.
        </P>
      </Section>

      <Section heading="cookies">
        <P>
          Our site and Shopify use cookies to keep your cart working, remember preferences, and measure
          site traffic. You can control cookies in your browser settings.
        </P>
      </Section>

      <Section heading="your choices">
        <P>
          You can unsubscribe from marketing emails at any time using the link in any email. To access,
          correct, or delete your personal information, email us at hello@tualmi.com.
        </P>
      </Section>

      <Section heading="children">
        <P>Our site and products are intended for adults. We don&apos;t knowingly collect information from children.</P>
      </Section>

      <Section heading="changes">
        <P>We may update this policy from time to time. The current version always lives on this page.</P>
      </Section>
    </PolicyPage>
  );
}
