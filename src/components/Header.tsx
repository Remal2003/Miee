import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Language } from '../types';

import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onOpenMenu: () => void;
  onOpenAdmin: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, onOpenAdmin, onOpenSearch }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { totalCount, openCart, showToast } = useCart();

  const handleSearchClick = () => {
    onOpenSearch();
  };

  const handleBagClick = () => {
    if (totalCount === 0) {
      showToast(t.bagEmpty);
    }
    openCart();
  };

  return (
    <header className="sticky top-0 z-30 h-[80px] md:h-[90px] bg-paper border-b border-ink/10 shadow-[0_6px_20px_rgba(18,18,18,0.025)] px-[5.2vw] flex items-center justify-between">
      {/* Mobile Menu Button & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMenu}
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 p-1 text-ink focus:outline-none"
          aria-label={t.menuHead}
        >
          <span className="block h-[1.5px] w-full bg-ink"></span>
          <span className="block h-[1.5px] w-full bg-ink"></span>
        </button>

        {/* Brand Logo */}
        <a
          href="#top"
          className="flex items-center justify-center py-1"
          aria-label="Miee Closet - Home"
        >
          <BrandLogo />
        </a>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-[13px] md:text-sm font-medium tracking-normal">
        <a href="#new" className="relative group py-1 text-ink transition-colors hover:text-orange">
          {t.nav.new}
          <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-ink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-200"></span>
        </a>
        <a href="#about" className="relative group py-1 text-ink transition-colors hover:text-orange">
          {t.nav.story}
          <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-ink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-200"></span>
        </a>
        <a href="#reviews" className="relative group py-1 text-ink transition-colors hover:text-orange">
          {t.nav.reviews}
          <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-ink transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-200"></span>
        </a>
      </nav>

      {/* Header Actions: Language Switcher, Search, Bag */}
      <div className="flex items-center gap-3.5 md:gap-5" style={{ direction: 'ltr' }}>
        {/* Language Switcher */}
        <div className="flex items-center gap-1 border border-ink/10 rounded-sm p-1 bg-paper/60 text-[10px] md:text-[11px] font-latin font-semibold">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 rounded-[2px] font-arabic transition-all ${
              language === 'ar' ? 'bg-ink text-paper shadow-sm' : 'text-neutral-500 hover:text-ink'
            }`}
          >
            ع
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-[2px] transition-all ${
              language === 'en' ? 'bg-ink text-paper shadow-sm' : 'text-neutral-500 hover:text-ink'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={`px-2 py-1 rounded-[2px] transition-all ${
              language === 'fr' ? 'bg-ink text-paper shadow-sm' : 'text-neutral-500 hover:text-ink'
            }`}
          >
            FR
          </button>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          className="p-1.5 text-ink hover:text-orange transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
        </button>

        {/* Admin Login / Dashboard Button (أمام السلة) */}
        <button
          onClick={onOpenAdmin}
          className="p-1.5 text-ink hover:text-orange transition-colors"
          title="تسجيل دخول الإدارة (Admin)"
          aria-label="Admin Portal"
        >
          <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Bag Button */}
        <button
          onClick={handleBagClick}
          className="relative p-1.5 text-ink hover:text-orange transition-colors group"
          aria-label="Shopping Bag"
        >
          <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
            <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange text-white text-[9px] font-latin font-bold rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            {totalCount}
          </span>
        </button>
      </div>
    </header>
  );
};
