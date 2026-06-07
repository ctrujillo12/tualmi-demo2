

export default function ShippingPage() {
  return (
    <>


      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Shipping
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Intro */}
          <div className="space-y-4">
            <p className="tracking-wide">
              Shipping is available worldwide.
            </p>
            <p>
              We aim to process and dispatch all orders within 1–2 business days.
            </p>
            <p>
              <span className="italic">
                During busy sale periods, we aim to dispatch all orders within 3–5 business days. Thank you for your patience.
              </span>
            </p>
          </div>

          {/* United States */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">United States</h2>

            <div className="space-y-1">
              <p>Express Shipping — $13.00 USD · 2–3 Business Days</p>
              <p>Standard Shipping — $10.00 USD · 5+ Business Days</p>
              <p className="tracking-wide">Free standard shipping when you spend over $200 USD</p>
            </div>

            <p>
              Please note that our warehouse is located in Los Angeles, and express next-day delivery is not guaranteed for eastern states.
            </p>
          </div>

          {/* Australia */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Australia</h2>

            <div className="space-y-1">
              <p>Express Shipping — $16.50 USD · 3–5 Business Days</p>
              <p className="tracking-wide">Free express shipping when you spend over $231.00 USD</p>
            </div>

            <p>
              Please note that some items have weight-based shipping rates and may incur a higher postage cost. You will be notified at checkout.
            </p>
          </div>

          {/* United Kingdom */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">United Kingdom</h2>

            <div className="space-y-1">
              <p>Standard Shipping — $16.50 USD · 14+ Business Days</p>
              <p>Express Shipping — $23.10 USD · 10+ Business Days</p>
            </div>
          </div>

          {/* Rest of World */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Rest of the World</h2>

            <div className="space-y-1">
              <p>Standard Shipping — $16.50 USD · 14+ Business Days</p>
              <p>DHL Express — $33.00 USD · 6+ Business Days</p>
            </div>

            <p>
              We will not be held liable for any loss, damage, or delay caused through postal services.
            </p>
          </div>

          {/* Pre-Orders */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Pre-Orders</h2>

            <p>
              If you ordered a pre-order item along with in-stock items, we will wait to receive your full order before dispatching.
            </p>

            <p>
              If you would like to receive in-stock products earlier, please place separate orders.
            </p>

            <p>
              Alternatively, you can request split shipping by emailing us at tualmioutdoors@gmail.com.
            </p>

            <p>
              Please allow 2–3 business days for dispatch once the pre-order shipment is delivered to us.
            </p>

            <p>
              Pre-order timeframes are estimated and may be subject to change.
            </p>
          </div>

          {/* Duties */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Duties and Taxes</h2>

            <p>
              The customer is responsible for all customs and duty fees payable upon delivery. Duties and taxes are not included in the shipping price. Please contact your local customs office for more information.
            </p>

            <p>
              If you choose to reject or refuse delivery due to customs fees, a $46.20 USD return fee will be deducted from your refund or store credit. This covers return shipping and associated fees.
            </p>
          </div>

          {/* Delivery */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Delivery</h2>

            <p>
              Once your package has been accepted by the postal service, we are no longer responsible for delivery. We are not liable for shipment delays, missing, lost, or stolen packages. If you experience delivery issues, please contact your local postal service directly.
            </p>

            <p>
              To avoid any issues, we recommend requesting signature on delivery.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}