import { PolicyPage, Section, P, DataTable } from '@/components/PolicyPage';

export default function SizeFitPage() {
  return (
    <PolicyPage title="size + fit">
      <Section>
        <P>For any sizing questions, please email us at hello@tualmi.com</P>
        <P>All measurements are in inches.</P>
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
        <P>Frolic Fleece — Runs true to size with minimal coverage.</P>
        <P>Juniper Pant — Designed for a more relaxed fit. Size down for a tighter feel.</P>
        <P>Sierra Shorts — Adjustable ties allow for a flexible fit across sizes.</P>
      </Section>

      <Section heading="sierra shorts — garment measurements">
        <P>All measurements taken flat on the garment, in inches.</P>
        <DataTable
          headers={['point of measure', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl']}
          rows={[
            ['Waist (relaxed)', '24.5"', '26.5"', '28.25"', '30.25"', '32.25"', '34.25"', '36.25"'],
            ['Hip', '39.5"', '41.5"', '43.5"', '45.5"', '47.5"', '49.5"', '51.5"'],
            ['Thigh', '26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'],
            ['Length', '10.25"', '10.75"', '11"', '11.5"', '11.75"', '12.25"', '12.5"'],
            ['Front rise (excl. waistband)', '8.5"', '9"', '9.5"', '10"', '10.5"', '10.75"', '11.25"'],
            ['Back rise (excl. waistband)', '12"', '12.5"', '13"', '13.5"', '14"', '14.5"', '15"'],
            ['Leg opening', '26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'],
            ['Waistband height', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"'],
            ['Drawcord (exposed, per side)', '9"', '9"', '9"', '9"', '9"', '9"', '9"'],
          ]}
        />
      </Section>
    </PolicyPage>
  );
}
