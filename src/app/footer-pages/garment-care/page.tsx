import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function GarmentCarePage() {
  return (
    <PolicyPage title="garment care">
      <Section>
        <P>
          A little care keeps your pieces looking and performing their best. Always check the label on
          your garment first — if anything there differs from the below, follow the label.
        </P>
      </Section>

      <Section heading="washing">
        <P>Machine wash cold with like colors, turned inside out, using a mild detergent.</P>
        <P>Skip bleach and fabric softener — they break down technical fabrics over time.</P>
      </Section>

      <Section heading="drying">
        <P>Hang or lay flat to dry. Avoid high heat, which can weaken fibers and cause fading.</P>
        <P>Do not iron.</P>
      </Section>

      <Section heading="questions">
        <P>Not sure how to care for something? Email us at hello@tualmi.com.</P>
      </Section>
    </PolicyPage>
  );
}
