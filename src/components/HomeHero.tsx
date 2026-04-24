'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const heroImages = [
  '/images-2/hero_anna.JPG',
  '/images-2/hero1vsco.jpeg',
  '/images-2/hero0vsco.jpeg',
];

export default function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          /* Full screen on desktop, shorter on mobile so image isn't cropped */
          height: 100svh;
        }
        @media (max-width: 640px) {
          .hero-section {
            height: 60svh;
          }
        }
      `}</style>

      <section className="hero-section">
        {heroImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Hero"
            fill
            className={`object-cover transition-opacity duration-1000 ${
              i === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            // Focus on center-top so faces/subjects aren't cropped on mobile
            style={{ objectPosition: 'center 20%' }}
            priority={i === 0}
            sizes="100vw"
          />
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
}