import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Ticker } from './components/Ticker';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { Manifesto } from './components/Manifesto';
import { Reviews } from './components/Reviews';
import { GuaranteeSection } from './components/GuaranteeSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartView } from './components/CartView';
import { SearchModal } from './components/SearchModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Product } from './types';

// Code-split AdminPage to keep initial customer bundle fast & lightweight
const AdminPage = React.lazy(() =>
  import('./components/Admin/AdminPage').then((m) => ({ default: m.AdminPage }))
);

export function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#admin')) {
      return 'admin';
    }
    const saved = localStorage.getItem('miee_current_view');
    return saved === 'admin' ? 'admin' : 'store';
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#admin')) {
        setCurrentView('admin');
        localStorage.setItem('miee_current_view', 'admin');
      } else {
        setCurrentView('store');
        localStorage.setItem('miee_current_view', 'store');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    localStorage.setItem('miee_current_view', currentView);
    if (currentView === 'admin') {
      const savedTab = localStorage.getItem('miee_admin_tab') || 'orders';
      const targetHash = `#admin/${savedTab}`;
      if (!window.location.hash.startsWith('#admin')) {
        window.history.replaceState(null, '', targetHash);
      }
    } else {
      if (window.location.hash.startsWith('#admin')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [currentView]);

  const navigateToAdmin = () => {
    const savedTab = localStorage.getItem('miee_admin_tab') || 'orders';
    const targetHash = `#admin/${savedTab}`;
    window.history.replaceState(null, '', targetHash);
    localStorage.setItem('miee_current_view', 'admin');
    setCurrentView('admin');
  };

  const navigateToStore = () => {
    localStorage.setItem('miee_current_view', 'store');
    window.history.replaceState(null, '', window.location.pathname);
    setCurrentView('store');
  };

  return (
    <LanguageProvider>
      <CartProvider>
        {currentView === 'admin' ? (
          <React.Suspense
            fallback={
              <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white font-arabic">
                <div className="flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-white/70">Miee Atelier — جاري تحميل لوحة التحكم...</span>
                </div>
              </div>
            }
          >
            <AdminPage onBackToStore={navigateToStore} />
          </React.Suspense>
        ) : (
          <div className="min-h-screen bg-paper flex flex-col selection:bg-orange selection:text-white" id="top">
            {/* Top Ticker Bar */}
            <Ticker />

            {/* Main Sticky Header */}
            <Header
              onOpenMenu={() => setIsMenuOpen(true)}
              onOpenAdmin={navigateToAdmin}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            {/* Sliding Mobile / Drawer Menu */}
            <SideMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            {/* Search Modal */}
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onSelectProduct={(p) => setDetailProduct(p)}
            />

            {/* Main Content Sections */}
            <main className="flex-1">
              <Hero />
              <Products onOpenProduct={(p) => setDetailProduct(p)} />
              <Manifesto />
              <Reviews />
              <GuaranteeSection />
              <Newsletter />
            </main>

            {/* Footer */}
            <Footer />

            {/* Global Product Detail Modal */}
            <ProductDetailModal
              product={detailProduct}
              isOpen={!!detailProduct}
              onClose={() => setDetailProduct(null)}
            />

            {/* Cart & Checkout View */}
            <CartView />

            {/* Floating Toast Notification */}
            <Toast />
          </div>
        )}
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
