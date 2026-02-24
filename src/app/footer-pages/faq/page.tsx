import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function FAQPage() {
  return (
    <>
      <HeaderStaticBlack />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          FAQs
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Shipping */}
          <div className="space-y-6">
            <h2 className="uppercase tracking-widest text-xs">Shipping</h2>

            <div className="space-y-4">
              <p><span className="tracking-wide">What is your shipping timeframe?</span><br />
              We aim to process and dispatch all orders within 1–2 business days. During busy periods, this may extend to 3–5 business days.</p>

              <p><span className="tracking-wide">Do you ship internationally?</span><br />
              Yes, we offer worldwide shipping.</p>

              <p><span className="tracking-wide">How much is shipping within Australia?</span><br />
              Standard and express options are available at checkout. Free standard shipping is offered on orders over a set threshold.</p>

              <p><span className="tracking-wide">What are the shipping options for New Zealand?</span><br />
              Both standard and express shipping options are available at checkout.</p>

              <p><span className="tracking-wide">Do you offer express shipping to the USA?</span><br />
              Yes, express shipping via DHL is available.</p>

              <p><span className="tracking-wide">Are duties and taxes included?</span><br />
              Duties and taxes are not included and may be payable upon delivery depending on your location.</p>
            </div>
          </div>

          {/* Returns */}
          <div className="space-y-6">
            <h2 className="uppercase tracking-widest text-xs">Returns</h2>

            <div className="space-y-4">
              <p><span className="tracking-wide">Can I return or exchange sale items?</span><br />
              All sale items are final sale and cannot be returned or exchanged.</p>

              <p><span className="tracking-wide">What is your returns policy for full-priced items?</span><br />
              We offer store credit for eligible returns that meet our return conditions.</p>

              <p><span className="tracking-wide">How do I initiate a return?</span><br />
              Please send your item back to our returns address with your order number and full name included.</p>

              <p><span className="tracking-wide">Do you offer refunds?</span><br />
              We do not offer refunds for change of mind. Store credit is provided for approved returns.</p>

              <p><span className="tracking-wide">What should I do if I receive a faulty item?</span><br />
              Contact us as soon as possible with details and photos. If deemed faulty, we will cover return costs and issue a full refund.</p>

              <p><span className="tracking-wide">Can I cancel or change my order?</span><br />
              We have a strict no cancellation or changes policy once an order has been placed.</p>
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-6">
            <h2 className="uppercase tracking-widest text-xs">Orders</h2>

            <div className="space-y-4">
              <p><span className="tracking-wide">How do pre-orders work?</span><br />
              Pre-order timeframes are listed on each product page. If your order includes pre-order items, the full order will ship once all items are available. To receive items sooner, place separate orders or request split shipping.</p>

              <p><span className="tracking-wide">How can I track my order?</span><br />
              Once your order has been dispatched, you will receive tracking details via email.</p>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-6">
            <h2 className="uppercase tracking-widest text-xs">Product</h2>

            <div className="space-y-4">
              <p><span className="tracking-wide">What sizes do you offer?</span><br />
              We offer a range of sizes from XS to L. Please refer to our Size + Fit page for detailed guidance.</p>

              <p><span className="tracking-wide">How should I care for my garments?</span><br />
              We recommend cold washing, air drying, and avoiding harsh detergents to maintain fabric performance and longevity.</p>

              <p><span className="tracking-wide">Where are your products made?</span><br />
              Our pieces are designed and manufactured in Los Angeles using thoughtfully sourced materials.</p>
            </div>
          </div>

          {/* General */}
          <div className="space-y-6">
            <h2 className="uppercase tracking-widest text-xs">General</h2>

            <div className="space-y-4">
              <p><span className="tracking-wide">Do you offer gift cards?</span><br />
              Gift cards are available for purchase online.</p>

              <p><span className="tracking-wide">How can I contact customer service?</span><br />
              You can reach us at tualmioutdoors@gmail.com</p>

              <p><span className="tracking-wide">Where can I find more information?</span><br />
              Please refer to our Shipping, Returns, Size + Fit, and Garment Care pages for more details.</p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}