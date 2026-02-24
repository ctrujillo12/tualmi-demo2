import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function ReturnsPage() {
  return (
    <>
      <HeaderStaticBlack />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Returns & Refunds
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Intro */}
          <div className="space-y-4">
            <p>
              Please choose carefully. At this time, we are unable to offer refunds for items that you wish to return.
            </p>
          </div>

          {/* Exchange / Credit */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Exchange / Credit</h2>

            <p>
              For change of mind, size change, or design change, we offer store credit for any unworn swimwear, clothing, and accessories, provided all of the following requirements are met:
            </p>

            <ul className="space-y-2 list-disc list-inside">
              <li>Items are unworn, unwashed, and in original packaging including swing tags and eco cotton bag</li>
              <li>Your order number is included for return or exchange</li>
              <li>Items are shipped for return within 2 weeks of receiving your order</li>
            </ul>

            <p>
              If any of these requirements are not met, we reserve the right to refuse the return.
            </p>

            <p>
              Please note that return shipping costs are the responsibility of the customer. Original shipping charges are non-refundable, and we do not provide or reimburse return or exchange shipping.
            </p>
          </div>

          {/* Return Address */}
          <div className="space-y-4">
            <p>
              If you would like to return your items, please ship them to the address below and include your order number and full name inside.
            </p>

            <div className="space-y-1">
              <p className="tracking-wide">Tualmi Outdoors Returns</p>
              <p>PO BOX 172</p>
              <p>Bentley 6982 WA</p>
              <p>Australia</p>
            </div>

            <p>
              We strongly advise using a track and trace postal service. We are not responsible for any return parcels that are lost or damaged.
            </p>

            <p>
              Please allow 1–3 business days for your return to be processed once received by our warehouse.
            </p>

            <p>
              For assistance, contact tualmioutdoors@gmail.com
            </p>
          </div>

          {/* Sale Items */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Sale Items</h2>

            <p>
              All sale items are final. No returns or exchanges.
            </p>
          </div>

          {/* Archive Sale */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Archive Sale</h2>

            <p>
              All Archive Sale pieces are final sale. No returns or exchanges will be accepted.
            </p>

            <p>
              Any Archive Sale items returned to us will be sent back at the customer’s expense.
            </p>
          </div>

          {/* Faulty */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Faulty or Damaged Items</h2>

            <p>
              If you receive an order with faulty or damaged goods, please contact tualmioutdoors@gmail.com as soon as possible.
            </p>

            <p>
              We may request photographic evidence or additional details. We reserve the right to determine whether an item is genuinely faulty.
            </p>

            <p>
              If an item is deemed faulty, we will cover all return costs and provide a full refund, including original shipping fees.
            </p>

            <p>
              For further information, please contact tualmioutdoors@gmail.com
            </p>
          </div>

          {/* Cancellation */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">Cancellation of Orders</h2>

            <p>
              Please carefully check that your order, including your delivery address, is accurate before submitting.
            </p>

            <p>
              We have a strict no cancellation policy. No cancellations or changes will be accepted. This also applies to pre-orders.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}