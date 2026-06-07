

export default function SizeFitPage() {
  return (
    <>


      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Size + Fit
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">

          {/* Intro */}
          <div className="space-y-4">
            <p>
              For any sizing questions, please email us at tualmioutdoors@gmail.com
            </p>
            <p>All measurements are taken in centimetres (cm).</p>
          </div>

          {/* General Size Guide */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              General Size Guide
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-sand-300">
                    <th className="py-2 font-normal">Size</th>
                    <th className="py-2 font-normal">Bust</th>
                    <th className="py-2 font-normal">Waist</th>
                    <th className="py-2 font-normal">Hips</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr>
                    <td className="py-2">XS</td>
                    <td>32–34" A–B</td>
                    <td>23–25"</td>
                    <td>32–34"</td>
                  </tr>
                  <tr>
                    <td className="py-2">S</td>
                    <td>34–36" B–C</td>
                    <td>25–27"</td>
                    <td>34–36"</td>
                  </tr>
                  <tr>
                    <td className="py-2">M</td>
                    <td>36–38" C–D</td>
                    <td>27–29"</td>
                    <td>36–38"</td>
                  </tr>
                  <tr>
                    <td className="py-2">L</td>
                    <td>38–40" D–DD</td>
                    <td>29–31"</td>
                    <td>38–40"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Product-Specific Fit */}
          <div className="space-y-4">
            <h2 className="uppercase tracking-widest text-xs">
              Product Fit Notes
            </h2>

            <p>
              Fit may vary slightly depending on the style. Below is guidance for select pieces.
            </p>

            <div className="space-y-3">
              {/* Replace these with your actual 4 products */}
              <p><span className="tracking-wide">Trailblazer Fleece</span> — Runs true to size with minimal coverage.</p>
              <p><span className="tracking-wide">Summit Pants</span> — Designed for a more relaxed fit. Size down for a tighter feel.</p>
              <p><span className="tracking-wide">Horizon Shorts</span> — Adjustable ties allow for a flexible fit across sizes.</p>
              {/* <p><span className="tracking-wide">Product 4</span> — Offers moderate coverage with a supportive structure.</p> */}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}