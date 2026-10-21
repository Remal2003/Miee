import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onOpenSearch }) => {
  const { t, dir } = useLanguage();

  const isRtl = dir === 'rtl';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
          />

          {/* Drawer Menu */}
          <motion.aside
            initial={{ x: isRtl ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={`fixed top-0 bottom-0 ${
              isRtl ? 'right-0' : 'left-0'
            } w-[min(420px,88vw)] bg-[#f9f7f2] z-50 p-8 md:p-11 flex flex-col shadow-2xl`}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-8 border-b border-ink/10">
              <span className="text-[11px] font-semibold tracking-wider text-ink/70 uppercase">
                {t.menuHead}
              </span>
              <button
                onClick={onClose}
                className="text-2xl font-light text-ink hover:text-orange transition-colors w-8 h-8 flex items-center justify-center"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* Quick Search Shortcut */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="mt-6 flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-ink/10 text-neutral-400 hover:text-ink hover:border-ink/30 transition-all text-sm shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 stroke-current fill-none text-neutral-500" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16.5 16.5 4.5 4.5" strokeLinecap="round" />
                  </svg>
                  <span>{t.search?.title || 'البحث في المتجر...'}</span>
                </div>
                <span className="text-[10px] bg-ink/5 px-2 py-0.5 rounded text-neutral-400 font-latin">
                  ✦
                </span>
              </button>
            )}

            {/* Menu Links */}
            <nav className="flex flex-col mt-4 divide-y divide-ink/10">
              {[
                { label: t.menuLinks[0] || t.nav.new, href: '#new' },
                { label: t.menuLinks[2] || t.nav.story, href: '#about' },
                { label: t.menuLinks[3] || t.nav.reviews, href: '#reviews' }
              ].map((item, idx) => {
                const number = `0${idx + 1}`;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className="py-5 text-xl font-medium text-ink flex items-center justify-between group transition-colors hover:text-orange"
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] font-latin font-normal text-neutral-400 group-hover:text-orange transition-colors">
                      {number}
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Bottom Editorial Note */}
            <div className="mt-auto pt-8 border-t border-ink/10">
              <p
                className="text-lg md:text-xl text-ink/80 leading-relaxed font-normal"
                dangerouslySetInnerHTML={{ __html: t.menuNote }}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
