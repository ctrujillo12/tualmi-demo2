import { PolicyPage, Section, P, Bullets } from '@/components/PolicyPage';

export default function PrivacyPage() {
  return (
    <PolicyPage title="privacy policy">
      <Section heading="section 1 - what do we do with your information?">
        <P>
          When you purchase something from our store, as part of the buying and selling process, we collect the personal information
          you give us such as your name, address and email address.
        </P>
        <P>
          When you browse our store, we also automatically receive your computer&apos;s internet protocol (IP) address in order to
          provide us with information that helps us learn about your browser and operating system.
        </P>
        <P>
          Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other
          updates.
        </P>
      </Section>

      <Section heading="section 2 - consent">
        <P style={{ fontWeight: 600 }}>How do you get my consent?</P>
        <P>
          When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange
          for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason
          only.
        </P>
        <P>
          If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your
          expressed consent, or provide you with an opportunity to say no.
        </P>
        <P style={{ fontWeight: 600 }}>How do I withdraw my consent?</P>
        <P>
          If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued
          collection, use or disclosure of your information, at any time, by contacting us at hello@tualmi.com
        </P>
      </Section>

      <Section heading="section 3 - disclosure">
        <P>We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</P>
      </Section>

      <Section heading="section 4 - shopify">
        <P>
          Our store is hosted on Shopify Inc. They provide us with the online e-commerce platform that allows us to sell our products
          and services to you.
        </P>
        <P>
          Your data is stored through Shopify&apos;s data storage, databases and the general Shopify application. They store your data
          on a secure server behind a firewall.
        </P>
        <P style={{ fontWeight: 600 }}>Payment:</P>
        <P>
          If you choose a direct payment gateway to complete your purchase, then Shopify stores your credit card data. It is encrypted
          through the Payment Card Industry Data Security Standard (PCI-DSS).
        </P>
        <P>
          Your purchase transaction data is stored only as long as is necessary to complete your purchase transaction. After that is
          complete, your purchase transaction information is deleted.
        </P>
        <P>
          All direct payment gateways adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which
          is a joint effort of brands like Visa, Mastercard, American Express.
        </P>
        <P>PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.</P>
        <P>For more insight, you may also want to read Shopify&apos;s Terms of Service or Privacy Statement.</P>
      </Section>

      <Section heading="section 5 - third-party services">
        <P>
          In general, the third-party providers used by us will only collect, use and disclose your information to the extent
          necessary to allow them to perform the services they provide to us.
        </P>
        <P>
          However, certain third-party service providers, such as payment gateways and other payment transaction processors, have
          their own privacy policies.
        </P>
        <P>
          Once you leave our store&apos;s website or are redirected to a third-party website or application, you are no longer
          governed by this Privacy Policy.
        </P>
        <P>We partner with Privy, who may collect personal information when you interact with our site.</P>
        <P style={{ fontWeight: 600 }}>Links</P>
        <P>
          When you click on links on our store, they may direct you away from our site. We are not responsible for the privacy
          practices of other sites.
        </P>
      </Section>

      <Section heading="section 6 - security">
        <P>To protect your personal information, we take reasonable precautions and follow industry best practices.</P>
        <P>If you provide us with your credit card information, it is encrypted using SSL and stored with AES-256 encryption.</P>
      </Section>

      <Section heading="section 7 - cookies">
        <P>Here is a list of cookies that we use:</P>
        <Bullets
          items={[
            '_session_id – session info',
            '_shopify_visit – visit tracking',
            '_shopify_uniq – visit count',
            'cart – cart contents',
            '_secure_session_id – secure session',
            'storefront_digest – access control',
          ]}
        />
      </Section>

      <Section heading="section 8 - age of consent">
        <P>By using this site, you represent that you are at least the age of majority in your state or province of residence.</P>
      </Section>

      <Section heading="section 9 - changes to this privacy policy">
        <P>We reserve the right to modify this privacy policy at any time.</P>
        <P>If our store is acquired or merged with another company, your information may be transferred.</P>
      </Section>

      <Section heading="questions and contact information">
        <P>If you would like to access, correct, amend or delete any personal information, contact us at hello@tualmi.com</P>
        <P>[Re: Privacy Compliance Officer]</P>
      </Section>
    </PolicyPage>
  );
}
