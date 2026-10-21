import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { subscribeToProducts } from '../firebase';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { t, language, dir } = useLanguage();
  const { addToCart, showToast } = useCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to live products
  useEffect(() => {
    const unsub = subscribeToProducts((live) => {
      if (live && live.length > 0) {
        setProducts(live);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Autofocus input when modal opens & reset query
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
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

  const cleanQuery = query.trim().toLowerCase();

  // Search filtering
  const filteredProducts = cleanQuery
    ? products.filter((product) => {
        const arabicName = (product.name || '').toLowerCase();
        const translatedName = (t.productNames[product.id] || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const tag = (product.tag || '').toLowerCase();
        const colors = (product.colors || []).join(' ').toLowerCase();
        const sizes = (product.sizes || []).join(' ').toLowerCase();

        return (
          arabicName.includes(cleanQuery) ||
          translatedName.includes(cleanQuery) ||
          category.includes(cleanQuery) ||
          tag.includes(cleanQuery) ||
          colors.includes(cleanQuery) ||
          sizes.includes(cleanQuery)
        );
      })
    : [];

  const handleSelectProduct = (product: Product) => {
    onClose();
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      const target = document.getElementById('new');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.inStock === false) {
      showToast(
        language === 'ar'
          ? 'عذراً، هذا الموديل غير متوفر حالياً'
          : language === 'fr'
          ? 'Désolé, ce produit est épuisé'
          : 'Sorry, this item is out of stock'
      );
      return;
    }
    addToCart(product);
    const localizedName = t.productNames[product.id] || product.name;
    showToast(`${localizedName} — ${t.addedToast}`);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} دج`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 md:pt-16 px-3 sm:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#faf8f5] rounded-2xl shadow-2xl border border-ink/10 overflow-hidden flex flex-col max-h-[85vh] z-10"
            dir={dir}
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-ink/10 bg-paper/95 backdrop-blur flex items-center gap-3">
              {/* Search Icon */}
              <div className="text-ink/60 shrink-0">
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.5 16.5 4.5 4.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search?.placeholder || 'ابحثي عن عباية، طقم، فستان، لون...'}
                className="w-full bg-transparent text-ink placeholder:text-neutral-400 text-base sm:text-lg focus:outline-none font-medium"
              />

              {/* Clear Query Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-neutral-400 hover:text-ink hover:bg-ink/5 transition-colors text-sm shrink-0"
                  title="مسح"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* ESC badge (Desktop) & Close Button */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-block text-[10px] text-neutral-400 bg-ink/5 border border-ink/10 px-2 py-0.5 rounded font-latin">
                  ESC
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
                  aria-label="إغلاق"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results / Content Area */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 min-h-[220px]">
              {/* State 1: No query entered yet -> show popular search suggestions */}
              {!cleanQuery ? (
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-3">
                    {t.search?.quickSuggestions || 'أكثر ما تبحث عنه عميلاتنا:'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(t.search?.suggestions || ['عباية نُور', 'طقم سَما', 'فستان لِين', 'أسود', 'بيج']).map(
                      (item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="px-3.5 py-1.5 text-xs sm:text-sm bg-white hover:bg-ink hover:text-white border border-ink/10 rounded-full text-ink/80 transition-all shadow-xs flex items-center gap-1.5 group cursor-pointer"
                        >
                          <svg
                            className="w-3 h-3 text-neutral-400 group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="11" cy="11" r="7" strokeWidth="2" />
                            <path d="m16.5 16.5 4 4" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>{item}</span>
                        </button>
                      )
                    )}
                  </div>

                  {/* Featured Quick Items */}
                  <div className="pt-4 border-t border-ink/10">
                    <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-3">
                      {language === 'ar' ? 'تشكيلة Miee المميزة:' : language === 'fr' ? 'Sélection Miee :' : 'Miee Highlights:'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {products.slice(0, 4).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          className="group cursor-pointer bg-white rounded-xl p-2.5 border border-ink/5 hover:border-ink/20 hover:shadow-md transition-all flex flex-col"
                        >
                          <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-neutral-100 mb-2 relative">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            {prod.inStock === false && (
                              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[10px] bg-white text-ink font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                  {t.search?.outOfStock || 'نفدت الكمية'}
                                </span>
                              </div>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-medium text-ink truncate">
                            {t.productNames[prod.id] || prod.name}
                          </h4>
                          <span className="text-[11px] text-orange font-semibold font-latin mt-0.5">
                            {formatPrice(prod.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                /* State 2: Query entered and has matching items */
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink/10">
                    <span className="text-xs sm:text-sm text-neutral-500 font-medium">
                      {filteredProducts.length} {t.search?.resultsCount || 'قطعة متطابقة'}
                    </span>
                    <span className="text-[11px] text-orange font-semibold">
                      {language === 'ar' ? `نتائج البحث عن "${cleanQuery}"` : `Results for "${cleanQuery}"`}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const isOutOfStock = product.inStock === false;
                      const localizedTitle = t.productNames[product.id] || product.name;

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className={`group cursor-pointer bg-white rounded-xl p-3 border border-ink/10 hover:border-orange/40 hover:shadow-md transition-all flex items-center gap-3.5 sm:gap-4 relative overflow-hidden ${
                            isOutOfStock ? 'opacity-85' : ''
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-neutral-100 shrink-0 relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                                <span className="text-[9px] text-white font-medium text-center leading-tight">
                                  {t.search?.outOfStock || 'نفدت'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm sm:text-base font-semibold text-ink truncate group-hover:text-orange transition-colors">
                                {localizedTitle}
                              </h3>
                              {product.tag && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange/10 text-orange font-medium shrink-0">
                                  {product.tag}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-semibold text-orange font-latin mb-2">
                              {formatPrice(product.price)}
                            </p>

                            {/* Sizes & Colors Preview */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                              {product.sizes && product.sizes.length > 0 && (
                                <span className="inline-flex items-center gap-1 bg-ink/5 px-2 py-0.5 rounded font-latin">
                                  {product.sizes.join(' · ')}
                                </span>
                              )}
                              {product.colors && product.colors.length > 0 && (
                                <span className="inline-flex items-center gap-1 bg-ink/5 px-2 py-0.5 rounded text-[10px]">
                                  {product.colors.slice(0, 2).join('، ')}
                                  {product.colors.length > 2 && ' +'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stock Status & Action Button */}
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            {isOutOfStock ? (
                              <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full font-medium">
                                {t.search?.outOfStock || 'نفدت الكمية'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                                {t.search?.inStock || 'متوفر'}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, product)}
                              disabled={isOutOfStock}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                                isOutOfStock
                                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                  : 'bg-ink text-paper hover:bg-orange shadow-xs active:scale-95'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="hidden sm:inline">{t.search?.addToBag || 'إضافة'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* State 3: Query entered but no products found */
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center text-neutral-400 mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                      <path d="m16.5 16.5 4.5 4.5" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-ink mb-1">
                    {t.search?.noResults || 'لم نجد أي قطعة تطابق بحثكِ'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-5 leading-relaxed">
                    {t.search?.noResultsHint || 'جرّبي البحث بكلمات أخرى مثل اسم الموديل، اللون، أو المقاس.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      const target = document.getElementById('new');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-5 py-2.5 bg-ink text-paper rounded-full text-xs sm:text-sm font-medium hover:bg-orange transition-colors"
                  >
                    {t.search?.viewAllProducts || 'تصفح التشكيلة بالكامل'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
