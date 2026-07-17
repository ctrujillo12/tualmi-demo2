import { PolicyPage, Section, P, Bullets } from '@/components/PolicyPage';

export default function ReturnsPage() {
  return (
    <PolicyPage title="returns & refunds">
      <Section>
        <P>Please choose carefully. At this time, we are unable to offer refunds for items that you wish to return.</P>
      </Section>

      <Section heading="exchange / credit">
        <P>
          For change of mind, size change, or design change, we offer store credit for any unworn swimwear, clothing, and accessories,
          provided all of the following requirements are met:
        </P>
        <Bullets
          items={[
            'Items are unworn, unwashed, and in original packaging including hang tags and eco cotton bag',
            'Your order number is included for return or exchange',
            'Items are shipped for return within 2 weeks of receiving your order',
          ]}
        />
        <P>If any of these requirements are not met, we reserve the right to refuse the return.</P>
        <P>
          Please note that return shipping costs are the responsibility of the customer. Original shipping charges are non-refundable,
          and we do not provide or reimburse return or exchange shipping.
        </P>
      </Section>

      <Section heading="return address">
        <P>
          If you would like to return your items, please ship them to the address below and include your order number and full name
          inside.
        </P>
        <P>
          Tualmi Outdoors Returns
          <br />
          340 E Foothill Blvd #660
          <br />
          Claremont CA 91711
          <br />
          USA
        </P>
        <P>
          We strongly advise using a shipping service with tracking. We are not responsible for any return packages that are lost or
          damaged.
        </P>
        <P>Please allow 1–3 business days for your return to be processed once received by our warehouse.</P>
        <P>For assistance, contact hello@tualmi.com</P>
      </Section>

      <Section heading="sale items">
        <P>All sale items are final. No returns or exchanges.</P>
      </Section>

      <Section heading="archive sale">
        <P>All Archive Sale pieces are final sale. No returns or exchanges will be accepted.</P>
        <P>Any Archive Sale items returned to us will be sent back at the customer&apos;s expense.</P>
      </Section>

      <Section heading="faulty or damaged items">
        <P>If you receive an order with faulty or damaged goods, please contact hello@tualmi.com as soon as possible.</P>
        <P>
          We may request photographic evidence or additional details. We reserve the right to determine whether an item is genuinely
          faulty.
        </P>
        <P>If an item is deemed faulty, we will cover all return costs and provide a full refund, including original shipping fees.</P>
        <P>For further information, please contact hello@tualmi.com</P>
      </Section>

      <Section heading="cancellation of orders">
        <P>Please carefully check that your order, including your delivery address, is accurate before submitting.</P>
        <P>We have a strict no cancellation policy. No cancellations or changes will be accepted. This also applies to pre-orders.</P>
      </Section>
    </PolicyPage>
  );
}
