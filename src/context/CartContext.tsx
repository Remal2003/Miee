import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color?: string, size?: string, qty?: number) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  updateColor: (index: number, color: string) => void;
  updateSize: (index: number, size: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  totalCount: number;
  subtotal: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('miee-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(() => {
    try {
      return localStorage.getItem('miee_cart_open') === 'true';
    } catch {
      return false;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('miee_cart_open', String(isCartOpen));
    } catch (e) {
      console.warn(e);
    }
  }, [isCartOpen]);

  useEffect(() => {
    localStorage.setItem('miee-cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToCart = (product: Product, color?: string, size?: string, qty: number = 1) => {
    if (product.inStock === false) {
      showToast('عذراً، هذا المنتج غير متوفر حالياً');
      return;
    }

    const itemQty = Math.max(1, qty);

    setCart(prev => {
      const chosenColor = color || product.colors[0];
      const chosenSize = size || product.sizes[0];
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.color === chosenColor && item.size === chosenSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += itemQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            colors: product.colors,
            sizes: product.sizes,
            color: chosenColor,
            size: chosenSize,
            qty: itemQty
          }
        ];
      }
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(index);
    } else {
      setCart(prev => {
        const updated = [...prev];
        updated[index].qty = qty;
        return updated;
      });
    }
  };

  const updateColor = (index: number, color: string) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].color = color;
      return updated;
    });
  };

  const updateSize = (index: number, size: string) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].size = size;
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        updateColor,
        updateSize,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        totalCount,
        subtotal,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
