import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  const socialLabels = {
    ar: ['إنستغرام', 'تيك توك'],
    en: ['Instagram', 'TikTok'],
    fr: ['Instagram', 'TikTok']
  };

  const socials = socialLabels[language] || socialLabels.ar;

  return (
    <footer className="bg-ink text-[#f5f2ed] py-10 sm:py-12 px-[5.2vw] flex flex-col md:flex-row items-center justify-between gap-6 min-h-[125px] sm:min-h-[135px]">
      {/* Brand */}
      <a href="#top" className="font-latin text-3xl sm:text-[34px] font-semibold tracking-tight hover:opacity-90 transition-opacity">
        Miee<sup className="text-[10px] sm:text-xs font-normal tracking-normal ml-0.5">®</sup>
      </a>

      {/* Social Links */}
      <div className="flex items-center gap-7 sm:gap-9 text-[11px] sm:text-xs tracking-wider font-medium">
        <a
          href="https://www.instagram.com/miee_.closet?obrf=dWl0a2QzdngxeGlo"
          target="_blank"
          rel="noreferrer"
          className="hover:text-orange transition-colors"
        >
          {socials[0]}
        </a>
        <a
          href="https://www.tiktok.com/@miee.closet?_r=1&_t=ZS-9AdR3xTefaw"
          target="_blank"
          rel="noreferrer"
          className="hover:text-orange transition-colors"
        >
          {socials[1]}
        </a>
      </div>

      {/* Copyright */}
      <span className="text-[10px] sm:text-[11px] text-neutral-400 font-normal tracking-wide">
        {t.footerRights}
      </span>
    </footer>
  );
};
