import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        showToast('');
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, showToast]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-50 bg-ink text-white px-6 py-3.5 text-[11px] font-medium shadow-[0_8px_25px_rgba(0,0,0,0.2)] tracking-wide rounded-xs select-none pointer-events-none"
        >
          {toastMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
