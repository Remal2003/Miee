import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { subscribeToProducts } from '../firebase';
import { Product } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductsProps {
  onOpenProduct?: (product: Product) => void;
}

export const Products: React.FC<ProductsProps> = ({ onOpenProduct }) => {
  const { t, language } = useLanguage();
  const { addToCart, showToast } = useCart();
  const [activeFilter, setActiveFilter] = useState<'all'>('all');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenProduct = (prod: Product) => {
    if (onOpenProduct) {
      onOpenProduct(prod);
    } else {
      setSelectedProduct(prod);
      setIsDetailOpen(true);
    }
  };

  useEffect(() => {
    const unsub = subscribeToProducts((live) => {
      if (live && live.length > 0) {
        setProductsList(live);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const filterTabs = [
    { key: 'all' as const, label: t.filters.all }
  ];

  const filteredProducts = productsList;

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (product: Product) => {
    if (product.inStock === false) {
      showToast(
        language === 'ar'
          ? 'عذراً، هذا المنتج غير متوفر حالياً'
          : language === 'fr'
          ? 'Désolé, ce produit est en rupture de stock'
          : 'Sorry, this product is currently out of stock'
      );
      return;
    }
    addToCart(product);
    const translatedName = t.productNames[product.id] || product.name;
    showToast(`${translatedName} — ${t.addedToast}`);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} دج`;
  };

  return (
    <section id="new" className="py-16 sm:py-24 md:py-28 px-[3.5vw] sm:px-[5.2vw] bg-[#ede8df]">
      {/* Head */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-11">
        <div>
          <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-500 uppercase mb-2 sm:mb-3">
            {t.freshEyebrow}
          </p>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.25] text-ink"
            dangerouslySetInnerHTML={{ __html: t.productsHeading }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveFilter(tab.key);
                showToast(`${t.filterShowing} ${tab.label}`);
              }}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] font-medium transition-all whitespace-nowrap border bg-ink text-white border-ink shadow-xs"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-neutral-300/80 rounded-2xl bg-neutral-50/50 p-8">
          <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-ink/40 mb-3 text-2xl">
            ✨
          </div>
          <h3 className="text-sm font-semibold text-ink font-arabic mb-1">
            {language === 'ar' ? 'الكتالوج بانتظار إضافة قطع جديدة' : 'Catalog awaiting new pieces'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm font-arabic">
            {language === 'ar'
              ? 'تتم إضافة أحدث التصاميم والقطع تدريجياً عبر لوحة الإدارة.'
              : 'New designs and pieces will be published shortly via the admin portal.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
        {filteredProducts.map(product => {
          const isLiked = !!likedMap[product.id];
          const name = t.productNames[product.id] || product.name;
          const shade = t.productShades[product.id] || product.colors[0];
          const isOutOfStock = product.inStock === false;

          return (
            <article
              key={product.id}
              className="group relative flex flex-col justify-between"
            >
              {/* Image Container with 3:4 aspect ratio for elegant mobile scaling */}
              <div
                onClick={() => handleOpenProduct(product)}
                className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
                    isOutOfStock ? 'grayscale-[35%] opacity-85' : ''
                  }`}
                />

                {/* Multiple Images Badge Indicator */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-latin">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" strokeWidth="2" />
                    </svg>
                    <span>{product.images.length}</span>
                  </div>
                )}

                {/* Out of Stock Overlay Badge */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-2 z-10 select-none">
                    <span className="bg-ink/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 uppercase tracking-wider border border-white/20 shadow-md">
                      {language === 'ar'
                        ? 'نفدت الكمية'
                        : language === 'fr'
                        ? 'Épuisé'
                        : 'Out of Stock'}
                    </span>
                  </div>
                )}

                {/* Heart Button */}
                <button
                  onClick={e => toggleHeart(product.id, e)}
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-xs sm:text-lg transition-transform active:scale-90 shadow-xs"
                  aria-label="Add to favorites"
                >
                  <span className={isLiked ? 'text-[#d9534f]' : 'text-neutral-700'}>
                    {isLiked ? '♥' : '♡'}
                  </span>
                </button>

                {/* Tag */}
                {product.tag && (
                  <span
                    className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider z-20 shadow-xs ${
                      product.tagStyle === 'promo' || product.tag?.toUpperCase() === 'PROMO'
                        ? 'bg-rose-700 text-white font-latin'
                        : product.tagStyle === 'soft'
                        ? 'bg-[#f2ede5] text-ink'
                        : 'bg-orange text-white'
                    }`}
                  >
                    {product.tag?.toUpperCase() === 'PROMO'
                      ? 'PROMO'
                      : product.tag === 'جديد' || product.tag === 'NEW'
                      ? t.tags.new
                      : product.tag === 'الأكثر طلباً' || product.tag === 'BESTSELLER'
                      ? t.tags.bestseller
                      : product.tag}
                  </span>
                )}
              </div>

              {/* Info */}
              <div
                onClick={() => handleOpenProduct(product)}
                className="pt-2 sm:pt-3.5 flex justify-between items-start text-xs gap-1 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[11px] sm:text-xs text-ink mb-0.5 truncate group-hover:text-orange transition-colors">
                    {name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{shade}</p>
                </div>
                <strong className="font-semibold font-arabic text-[11px] sm:text-xs text-ink whitespace-nowrap">
                  {formatPrice(product.price)}
                </strong>
              </div>

              {/* Action Button: Open Detail to Select Size */}
              {isOutOfStock ? (
                <button
                  type="button"
                  onClick={() => handleOpenProduct(product)}
                  className="w-full mt-2 sm:mt-3.5 py-2 sm:py-3 px-2 sm:px-4 border border-neutral-300 text-[9px] sm:text-[10px] font-medium bg-neutral-200/70 text-neutral-500 flex items-center justify-between cursor-pointer select-none shadow-none"
                >
                  <span className="truncate">
                    {language === 'ar' ? 'غير متوفر حالياً' : language === 'fr' ? 'Indisponible' : 'Unavailable'}
                  </span>
                  <span className="font-latin text-xs opacity-60">✕</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenProduct(product)}
                  className="w-full mt-2 sm:mt-3.5 py-2 sm:py-3 px-2 sm:px-4 border border-ink text-[9px] sm:text-[10px] font-medium bg-transparent text-ink flex items-center justify-between transition-colors hover:bg-ink hover:text-white cursor-pointer"
                >
                  <span className="truncate">
                    {language === 'ar'
                      ? 'اختيار المقاس والمواصفات'
                      : language === 'fr'
                      ? 'Choisir la taille'
                      : 'Select Size & Details'}
                  </span>
                  <span className="font-latin text-xs">✦</span>
                </button>
              )}
            </article>
          );
        })}
      </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </section>
  );
};
