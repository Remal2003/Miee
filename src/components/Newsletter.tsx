import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Newsletter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-[#d2c5b8] py-16 md:py-20 px-[5.2vw] lg:px-[12vw]">
      <div>
        <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-600 uppercase mb-3">
          {t.newsletterEyebrow}
        </p>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.25] text-ink"
          dangerouslySetInnerHTML={{ __html: t.newsletterHeading }}
        />
      </div>
    </section>
  );
};

