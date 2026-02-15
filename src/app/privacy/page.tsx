import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function StoryPage() {
  return (
    <>
      {/* Black static header */}
      <HeaderStaticBlack />

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Privacy Policy
        </h1>

        <div className="space-y-10 text-sm leading-relaxed tracking-wide">
          
          {/* SECTION 1 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</h2>
            <p>
              When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.
            </p>
            <p>
              When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.
            </p>
            <p>
              Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 2 - CONSENT</h2>
            <p className="font-medium">How do you get my consent?</p>
            <p>
              When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.
            </p>
            <p>
              If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.
            </p>

            <p className="font-medium">How do I withdraw my consent?</p>
            <p>
              If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at tualmioutdoors@gmail.com
            </p>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 3 - DISCLOSURE</h2>
            <p>
              We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.
            </p>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 4 - SHOPIFY</h2>
            <p>
              Our store is hosted on Shopify Inc. They provide us with the online e-commerce platform that allows us to sell our products and services to you.
            </p>
            <p>
              Your data is stored through Shopify’s data storage, databases and the general Shopify application. They store your data on a secure server behind a firewall.
            </p>

            <p className="font-medium">Payment:</p>
            <p>
              If you choose a direct payment gateway to complete your purchase, then Shopify stores your credit card data. It is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS).
            </p>
            <p>
              Your purchase transaction data is stored only as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is deleted.
            </p>
            <p>
              All direct payment gateways adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, Mastercard, American Express.
            </p>
            <p>
              PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.
            </p>
            <p>
              For more insight, you may also want to read Shopify’s Terms of Service or Privacy Statement.
            </p>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 5 - THIRD-PARTY SERVICES</h2>
            <p>
              In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.
            </p>
            <p>
              However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies.
            </p>
            <p>
              Once you leave our store’s website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy.
            </p>
            <p>
              We partner with Privy, who may collect personal information when you interact with our site.
            </p>

            <p className="font-medium">Links</p>
            <p>
              When you click on links on our store, they may direct you away from our site. We are not responsible for the privacy practices of other sites.
            </p>
          </section>

          {/* SECTION 6 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 6 - SECURITY</h2>
            <p>
              To protect your personal information, we take reasonable precautions and follow industry best practices.
            </p>
            <p>
              If you provide us with your credit card information, it is encrypted using SSL and stored with AES-256 encryption.
            </p>
          </section>

          {/* SECTION 7 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 7 - COOKIES</h2>
            <p>Here is a list of cookies that we use:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>_session_id – session info</li>
              <li>_shopify_visit – visit tracking</li>
              <li>_shopify_uniq – visit count</li>
              <li>cart – cart contents</li>
              <li>_secure_session_id – secure session</li>
              <li>storefront_digest – access control</li>
            </ul>
          </section>

          {/* SECTION 8 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 8 - AGE OF CONSENT</h2>
            <p>
              By using this site, you represent that you are at least the age of majority in your state or province of residence.
            </p>
          </section>

          {/* SECTION 9 */}
          <section className="space-y-4">
            <h2 className="font-semibold">SECTION 9 - CHANGES TO THIS PRIVACY POLICY</h2>
            <p>
              We reserve the right to modify this privacy policy at any time.
            </p>
            <p>
              If our store is acquired or merged with another company, your information may be transferred.
            </p>
          </section>

          {/* CONTACT */}
          <section className="space-y-4">
            <h2 className="font-semibold">QUESTIONS AND CONTACT INFORMATION</h2>
            <p>
              If you would like to access, correct, amend or delete any personal information, contact us at tualmioutdoors@gmail.com
            </p>
            <p>[Re: Privacy Compliance Officer]</p>
          </section>

        </div>
      </main>
    </>
  );
}
