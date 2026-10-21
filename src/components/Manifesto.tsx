import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Manifesto: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
      {/* Photo Column */}
      <div
        className="min-h-[400px] lg:min-h-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1300&q=85')"
        }}
      />

      {/* Copy Column */}
      <div className="bg-moss text-[#faf8f4] px-8 py-14 sm:px-14 sm:py-20 lg:py-24 flex flex-col justify-center">
        <p className="text-[10px] tracking-[0.1em] font-medium text-[#d3d8c9] uppercase mb-4">
          {t.manifestoEyebrow}
        </p>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight leading-[1.45] mb-6">
          {t.manifestoHeading}
        </h2>

        <p className="text-xs sm:text-[13px] leading-[2.1] text-[#e4e7df] max-w-[480px] mb-8">
          {t.manifestoText}
        </p>

        <div>
          <a
            href="#new"
            className="inline-flex items-center gap-4 text-[11px] font-semibold text-[#faf8f4] border-b border-[#faf8f4] pb-1.5 transition-colors hover:text-orange hover:border-orange group"
          >
            <span>{t.manifestoMore}</span>
            <span className="font-latin text-base transition-transform group-hover:translate-x-1">↙</span>
          </a>
        </div>

        {/* 3 Values list */}
        <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-7 mt-12 text-[10px] sm:text-[11px]">
          {t.values.map((val, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <b className="font-latin font-normal text-base text-[#d9dfcf]">
                0{idx + 1}
              </b>
              <span className="leading-snug">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
