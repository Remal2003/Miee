import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToBanners, DEFAULT_STORE_BANNERS } from '../firebase';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_STORE_BANNERS.heroImages);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const unsub = subscribeToBanners((banners) => {
      if (banners.heroImages && banners.heroImages.length > 0) {
        setHeroImages(banners.heroImages);
      }
    });
    return unsub;
  }, []);

  // Smooth automatic rotation if more than 1 image is configured
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const activeImage = heroImages[currentSlide % heroImages.length] || heroImages[0];

  return (
    <section className="relative min-h-[620px] md:min-h-[660px] grid grid-cols-1 lg:grid-cols-[45%_55%]">
      {/* Left Copy Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-cream px-8 py-14 md:px-16 md:py-20 lg:py-24 flex flex-col items-center justify-center text-center relative z-10"
      >
        {/* Official Brand Logo Signature - Grand Scale Centered (+10%) */}
        <div
          dir="ltr"
          className="inline-flex flex-col items-end select-none text-ink leading-none mb-10 sm:mb-12 group w-fit transition-transform hover:scale-[1.01]"
        >
          <span className="text-2xl sm:text-3xl md:text-[32px] lg:text-[40px] font-bold font-latin tracking-tight leading-none pr-2 sm:pr-2.5 text-ink/80">
            Closet
          </span>
          <span className="text-8xl sm:text-9xl md:text-[118px] lg:text-[142px] font-extrabold font-latin tracking-tighter leading-[0.88] -mt-1 sm:-mt-2 text-ink">
            Miee
          </span>
        </div>

        <div className="flex justify-center">
          <a
            href="#new"
            className="inline-flex items-center gap-6 text-[11px] sm:text-[12px] font-semibold text-ink border-b-2 border-ink pb-2 transition-all hover:text-orange hover:border-orange group"
          >
            <span>{t.discover}</span>
            <span className="font-latin text-base transition-transform group-hover:translate-x-1">
              ↙
            </span>
          </a>
        </div>
      </motion.div>

      {/* Right Visual Panel */}
      <div className="relative min-h-[440px] lg:min-h-full overflow-hidden bg-[#c9ad99]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(32,21,18,0.15), transparent), url('${activeImage}')`,
              backgroundPosition: 'center center'
            }}
          />
        </AnimatePresence>

        {/* Slide Indicators if more than 1 image */}
        {heroImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-neutral-900/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  (currentSlide % heroImages.length) === idx
                    ? 'w-6 bg-white shadow-xs'
                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Vertical Branding Word */}
        <span
          className="absolute top-10 right-8 text-white font-latin text-[10px] tracking-[0.35em] uppercase select-none opacity-90 hidden sm:block z-10"
          style={{ writingMode: 'vertical-rl' }}
        >
          M I E E / C L O S E T
        </span>

        {/* Round Stamp */}
        <div className="absolute left-[8%] bottom-[9%] w-[105px] h-[105px] border border-white/90 rounded-full flex flex-col items-center justify-center text-white text-center font-latin text-[11px] leading-[1.25] tracking-wider rotate-[-14deg] backdrop-blur-[2px] z-10">
          <span className="text-[10px] font-medium">MADE</span>
          <span className="text-[10px] font-medium">FOR</span>
          <span className="text-[10px] font-medium">YOU</span>
          <span className="absolute top-2.5 right-2.5 text-xs text-orange">✦</span>
        </div>

        {/* Image Caption */}
        <div className="absolute bottom-[7%] right-[8%] text-white font-latin text-[11px] tracking-wider select-none text-right z-10">
          <p className="opacity-90">less, but better</p>
          <b className="font-normal text-[9px] opacity-75">
            {String((currentSlide % heroImages.length) + 1).padStart(2, '0')} / {String(heroImages.length).padStart(2, '0')}
          </b>
        </div>
      </div>
    </section>
  );
};
