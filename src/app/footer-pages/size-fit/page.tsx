import { PolicyPage, Section, P, DataTable } from '@/components/PolicyPage';

export default function SizeFitPage() {
  return (
    <PolicyPage title="size + fit">
      <Section>
        <P>For any sizing questions, please email us at hello@tualmi.com</P>
        <P>All measurements are taken in centimeters (cm).</P>
      </Section>

      <Section heading="general size guide">
        <DataTable
          headers={['size', 'bust', 'waist', 'hips']}
          rows={[
            ['XS', '32–34" A–B', '23–25"', '32–34"'],
            ['S', '34–36" B–C', '25–27"', '34–36"'],
            ['M', '36–38" C–D', '27–29"', '36–38"'],
            ['L', '38–40" D–DD', '29–31"', '38–40"'],
          ]}
        />
      </Section>

      <Section heading="product fit notes">
        <P>Fit may vary slightly depending on the style. Below is guidance for select pieces.</P>
        <P>Trailblazer Fleece — Runs true to size with minimal coverage.</P>
        <P>Juniper Pant — Designed for a more relaxed fit. Size down for a tighter feel.</P>
        <P>Sierra Shorts — Adjustable ties allow for a flexible fit across sizes.</P>
      </Section>

      <Section heading="sierra shorts — garment measurements">
        <P>All measurements taken flat on the garment, in centimeters (cm).</P>
        <DataTable
          headers={['point of measure', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl']}
          rows={[
            ['Waist (relaxed)', 62, 67, 72, 77, 82, 87, 92],
            ['Hip', 100.5, 105.5, 110.5, 115.5, 120.5, 125.5, 130.5],
            ['Thigh', 66, 69, 72, 75, 78, 81, 84],
            ['Length', 26, 27, 28, 29, 30, 31, 32],
            ['Front rise (excl. waistband)', 21.6, 22.8, 24, 25.2, 26.4, 27.6, 28.8],
            ['Back rise (excl. waistband)', 30.6, 31.8, 33, 34.2, 35.4, 36.6, 37.8],
            ['Leg opening', 66, 69, 72, 75, 78, 81, 84],
            ['Waistband height', 3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8],
            ['Drawcord (exposed, per side)', 23, 23, 23, 23, 23, 23, 23],
          ]}
        />
      </Section>
    </PolicyPage>
  );
}
