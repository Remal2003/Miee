import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface SuccessModalProps {
  isOpen: boolean;
  orderId?: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, orderId, onClose }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="relative z-10 bg-[#f4f1eb] w-[min(480px,94vw)] text-center p-8 sm:p-12 shadow-2xl border border-ink/10"
          >
            {/* Concentric Orbit Rings & Checkmark */}
            <div className="relative w-[134px] h-[134px] mx-auto mb-6 flex items-center justify-center animate-orbit-float">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border border-moss/25" />
              {/* Middle Ring */}
              <div className="absolute inset-3 rounded-full border border-moss/40" />
              {/* Inner Orbit Circle */}
              <div className="absolute inset-6 rounded-full border border-moss flex items-center justify-center">
                <span className="w-9 h-9 rounded-full bg-moss text-white flex items-center justify-center text-lg font-bold shadow-sm">
                  ✓
                </span>
              </div>
            </div>

            <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-500 uppercase mb-2">
              {t.cart.successEyebrow}
            </p>

            <h2
              className="text-2xl sm:text-3xl font-medium tracking-tight text-ink leading-tight mb-3"
              dangerouslySetInnerHTML={{ __html: t.cart.successHeading }}
            />

            {orderId && (
              <span className="inline-block bg-cream text-ink text-[10px] font-latin font-bold px-3 py-1 rounded-sm tracking-wider mb-4 border border-ink/10">
                #{orderId}
              </span>
            )}

            <p className="text-xs text-neutral-600 leading-relaxed max-w-[320px] mx-auto mb-8">
              {t.cart.successDesc}
            </p>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-4 px-6 py-3 border border-ink text-[11px] font-semibold text-ink bg-transparent hover:bg-ink hover:text-white transition-colors group"
            >
              <span>{t.cart.successAction}</span>
              <span className="font-latin text-base transition-transform group-hover:translate-x-1">↙</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
