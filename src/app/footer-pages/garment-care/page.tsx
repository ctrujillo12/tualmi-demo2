import { PolicyPage, Section, P } from '@/components/PolicyPage';

export default function GarmentCarePage() {
  return (
    <PolicyPage title="garment care">
      <Section>
        <P>Our pieces are thoughtfully made using quality fabrics designed to move with you — from trail to everyday wear.</P>
        <P>The way you wash, dry, and store your garments plays a key role in maintaining their performance, shape, and longevity.</P>
        <P>Follow the care guidelines below to keep your pieces looking and feeling their best.</P>
      </Section>

      <Section heading="washing">
        <P>Wash in cold water with like colors using a mild detergent. This helps preserve fabric integrity and color.</P>
        <P>Turn garments inside out before washing to reduce surface wear.</P>
        <P>Avoid bleach, fabric softeners, and harsh chemicals, as they can damage technical fabrics and reduce performance.</P>
      </Section>

      <Section heading="drying">
        <P>Air dry in the shade whenever possible. Heat and direct sunlight can weaken fibers and cause fading over time.</P>
        <P>Avoid tumble drying unless specifically stated on the garment label.</P>
      </Section>

      <Section heading="fleece care">
        <P>To maintain softness and structure, wash fleece garments in cold water on a gentle cycle.</P>
        <P>Avoid fabric softeners, as they can coat fibers and reduce breathability.</P>
        <P>Air dry flat to help retain shape and prevent pilling.</P>
      </Section>

      <Section heading="storage">
        <P>Store garments folded in a cool, dry place. Avoid hanging heavier items for long periods, as this may stretch the fabric.</P>
        <P>Ensure items are fully dry before storing to prevent moisture buildup.</P>
      </Section>
    </PolicyPage>
  );
}
