import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { t, language, dir } = useLanguage();
  const { addToCart, openCart, showToast } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Collect main image and all additional images added by admin
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image && typeof product.image === 'string' && product.image.trim()) {
      list.push(product.image.trim());
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list.length > 0 ? list : (product.image ? [product.image] : []);
  }, [product]);

  // Reset local state when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      setSelectedImageIndex(0);
      setSelectedSize(product.sizes?.[0] || 'M');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setShowSizeGuide(false);
      setIsAdding(false);
    }
  }, [product, isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSizeGuide) {
          setShowSizeGuide(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSizeGuide, onClose]);

  if (!product) return null;

  const isOutOfStock = product.inStock === false;
  const localizedTitle = t.productNames[product.id] || product.name;
  const currentImage = allImages[selectedImageIndex] || product.image;

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleAdd = () => {
    if (isOutOfStock) {
      showToast(t.productModal.outOfStockNotice);
      return;
    }

    setIsAdding(true);
    addToCart(product, selectedColor, selectedSize, quantity);
    showToast(
      language === 'ar'
        ? `تمت إضافة ${localizedTitle} (مقاس ${selectedSize}، لون ${selectedColor}) إلى السلة ✨`
        : language === 'fr'
        ? `${localizedTitle} (${selectedSize}, ${selectedColor}) ajouté au panier !`
        : `${localizedTitle} (${selectedSize}, ${selectedColor}) added to bag!`
    );

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleQuickOrder = () => {
    if (isOutOfStock) {
      showToast(t.productModal.outOfStockNotice);
      return;
    }
    addToCart(product, selectedColor, selectedSize, quantity);
    onClose();
    openCart();
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} دج`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#faf8f5] rounded-2xl shadow-2xl border border-ink/10 overflow-hidden z-50 my-auto max-h-[92vh] flex flex-col"
              dir={dir}
            >
              {/* Top Accent Line */}
              <div className="h-1 w-full bg-gradient-to-r from-orange via-ink to-orange" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-ink hover:text-white text-ink shadow-md flex items-center justify-center transition-all border border-ink/10"
                aria-label={t.productModal.close}
                title={t.productModal.close}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Body: Two Columns on md+ */}
              <div className="overflow-y-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* COLUMN 1: IMAGE GALLERY */}
                <div className="flex flex-col gap-3">
                  {/* Main Hero Image */}
                  <div
                    className="group relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-neutral-200 cursor-default select-none border border-ink/10 shadow-sm"
                  >
                    <img
                      src={currentImage}
                      alt={localizedTitle}
                      className="w-full h-full object-cover object-center pointer-events-none select-none transition-all duration-300"
                    />

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-3 select-none pointer-events-none">
                        <span className="bg-ink/95 text-white text-xs sm:text-sm font-bold px-4 py-2 uppercase tracking-wider border border-white/20 shadow-lg rounded">
                          {t.productModal.outOfStock}
                        </span>
                      </div>
                    )}

                    {/* Tag Badge */}
                    {product.tag && (
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none ${
                          product.tagStyle === 'promo' || product.tag?.toUpperCase() === 'PROMO'
                            ? 'bg-rose-700 text-white font-latin shadow-rose-900/30'
                            : product.tagStyle === 'soft'
                            ? 'bg-[#f2ede5] text-ink'
                            : 'bg-orange text-white'
                        }`}
                      >
                        {product.tag}
                      </span>
                    )}

                    {/* Image Counter Badge */}
                    {allImages.length > 1 && (
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-latin px-2.5 py-1 rounded-full backdrop-blur-xs font-medium z-10 pointer-events-none">
                        {selectedImageIndex + 1} / {allImages.length}
                      </div>
                    )}

                    {/* Navigation Arrows if multiple images */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-ink text-ink hover:text-white shadow-md flex items-center justify-center transition-all z-20 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextImage}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-ink text-ink hover:text-white shadow-md flex items-center justify-center transition-all z-20 cursor-pointer"
                          aria-label="Next image"
                        >
                          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Pagination Dots Indicator */}
                        <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-1.5 z-10 pointer-events-none">
                          {allImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === selectedImageIndex
                                  ? 'w-5 bg-white shadow-sm'
                                  : 'w-1.5 bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Additional Images Thumbnails Strip */}
                  {allImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                      {allImages.map((img, idx) => {
                        const isSelected = idx === selectedImageIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(idx);
                            }}
                            className={`relative aspect-[3/4] w-14 sm:w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'border-orange ring-2 ring-orange/30 scale-102'
                                : 'border-ink/10 opacity-70 hover:opacity-100'
                            }`}
                            aria-label={`Image ${idx + 1}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover pointer-events-none select-none" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COLUMN 2: PRODUCT INFO & OPTIONS */}
                <div className="flex flex-col justify-between h-full">
                  <div>
                    {/* Availability Status */}
                    <div className="flex items-center justify-start mb-2">
                      {isOutOfStock ? (
                        <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-200/80 px-2.5 py-0.5 rounded-full">
                          {t.productModal.outOfStock}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {t.productModal.inStock}
                        </span>
                      )}
                    </div>

                    {/* Product Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-ink tracking-tight mb-2">
                      {localizedTitle}
                    </h2>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-ink/10">
                      <span className="text-2xl sm:text-3xl font-bold text-orange font-latin">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {/* SIZE SELECTOR */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs sm:text-sm font-semibold text-ink">
                          {t.productModal.selectSize}{' '}
                          <span className="text-orange font-bold font-latin">{selectedSize}</span>
                        </label>

                        {/* Size Guide Trigger */}
                        <button
                          type="button"
                          onClick={() => setShowSizeGuide(!showSizeGuide)}
                          className="text-[11px] text-ink/70 hover:text-orange underline underline-offset-2 flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{t.productModal.sizeGuide}</span>
                        </button>
                      </div>

                      {/* Sizes Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {(product.sizes || ['S', 'M', 'L', 'XL']).map((sz) => {
                          const isSelected = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSize(sz)}
                              className={`min-w-[48px] h-10 px-3.5 rounded-lg text-xs sm:text-sm font-latin font-bold transition-all flex items-center justify-center cursor-pointer ${
                                isSelected
                                  ? 'bg-ink text-white shadow-md ring-2 ring-ink ring-offset-2 scale-105'
                                  : 'bg-white text-ink border border-ink/15 hover:border-ink/50'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>

                      {/* Expandable Size Guide Table */}
                      <AnimatePresence>
                        {showSizeGuide && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-white rounded-xl border border-ink/10 overflow-hidden text-[11px]"
                          >
                            <h4 className="font-semibold text-ink mb-1.5">{t.productModal.sizeGuideTitle}</h4>
                            <div className="grid grid-cols-4 gap-1 text-center border-b border-ink/10 pb-1 font-bold text-neutral-500">
                              <span>المقاس</span>
                              <span>الصدر</span>
                              <span>الخصر</span>
                              <span>الطول</span>
                            </div>
                            <div className="divide-y divide-ink/5 pt-1">
                              <div className="grid grid-cols-4 gap-1 text-center py-1 font-latin text-neutral-700">
                                <span className="font-bold">S</span>
                                <span>90-94</span>
                                <span>70-74</span>
                                <span>140</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 text-center py-1 font-latin text-neutral-700">
                                <span className="font-bold">M</span>
                                <span>96-100</span>
                                <span>76-80</span>
                                <span>142</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 text-center py-1 font-latin text-neutral-700">
                                <span className="font-bold">L</span>
                                <span>102-106</span>
                                <span>82-86</span>
                                <span>144</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 text-center py-1 font-latin text-neutral-700">
                                <span className="font-bold">XL</span>
                                <span>108-114</span>
                                <span>88-94</span>
                                <span>145</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* COLOR SELECTOR */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-5">
                        <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
                          {t.productModal.selectColor}{' '}
                          <span className="text-orange font-medium">{selectedColor}</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((col) => {
                            const isSelected = selectedColor === col;
                            return (
                              <button
                                key={col}
                                type="button"
                                onClick={() => setSelectedColor(col)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-ink text-white shadow-sm ring-1 ring-ink'
                                    : 'bg-white text-ink border border-ink/15 hover:border-ink/50'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isSelected ? 'bg-orange' : 'bg-neutral-400'
                                  }`}
                                />
                                <span>{col}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* QUANTITY SELECTOR */}
                    <div className="mb-6 flex items-center gap-4">
                      <span className="text-xs sm:text-sm font-semibold text-ink">
                        {t.productModal.quantity}
                      </span>
                      <div className="flex items-center border border-ink/20 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          disabled={quantity <= 1 || isOutOfStock}
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-9 h-9 flex items-center justify-center text-ink hover:bg-ink/5 disabled:opacity-40 transition-colors text-base font-latin"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-ink text-sm font-latin">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= 10 || isOutOfStock}
                          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                          className="w-9 h-9 flex items-center justify-center text-ink hover:bg-ink/5 disabled:opacity-40 transition-colors text-base font-latin"
                        >
                          +
                        </button>
                      </div>

                      {quantity > 1 && (
                        <span className="text-xs font-semibold text-orange font-latin">
                          {formatPrice(product.price * quantity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="pt-4 border-t border-ink/10 space-y-2.5">
                    {isOutOfStock ? (
                      <div className="w-full py-3.5 px-4 bg-neutral-200 text-neutral-500 rounded-xl font-medium text-center text-xs sm:text-sm border border-neutral-300">
                        {t.productModal.outOfStockNotice}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Add to Bag */}
                        <button
                          type="button"
                          onClick={handleAdd}
                          className="w-full py-3.5 px-5 bg-ink text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
                            <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{isAdding ? '✓ تمت الإضافة!' : t.productModal.addToBag}</span>
                        </button>

                        {/* Order Now Direct */}
                        <button
                          type="button"
                          onClick={handleQuickOrder}
                          className="w-full py-3.5 px-5 bg-orange text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#d86638] active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <span>{t.productModal.orderNow}</span>
                          <span className="font-latin text-sm">✦</span>
                        </button>
                      </div>
                    )}

                    {/* Guarantees Badges */}
                    <div className="pt-3 grid grid-cols-2 gap-2 text-center text-[10px] sm:text-[11px] text-neutral-500 border-t border-ink/5">
                      <div className="flex flex-col items-center gap-1 p-1">
                        <span className="text-orange text-xs font-bold">🚚</span>
                        <span>58 ولاية</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 p-1">
                        <span className="text-orange text-xs font-bold">💵</span>
                        <span>دفع عند الاستلام</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };
