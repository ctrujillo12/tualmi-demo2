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
          <p>
            Made in LA, Designed for Adventure
          </p>

          <p>
            
            We manufacture all our pieces in Los Angeles using sustainable materials. 
            Our goal is to create outdoor wear that empowers women to embrace every adventure with 
            confidence and style—no compromises.
          </p>

          <p>
            We believe clothing should feel considered, personal, and quietly
            confident.
          </p>
        </div>
      </main>
    </>
  );
}
