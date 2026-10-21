import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const GuaranteeSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <section className="bg-[#ede8df] py-18 sm:py-24 md:py-28 px-[5.2vw] border-y border-ink/10">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Heraldic Shield Badge with Brand Ink and Terracotta Accent */}
        <div className="relative flex items-center justify-center mb-6">
          <svg
            width="66"
            height="76"
            viewBox="0 0 66 76"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            {/* Shield Outline & Fill using Miee Deep Obsidian Ink */}
            <path
              d="M33 2L60 14V38C60 55.5 48 68.5 33 74C18 68.5 6 55.5 6 38V14L33 2Z"
              fill="#121212"
            />
            {/* Dotted Inner Ring with subtle Terracotta Orange */}
            <circle
              cx="33"
              cy="37"
              r="22.5"
              stroke="#e87546"
              strokeOpacity="0.8"
              strokeWidth="1.3"
              strokeDasharray="2.5 2.5"
            />
            {/* Badge Number */}
            <text
              x="33"
              y="38"
              textAnchor="middle"
              fill="#f5f2ed"
              fontSize="17"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {t.guarantee.badgeDays}
            </text>
            {/* Badge Unit Text */}
            <text
              x="33"
              y="50"
              textAnchor="middle"
              fill="#f5f2ed"
              fillOpacity="0.9"
              fontSize="6.5"
              fontWeight="600"
              letterSpacing="0.05em"
              fontFamily={isRtl ? 'Noto Kufi Arabic, sans-serif' : 'DM Sans, sans-serif'}
            >
              {t.guarantee.badgeUnit}
            </text>
          </svg>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink mb-4 max-w-xl">
          {t.guarantee.title}
        </h2>

        {/* Description Body Text */}
        <p className="text-xs sm:text-[13px] md:text-sm text-[#423d38] leading-[2.1] max-w-2xl font-normal">
          {t.guarantee.desc}
        </p>
      </div>
    </section>
  );
};
