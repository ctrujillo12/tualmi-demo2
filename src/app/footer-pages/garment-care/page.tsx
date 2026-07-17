

export default function GarmentCarePage() {
  return (
    <>


      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Garment Care
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Intro */}
          <div className="space-y-4">
            <p>
              Our pieces are thoughtfully made using quality fabrics designed to move with you — from trail to everyday wear.
            </p>
            <p>
              The way you wash, dry, and store your garments plays a key role in maintaining their performance, shape, and longevity.
            </p>
            <p>
              Follow the care guidelines below to keep your pieces looking and feeling their best.
            </p>
          </div>

          {/* Washing */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              Washing
            </h2>

            <p>
              Wash in cold water with like colors using a mild detergent. This helps preserve fabric integrity and color.
            </p>

            <p>
              Turn garments inside out before washing to reduce surface wear.
            </p>

            <p>
              Avoid bleach, fabric softeners, and harsh chemicals, as they can damage technical fabrics and reduce performance.
            </p>
          </div>

          {/* Drying */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              Drying
            </h2>

            <p>
              Air dry in the shade whenever possible. Heat and direct sunlight can weaken fibers and cause fading over time.
            </p>

            <p>
              Avoid tumble drying unless specifically stated on the garment label.
            </p>
          </div>

          {/* Fleece Care */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              Fleece Care
            </h2>

            <p>
              To maintain softness and structure, wash fleece garments in cold water on a gentle cycle.
            </p>

            <p>
              Avoid fabric softeners, as they can coat fibers and reduce breathability.
            </p>

            <p>
              Air dry flat to help retain shape and prevent pilling.
            </p>
          </div>

          {/* Storage */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              Storage
            </h2>

            <p>
              Store garments folded in a cool, dry place. Avoid hanging heavier items for long periods, as this may stretch the fabric.
            </p>

            <p>
              Ensure items are fully dry before storing to prevent moisture buildup.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}