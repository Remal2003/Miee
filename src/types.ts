export type Language = 'ar' | 'en' | 'fr';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description?: string;
  category: string;
  colors: string[];
  sizes: string[];
  tag?: string;
  tagStyle?: 'orange' | 'soft' | 'promo' | string;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  colors: string[];
  sizes: string[];
  color: string;
  size: string;
  qty: number;
  inStock?: boolean;
}

export interface Wilaya {
  id: string;
  name: string;
  homePrice: number;
  officePrice: number;
}

export type DeliveryMethod = 'office' | 'home';

export interface OrderPayload {
  customerName: string;
  phone: string;
  wilayaId: string;
  wilayaName: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}
