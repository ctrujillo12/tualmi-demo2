import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function LegalPage() {
  return (
    <PolicyPage title="terms & conditions">
      <Section>
        <P>
          These terms govern your use of tualmi.com and any purchase you make from us. By using the site
          or placing an order, you agree to them.
        </P>
      </Section>

      <Section heading="orders &amp; pricing">
        <P>
          Prices are shown at checkout and may change over time. We do our best to keep product details
          and availability accurate, and we reserve the right to correct errors, cancel an order, or
          refuse service if needed. If we cancel an order you&apos;ve paid for, we&apos;ll refund you in full.
        </P>
      </Section>

      <Section heading="preorders">
        <P>
          Some items are sold as preorders and ship on the timeline noted on the product page. Payment is
          collected at the time you order, and you can cancel a preorder for a full refund any time before
          it ships.
        </P>
      </Section>

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

      <Section heading="contact">
        <P>
          Tualmi
          <br />
          Email: hello@tualmi.com
        </P>
      </Section>
    </PolicyPage>
  );
}
