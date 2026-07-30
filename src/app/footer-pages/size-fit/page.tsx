import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function SizeFitPage() {
  return (
    <PolicyPage title="size + fit">
      <Section>
        <P>
          Each product page has its own full size guide with exact garment measurements — head there for
          the details on any piece. Below is our general fit guidance.
        </P>
      </Section>

      <Section heading="how our pieces fit">
        <P>Our clothes generally run true to size.</P>
        <P>
          Sierra Shorts — true to size, with a forgiving fit. If you&apos;re between sizes or like a snugger
          short, you can comfortably size down.
        </P>
        <P>
          Juniper Pant — true to size. If you&apos;re between sizes, size down.
        </P>
      </Section>

      <Section heading="still not sure?">
        <P>Reference the size guide on the product page, or email us at hello@tualmi.com and we&apos;ll help you find your fit.</P>
      </Section>
    </PolicyPage>
  );
}
