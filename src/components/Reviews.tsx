import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Reviews: React.FC = () => {
  const { t, language } = useLanguage();

  const reviewers = [
    { name: 'ياسمين. ل', city: 'عنابة', nameEn: 'Yasmine L.', cityEn: 'Annaba', nameFr: 'Yasmine L.', cityFr: 'Annaba' },
    { name: 'صبرينة. ز', city: 'سطيف', nameEn: 'Sabrina Z.', cityEn: 'Sétif', nameFr: 'Sabrina Z.', cityFr: 'Sétif' },
    { name: 'لينا. ك', city: 'ورقلة', nameEn: 'Lina K.', cityEn: 'Ouargla', nameFr: 'Lina K.', cityFr: 'Ouargla' }
  ];

  const getReviewer = (rev: typeof reviewers[0]) => {
    if (language === 'en') return { name: rev.nameEn, city: rev.cityEn };
    if (language === 'fr') return { name: rev.nameFr, city: rev.cityFr };
    return { name: rev.name, city: rev.city };
  };

  return (
    <section id="reviews" className="py-24 md:py-28 px-[5.2vw] bg-paper">
      <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-500 uppercase mb-3">
        {t.reviewsEyebrow}
      </p>

      <h2
        className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.25] text-ink mb-12"
        dangerouslySetInnerHTML={{ __html: t.reviewsHeading }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {t.reviews.map((quote, idx) => {
          const rev = reviewers[idx] || reviewers[0];
          const person = getReviewer(rev);
          return (
            <article
              key={idx}
              className="bg-white p-8 md:p-9 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-ink/5"
            >
              <div>
                <div className="text-orange text-xs font-latin tracking-widest mb-5">
                  ★★★★★
                </div>
                <p className="text-xs sm:text-[13px] leading-[2.1] text-[#302d2a] mb-8">
                  {quote}
                </p>
              </div>

              <footer className="pt-4 border-t border-ink/10 flex items-center justify-between text-[11px] gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <b className="font-semibold text-ink">{person.name}</b>
                  <span className="text-neutral-400 font-normal">·</span>
                  <span className="text-neutral-500 font-normal">{person.city}</span>
                </div>
                <span className="text-neutral-500 text-[10px] shrink-0">{t.verified}</span>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
};
