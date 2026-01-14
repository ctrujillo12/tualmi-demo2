import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function StoryPage() {
  return (
    <>
      {/* Black static header */}
      <HeaderStaticBlack />

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Our Story
        </h1>

        <div className="space-y-8 text-sm leading-relaxed">
          <p className="tracking-wide">
            Made in Los Angeles. Designed for women who move.
          </p>

          <p>
            Tualmi began on the trail. After years of hiking, backpacking, and spending time outdoors, 
            we noticed a pattern: women’s outdoor clothing was rarely designed with women in mind. 
            Boxy cuts, muted colors, and gear that felt more like a uniform than a choice.
          </p>

          <p>
            We believe the outdoors should be a place where women can show up fully as themselves—
            confident, capable, and expressive. Clothing should support the adventure, not limit it.
          </p>

          <p>
            That’s why we design functional outdoor apparel that feels considered, personal, and quietly confident.
            Pieces that perform on the trail and still reflect the individuality of the women who wear them.
          </p>

          <p>
            All of our garments are designed and manufactured in Los Angeles using sustainable materials 
            and responsible production practices. We believe local manufacturing and thoughtful sourcing 
            are essential to building a better future for both people and the planet.
          </p>

          <p>
            Tualmi exists to help more women get outside, because when the clothes truly fit, 
            the adventure doesn’t have to end early.
          </p>
        </div>

      </main>
    </>
  );
}
