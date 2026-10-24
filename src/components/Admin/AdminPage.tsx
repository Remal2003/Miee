import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeToOrders,
  updateOrderStatus,
  deleteOrderFromFirebase,
  clearAllOrdersFromFirebase,
  subscribeToProducts,
  saveProductToFirebase,
  deleteProductFromFirebase,
  subscribeToWilayas,
  saveWilayasToFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  onAuthChange,
  uploadProductImage,
  subscribeToBanners,
  saveBannersToFirebase,
  DEFAULT_STORE_BANNERS,
  FirebaseOrder
} from '../../firebase';
import { Product, Wilaya } from '../../types';
import { WILAYAS } from '../../data/wilayas';
import { BrandLogo } from '../BrandLogo';
import { useLanguage } from '../../context/LanguageContext';
import { ADMIN_TRANSLATIONS } from './adminTranslations';
import { AdminSizeSelectorCard } from './AdminSizeSelectorCard';
import { AdminColorSelectorCard, getKnownColorSwatch } from './AdminColorSelectorCard';
import { ProductDetailModal } from '../ProductDetailModal';

interface AdminPageProps {
  onBackToStore: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore }) => {
  const { language, setLanguage, dir } = useLanguage();
  const at = ADMIN_TRANSLATIONS[language] || ADMIN_TRANSLATIONS.ar;
  const isRtl = dir === 'rtl';

  // Authentication State
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('miee_remember_me') !== 'false';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const isRemembered = localStorage.getItem('miee_remember_me') !== 'false';
    if (isRemembered) {
      return localStorage.getItem('miee_admin_auth') === 'true';
    }
    return sessionStorage.getItem('miee_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('miee_remember_email') || '';
  });
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Clean legacy stored password and verify Firebase authentication state
  useEffect(() => {
    try {
      localStorage.removeItem('miee_remember_password');
    } catch {}
    const unsub = onAuthChange((user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  // Active Tab - Persistent across page reloads & URL sync
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'shipping' | 'banners'>(() => {
    const hash = window.location.hash || '';
    if (hash.includes('products')) return 'products';
    if (hash.includes('shipping')) return 'shipping';
    if (hash.includes('banners')) return 'banners';
    if (hash.includes('orders')) return 'orders';
    const saved = localStorage.getItem('miee_admin_tab');
    if (saved === 'products' || saved === 'shipping' || saved === 'banners' || saved === 'orders') {
      return saved;
    }
    return 'orders';
  });

  // Keep activeTab synced with localStorage and URL hash
  useEffect(() => {
    localStorage.setItem('miee_admin_tab', activeTab);
    if (window.location.hash.startsWith('#admin')) {
      const targetHash = `#admin/${activeTab}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [activeTab]);

  // Listen to hash changes (back / forward buttons)
  useEffect(() => {
    const handleHashTab = () => {
      const hash = window.location.hash || '';
      if (hash.includes('products')) {
        setActiveTab('products');
      } else if (hash.includes('shipping')) {
        setActiveTab('shipping');
      } else if (hash.includes('banners')) {
        setActiveTab('banners');
      } else if (hash.includes('orders')) {
        setActiveTab('orders');
      }
    };
    window.addEventListener('hashchange', handleHashTab);
    return () => window.removeEventListener('hashchange', handleHashTab);
  }, []);

  // Real-time Data
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'confirmed' | 'shipped' | 'cancelled'>('all');
  const [wilayaSearch, setWilayaSearch] = useState('');

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdAdditionalImages, setNewProdAdditionalImages] = useState('');
  const [newProdSizes, setNewProdSizes] = useState<string>('S, M, L, XL');
  const [newProdColors, setNewProdColors] = useState<string>(
    language === 'ar' ? 'أسود ليلي, بيج رملي' : language === 'fr' ? 'Noir de minuit, Beige' : 'Midnight black, Sand beige'
  );
  const [newProdTag, setNewProdTag] = useState<'جديد' | 'الأكثر طلباً' | 'PROMO' | ''>('جديد');
  const [newProdInStock, setNewProdInStock] = useState<boolean>(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');

  // Editing Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState<number | ''>('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdAdditionalImages, setEditProdAdditionalImages] = useState('');
  const [editProdSizes, setEditProdSizes] = useState('');
  const [editProdColors, setEditProdColors] = useState('');
  const [editProdTag, setEditProdTag] = useState<'جديد' | 'الأكثر طلباً' | 'PROMO' | ''>('');
  const [editProdInStock, setEditProdInStock] = useState<boolean>(true);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Direct Device/Phone Image Upload States & Refs
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState('');
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [isEditUploadingMainImage, setIsEditUploadingMainImage] = useState(false);
  const [isEditUploadingGalleryImages, setIsEditUploadingGalleryImages] = useState(false);
  const [editGalleryUploadProgress, setEditGalleryUploadProgress] = useState('');
  const editMainFileInputRef = useRef<HTMLInputElement>(null);
  const editGalleryFileInputRef = useRef<HTMLInputElement>(null);

  // Shipping save status
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [shippingSuccessMsg, setShippingSuccessMsg] = useState('');

  // Store Banners & Hero Visuals Management State
  const [heroImagesInput, setHeroImagesInput] = useState<string>('');
  const [philosophyImageInput, setPhilosophyImageInput] = useState<string>('');
  const [isSavingBanners, setIsSavingBanners] = useState(false);
  const [bannersSuccessMsg, setBannersSuccessMsg] = useState('');
  const [isUploadingHeroBanner, setIsUploadingHeroBanner] = useState(false);
  const [heroBannerUploadProgress, setHeroBannerUploadProgress] = useState('');
  const [isUploadingPhilosophyBanner, setIsUploadingPhilosophyBanner] = useState(false);
  const heroBannerFileRef = useRef<HTMLInputElement>(null);
  const philosophyBannerFileRef = useRef<HTMLInputElement>(null);

  // Luxury Haute Couture Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    message: string;
    itemBadge?: string;
    confirmText?: string;
    secondaryText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    onConfirm: () => void | Promise<void>;
    onSecondary?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;
    const unsubAuth = onAuthChange((user) => {
      if (!isMounted) return;
      if (user) {
        setIsAuthenticated(true);
        const isRemembered = localStorage.getItem('miee_remember_me') !== 'false';
        if (isRemembered) {
          localStorage.setItem('miee_admin_auth', 'true');
        } else {
          sessionStorage.setItem('miee_admin_auth', 'true');
        }
      } else {
        const hasSavedAuth = localStorage.getItem('miee_admin_auth') === 'true';
        const hasSessionAuth = sessionStorage.getItem('miee_admin_auth') === 'true';
        if (!hasSavedAuth && !hasSessionAuth) {
          setIsAuthenticated(false);
          localStorage.removeItem('miee_admin_auth');
          sessionStorage.removeItem('miee_admin_auth');
        }
      }
    });
    return () => {
      isMounted = false;
      unsubAuth();
    };
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubOrders = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    const unsubProducts = subscribeToProducts((liveProducts) => {
      setProducts(liveProducts);
    });

    const unsubBanners = subscribeToBanners((liveBanners) => {
      setHeroImagesInput(liveBanners.heroImages?.join('\n') || DEFAULT_STORE_BANNERS.heroImages.join('\n'));
      setPhilosophyImageInput(liveBanners.philosophyImage || DEFAULT_STORE_BANNERS.philosophyImage);
    });

    const unsubWilayas = subscribeToWilayas((liveWilayas) => {
      setWilayas(liveWilayas);
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubWilayas === 'function') unsubWilayas();
      if (typeof unsubBanners === 'function') unsubBanners();
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      await loginWithFirebase(adminEmail.trim(), adminPassword, rememberMe);
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('miee_remember_me', 'true');
        localStorage.setItem('miee_remember_email', adminEmail.trim());
        localStorage.removeItem('miee_remember_password');
        localStorage.setItem('miee_admin_auth', 'true');
      } else {
        localStorage.setItem('miee_remember_me', 'false');
        localStorage.removeItem('miee_remember_email');
        localStorage.removeItem('miee_remember_password');
        sessionStorage.setItem('miee_admin_auth', 'true');
      }
    } catch (error: any) {
      console.error('Firebase Auth error:', error);
      const code = error?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setLoginError(at.loginError);
      } else if (code === 'auth/invalid-email') {
        setLoginError(
          language === 'ar'
            ? 'صيغة البريد الإلكتروني غير صحيحة.'
            : language === 'fr'
            ? 'Format d’e-mail invalide.'
            : 'Invalid email address format.'
        );
      } else if (code === 'auth/too-many-requests') {
        setLoginError(
          language === 'ar'
            ? 'تم تعليق المحاولات مؤقتاً لتكرار الخطأ. يرجى الانتظار قليلاً.'
            : language === 'fr'
            ? 'Trop de tentatives échouées. Veuillez réessayer plus tard.'
            : 'Too many attempts. Please try again in a moment.'
        );
      } else {
        setLoginError(at.loginError);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleClearSavedCredentials = () => {
    localStorage.setItem('miee_remember_me', 'false');
    localStorage.removeItem('miee_remember_email');
    localStorage.removeItem('miee_remember_password');
    setAdminEmail('');
    setAdminPassword('');
    setRememberMe(false);
  };

  const executeLogout = async (forgetMe: boolean) => {
    try {
      await logoutFromFirebase();
    } catch (err) {
      console.warn('Logout note:', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('miee_admin_auth');
    sessionStorage.removeItem('miee_admin_auth');
    localStorage.setItem('miee_current_view', 'store');

    if (forgetMe) {
      localStorage.setItem('miee_remember_me', 'false');
      localStorage.removeItem('miee_remember_email');
      localStorage.removeItem('miee_remember_password');
      setAdminEmail('');
      setAdminPassword('');
      setRememberMe(false);
    } else {
      localStorage.setItem('miee_remember_me', 'true');
      if (adminEmail.trim()) {
        localStorage.setItem('miee_remember_email', adminEmail.trim());
      }
      localStorage.removeItem('miee_remember_password');
      setRememberMe(true);
    }
    onBackToStore();
  };

  const handleLogout = () => {
    const isRemembered = localStorage.getItem('miee_remember_me') !== 'false';
    if (isRemembered) {
      setConfirmModal({
        isOpen: true,
        title: language === 'ar' ? 'تسجيل الخروج من لوحة التحكم' : language === 'fr' ? 'Déconnexion du tableau de bord' : 'Log out of Dashboard',
        subtitle: language === 'ar' ? 'جلسة مسؤول · MIEE ATELIER' : 'Session Administrateur',
        message: language === 'ar'
          ? 'أنت مسجّل عبر ميزة «تذكرني». اختر نوع الخروج: هل تود الخروج مع إبقاء كلمة المرور محفوظة لتسجيل الدخول السريع لاحقاً، أو الخروج الكامل بدون تذكرني؟'
          : language === 'fr'
          ? 'Vous êtes connecté avec « Se souvenir de moi ». Souhaitez-vous vous déconnecter en conservant votre mot de passe pour un accès rapide, ou effectuer une déconnexion complète ?'
          : 'You are logged in with "Remember me". Do you want to log out while keeping your password saved for fast login, or log out completely without remembering?',
        confirmText: language === 'ar' ? 'خروج (مع البقاء متذكراً)' : language === 'fr' ? 'Déconnexion (Garder mémo)' : 'Logout (Keep remembered)',
        secondaryText: language === 'ar' ? 'خروج نهائي بدون تذكرني' : language === 'fr' ? 'Déconnexion sans mémo' : 'Logout (Forget me)',
        cancelText: language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel',
        isDangerous: false,
        onConfirm: async () => {
          await executeLogout(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
        onSecondary: async () => {
          await executeLogout(true);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: language === 'ar' ? 'تأكيد تسجيل الخروج' : language === 'fr' ? 'Confirmer la déconnexion' : 'Confirm Logout',
        subtitle: language === 'ar' ? 'جلسة مسؤول · MIEE ATELIER' : 'Session Administrateur',
        message: language === 'ar'
          ? 'هل أنت متأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟'
          : language === 'fr'
          ? 'Êtes-vous sûr de vouloir vous déconnecter du tableau de bord ?'
          : 'Are you sure you want to log out of the dashboard?',
        confirmText: language === 'ar' ? 'تسجيل الخروج' : language === 'fr' ? 'Se déconnecter' : 'Log out',
        cancelText: language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel',
        isDangerous: true,
        onConfirm: async () => {
          await executeLogout(true);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice || !newProdImage.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }

    setIsSavingProduct(true);
    setProductSuccessMsg('');

    try {
      const generatedId = `p-${Date.now().toString().slice(-5)}`;
      const sizesArray = newProdSizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const colorsArray = newProdColors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const additionalUrls = newProdAdditionalImages
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5 && u !== newProdImage.trim());

      const productToAdd: Product = {
        id: generatedId,
        name: newProdName.trim(),
        price: Number(newProdPrice),
        category: 'all',
        image: newProdImage.trim(),
        images: [newProdImage.trim(), ...additionalUrls],
        sizes: sizesArray.length ? sizesArray : ['S', 'M', 'L'],
        colors: colorsArray.length ? colorsArray : [isRtl ? 'أسود ليلي' : 'Black'],
        tag: newProdTag || undefined,
        tagStyle: newProdTag === 'PROMO' ? 'promo' : newProdTag === 'جديد' ? 'orange' : 'soft',
        inStock: newProdInStock
      };

      await saveProductToFirebase(productToAdd);

      setProductSuccessMsg(at.products.successMsg);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdImage('');
      setNewProdAdditionalImages('');
      setNewProdInStock(true);
    } catch {
      alert('Error saving product to Firebase.');
    } finally {
      setIsSavingProduct(false);
      setTimeout(() => setProductSuccessMsg(''), 4000);
    }
  };

  // Start Editing Product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdPrice(prod.price);
    setEditProdImage(prod.image);
    const additional = (prod.images || []).filter((img) => img !== prod.image);
    setEditProdAdditionalImages(additional.join('\n'));
    setEditProdSizes(prod.sizes?.join(', ') || 'S, M, L');
    setEditProdColors(prod.colors?.join(', ') || '');
    setEditProdTag((prod.tag as any) || '');
    setEditProdInStock(prod.inStock !== false);
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingProduct(null);
  };

  // Quick 1-Click Toggle Availability (In Stock / Out of Stock)
  const handleToggleProductStock = async (prod: Product) => {
    const updatedStatus = prod.inStock === false ? true : false;
    const updatedProd: Product = {
      ...prod,
      inStock: updatedStatus
    };
    await saveProductToFirebase(updatedProd);
  };

  // Save Edited Product
  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim() || !editProdPrice || !editProdImage.trim()) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }

    setIsUpdatingProduct(true);
    try {
      const sizesArray = editProdSizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const colorsArray = editProdColors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const additionalUrls = editProdAdditionalImages
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5 && u !== editProdImage.trim());

      const updatedProduct: Product = {
        ...editingProduct,
        name: editProdName.trim(),
        price: Number(editProdPrice),
        image: editProdImage.trim(),
        images: [editProdImage.trim(), ...additionalUrls],
        sizes: sizesArray.length ? sizesArray : ['S', 'M', 'L'],
        colors: colorsArray.length ? colorsArray : ['أسود ليلي'],
        tag: editProdTag || undefined,
        tagStyle: editProdTag === 'PROMO' ? 'promo' : editProdTag === 'جديد' ? 'orange' : 'soft',
        inStock: editProdInStock
      };

      await saveProductToFirebase(updatedProduct);
      setEditingProduct(null);
      setProductSuccessMsg(
        language === 'ar'
          ? `تم تحديث منتج «${updatedProduct.name}» بنجاح!`
          : language === 'fr'
          ? `Produit "${updatedProduct.name}" mis à jour !`
          : `Product "${updatedProduct.name}" updated successfully!`
      );
      setTimeout(() => setProductSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error updating product.');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // -------------------------------------------------------------
  // Direct Device/Phone Image Upload & Gallery Handlers
  // -------------------------------------------------------------

  const handleRemoveGalleryImage = (indexToRemove: number, isEdit: boolean = false) => {
    if (isEdit) {
      const urls = editProdAdditionalImages
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5);
      urls.splice(indexToRemove, 1);
      setEditProdAdditionalImages(urls.join('\n'));
    } else {
      const urls = newProdAdditionalImages
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5);
      urls.splice(indexToRemove, 1);
      setNewProdAdditionalImages(urls.join('\n'));
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMainImage(true);
    try {
      const url = await uploadProductImage(file);
      setNewProdImage(url);
    } catch (err) {
      console.error('Error uploading main image:', err);
    } finally {
      setIsUploadingMainImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGalleryImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setGalleryUploadProgress(
          language === 'ar'
            ? `جاري رفع الصورة ${i + 1} من ${files.length}...`
            : language === 'fr'
            ? `Téléversement ${i + 1}/${files.length}...`
            : `Uploading ${i + 1}/${files.length}...`
        );
        const url = await uploadProductImage(files[i]);
        uploadedUrls.push(url);
      }
      const existing = newProdAdditionalImages.trim();
      const newUrlsStr = uploadedUrls.join('\n');
      setNewProdAdditionalImages(existing ? `${existing}\n${newUrlsStr}` : newUrlsStr);
    } catch (err) {
      console.error('Error uploading gallery images:', err);
    } finally {
      setIsUploadingGalleryImages(false);
      setGalleryUploadProgress('');
      if (e.target) e.target.value = '';
    }
  };

  const handleEditMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsEditUploadingMainImage(true);
    try {
      const url = await uploadProductImage(file);
      setEditProdImage(url);
    } catch (err) {
      console.error('Error uploading main image in edit:', err);
    } finally {
      setIsEditUploadingMainImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleEditGalleryImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsEditUploadingGalleryImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setEditGalleryUploadProgress(
          language === 'ar'
            ? `جاري رفع الصورة ${i + 1} من ${files.length}...`
            : language === 'fr'
            ? `Téléversement ${i + 1}/${files.length}...`
            : `Uploading ${i + 1}/${files.length}...`
        );
        const url = await uploadProductImage(files[i]);
        uploadedUrls.push(url);
      }
      const existing = editProdAdditionalImages.trim();
      const newUrlsStr = uploadedUrls.join('\n');
      setEditProdAdditionalImages(existing ? `${existing}\n${newUrlsStr}` : newUrlsStr);
    } catch (err) {
      console.error('Error uploading gallery images in edit:', err);
    } finally {
      setIsEditUploadingGalleryImages(false);
      setEditGalleryUploadProgress('');
      if (e.target) e.target.value = '';
    }
  };

  // Delete Product Handler with Luxury Confirm Modal
  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'حذف هذه القطعة من المتجر؟' : 'Supprimer cette pièce ?',
      subtitle: language === 'ar' ? 'إجراء حذف قطعة' : 'Catalogue Atelier Miee',
      message: language === 'ar'
        ? `هل أنت متأكد من رغبتك في حذف القطعة «${name}»؟ لن تظهر للزبائن في المتجر بعد الحذف.`
        : `Voulez-vous vraiment supprimer définitivement «${name}» ?`,
      itemBadge: name,
      confirmText: language === 'ar' ? 'نعم، احذف القطعة' : 'Oui, supprimer',
      cancelText: language === 'ar' ? 'تراجع وإلغاء' : 'Annuler',
      isDangerous: true,
      onConfirm: async () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await deleteProductFromFirebase(id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Shipping Handlers - Instant Real-Time Persistence & Broadcast
  const handleUpdateWilayaRate = (
    id: string,
    field: 'homePrice' | 'officePrice',
    value: number
  ) => {
    const safeVal = Math.max(0, Number(value || 0));
    setWilayas((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, [field]: safeVal } : w));
      saveWilayasToFirebase(next);
      return next;
    });
  };

  const handleToggleWilayaFree = (id: string, currentlyFree: boolean) => {
    setWilayas((prev) => {
      const next = prev.map((w) =>
        w.id === id
          ? {
              ...w,
              homePrice: currentlyFree ? 600 : 0,
              officePrice: currentlyFree ? 400 : 0
            }
          : w
      );
      saveWilayasToFirebase(next);
      return next;
    });
  };

  const handleSetFreeShippingAll = () => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'تفعيل التوصيل المجاني للـ 58 ولاية؟' : 'Livraison gratuite pour les 58 wilayas ?',
      subtitle: language === 'ar' ? 'تحديث أسعار الشحن' : 'Tarifs Atelier Miee',
      message: language === 'ar'
        ? 'سيتم ضبط سعر التوصيل لجميع الولايات الـ 58 إلى 0 دج (توصيل مجاني بالكامل) فوراً.'
        : 'Tous les tarifs de livraison pour les 58 wilayas seront fixés à 0 DA.',
      itemBadge: language === 'ar' ? '58 ولاية ← شحن مجاني (0 دج)' : '58 Wilayas → Gratuit',
      confirmText: language === 'ar' ? 'تأكيد التوصيل المجاني' : 'Confirmer',
      cancelText: language === 'ar' ? 'إلغاء' : 'Annuler',
      isDangerous: false,
      onConfirm: async () => {
        const freeList = wilayas.map((w) => ({ ...w, homePrice: 0, officePrice: 0 }));
        setWilayas(freeList);
        await saveWilayasToFirebase(freeList);
        setShippingSuccessMsg(
          language === 'ar'
            ? 'تم تفعيل التوصيل المجاني لكافة الـ 58 ولاية لحظياً!'
            : 'Free shipping applied to all 58 wilayas!'
        );
        setTimeout(() => setShippingSuccessMsg(''), 4000);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetDefaultShipping = () => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'استعادة التسعيرات الافتراضية؟' : 'Restaurer les tarifs par défaut ?',
      subtitle: language === 'ar' ? 'تحديث أسعار الشحن' : 'Tarifs Atelier Miee',
      message: language === 'ar'
        ? 'هل تريد استعادة تسعيرات التوصيل المعيارية الأصلية للـ 58 ولاية؟'
        : 'Voulez-vous restaurer les tarifs de livraison par défaut pour les 58 wilayas ?',
      itemBadge: language === 'ar' ? 'استعادة التسعيرات الأصلية للـ 58 ولاية' : 'Restaurer les 58 wilayas',
      confirmText: language === 'ar' ? 'نعم، استعادة التسعيرات' : 'Restaurer',
      cancelText: language === 'ar' ? 'إلغاء' : 'Annuler',
      isDangerous: false,
      onConfirm: async () => {
        setWilayas(WILAYAS);
        await saveWilayasToFirebase(WILAYAS);
        setShippingSuccessMsg(
          language === 'ar'
            ? 'تمت استعادة التسعيرات الافتراضية للولايات بنجاح!'
            : 'Standard wilayas rates restored successfully!'
        );
        setTimeout(() => setShippingSuccessMsg(''), 4000);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveShipping = async () => {
    setIsSavingShipping(true);
    setShippingSuccessMsg('');
    try {
      await saveWilayasToFirebase(wilayas);
      setShippingSuccessMsg(at.shipping.successMsg);
    } catch {
      alert('Error updating wilayas rates.');
    } finally {
      setIsSavingShipping(false);
      setTimeout(() => setShippingSuccessMsg(''), 4000);
    }
  };

  // -------------------------------------------------------------
  // Store Banners & Section Visuals Handlers
  // -------------------------------------------------------------

  const handleSaveBanners = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBanners(true);
    try {
      const heroList = heroImagesInput
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u.length > 5);

      const finalHero = heroList.length > 0 ? heroList : DEFAULT_STORE_BANNERS.heroImages;
      const finalPhilosophy = philosophyImageInput.trim() || DEFAULT_STORE_BANNERS.philosophyImage;

      await saveBannersToFirebase({
        heroImages: finalHero,
        philosophyImage: finalPhilosophy
      });

      setBannersSuccessMsg(
        language === 'ar'
          ? 'تم حفظ وتحديث صور الواجهة والهيرو وقسم الفلسفة بنجاح!'
          : language === 'fr'
          ? 'Visuels et bannières mis à jour avec succès !'
          : 'Storefront visuals and philosophy image saved successfully!'
      );
    } catch (err) {
      console.error('Error saving banners:', err);
      alert('Error saving banners to Firebase.');
    } finally {
      setIsSavingBanners(false);
      setTimeout(() => setBannersSuccessMsg(''), 4000);
    }
  };

  const handleResetBanners = () => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'استعادة الصور الافتراضية للواجهة؟' : 'Restaurer les visuels par défaut ?',
      subtitle: language === 'ar' ? 'إعادة ضبط صور المتجر' : 'Vitrine Miee',
      message: language === 'ar'
        ? 'هل تريد استعادة صور الهيرو وقسم الفلسفة الافتراضية الأصلية؟'
        : 'Do you want to reset Hero and Philosophy visuals to their original default photos?',
      confirmText: language === 'ar' ? 'نعم، استعادة الافتراضي' : 'Restaurer',
      isDangerous: false,
      onConfirm: async () => {
        await saveBannersToFirebase(DEFAULT_STORE_BANNERS);
        setHeroImagesInput(DEFAULT_STORE_BANNERS.heroImages.join('\n'));
        setPhilosophyImageInput(DEFAULT_STORE_BANNERS.philosophyImage);
        setBannersSuccessMsg(
          language === 'ar' ? 'تمت استعادة الصور الافتراضية بنجاح!' : 'Default visuals restored!'
        );
        setTimeout(() => setBannersSuccessMsg(''), 4000);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingHeroBanner(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setHeroBannerUploadProgress(
          language === 'ar'
            ? `جاري رفع الصورة ${i + 1} من ${files.length}...`
            : `Uploading ${i + 1}/${files.length}...`
        );
        const url = await uploadProductImage(files[i]);
        uploadedUrls.push(url);
      }
      const existing = heroImagesInput.trim();
      const newStr = uploadedUrls.join('\n');
      setHeroImagesInput(existing ? `${existing}\n${newStr}` : newStr);
    } catch (err) {
      console.error('Error uploading hero banner:', err);
    } finally {
      setIsUploadingHeroBanner(false);
      setHeroBannerUploadProgress('');
      if (e.target) e.target.value = '';
    }
  };

  const handlePhilosophyBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhilosophyBanner(true);
    try {
      const url = await uploadProductImage(file);
      setPhilosophyImageInput(url);
    } catch (err) {
      console.error('Error uploading philosophy banner:', err);
    } finally {
      setIsUploadingPhilosophyBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveHeroBannerImage = (indexToRemove: number) => {
    const urls = heroImagesInput
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => u.length > 5);
    urls.splice(indexToRemove, 1);
    setHeroImagesInput(urls.join('\n'));
  };

  // Filtered Orders (Never hide any real orders)
  const filteredOrders = orders
    .filter((ord) => Boolean(ord && ord.orderId))
    .filter((ord) => {
      const customer = ord.customerName || '';
      const phone = ord.phone || '';
      const id = ord.orderId || '';
      const wilaya = ord.wilayaName || '';
      const matchesSearch =
        customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
        phone.includes(orderSearch) ||
        id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        wilaya.toLowerCase().includes(orderSearch.toLowerCase());

      const matchesStatus =
        orderStatusFilter === 'all' || ord.status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });

  const scrollToOrders = (status: 'all' | 'new' | 'confirmed' | 'shipped' | 'cancelled' = 'all') => {
    setActiveTab('orders');
    setOrderStatusFilter(status);
    setOrderSearch('');
    setTimeout(() => {
      const el = document.getElementById('orders-feed-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleClearAllOrders = () => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'تصفير ومسح كافة الطلبات؟' : 'Purger toutes les commandes ?',
      subtitle: language === 'ar' ? 'إعادة ضبط العداد إلى 0' : 'Réinitialisation à 0',
      message: language === 'ar'
        ? 'هل أنت متأكد من تصفير ومسح جميع الطلبيات التجريبية نهائياً؟ سيتم إرجاع العداد إلى (0) فوراً والبدء من الصفر بسجل نظيف للزبائن.'
        : 'Toutes les commandes seront définitivement purgées et le registre sera réinitialisé à 0.',
      itemBadge: language === 'ar' ? `عدد الطلبيات الحالية المسجلة: ${orders.length} طلبية` : `${orders.length} commandes enregistrées`,
      confirmText: language === 'ar' ? 'نعم، تصفير السجل إلى (0)' : 'Oui, purger',
      cancelText: language === 'ar' ? 'تراجع' : 'Annuler',
      isDangerous: true,
      onConfirm: async () => {
        setOrders([]);
        await clearAllOrdersFromFirebase();
        setOrders([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRequestDeleteOrder = (ord: FirebaseOrder) => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'حذف هذه الطلبية نهائياً؟' : 'Supprimer cette commande ?',
      subtitle: language === 'ar' ? 'إجراء حذف طلبية' : 'Gestion Commandes Miee',
      message: language === 'ar'
        ? 'هل أنت متأكد من رغبتك في حذف هذه الطلبية من السجل نهائياً؟ لن تتمكن من استرجاع بياناتها بعد الحذف.'
        : 'Êtes-vous sûr de vouloir supprimer définitivement cette commande ?',
      itemBadge: `#${ord.orderId} — ${ord.customerName?.trim() || (language === 'ar' ? 'طلب تجريبي' : 'Commande')} (${Number(ord.total).toLocaleString('fr-FR')} دج)`,
      confirmText: language === 'ar' ? 'نعم، احذف الطلبية' : 'Oui, supprimer',
      cancelText: language === 'ar' ? 'تراجع وإلغاء' : 'Annuler',
      isDangerous: true,
      onConfirm: async () => {
        const idToDelete = ord.orderId;
        setOrders((prev) => prev.filter((o) => o.orderId !== idToDelete));
        await deleteOrderFromFirebase(idToDelete);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const shippedOrdersCount = orders.filter((o) => o.status === 'shipped').length;

  const statusCounts = {
    all: orders.length,
    new: newOrdersCount,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: shippedOrdersCount,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const getWhatsAppLink = (phone: string, orderId: string, customerName: string) => {
    const digits = (phone || '').replace(/\D/g, '');
    let intl = digits;
    if (intl.startsWith('0')) {
      intl = '213' + intl.slice(1);
    } else if (!intl.startsWith('213')) {
      intl = '213' + intl;
    }
    const msg =
      language === 'ar'
        ? `مرحباً ${customerName}، نتواصل معكِ من متجر MIEE لتأكيد طلبيتك رقم #${orderId}.`
        : language === 'fr'
        ? `Bonjour ${customerName}, nous vous contactons depuis la boutique MIEE pour confirmer votre commande #${orderId}.`
        : `Hello ${customerName}, contacting you from MIEE to confirm your order #${orderId}.`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
  };

  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // LUXURY SPLIT-SCREEN & CINEMATIC MOBILE AUTHENTICATION PORTAL
  if (!isAuthenticated) {
    return (
      <>
        {/* ======================================================== */}
        {/* MOBILE EXPERIENCE: FULL-BLEED DARK EDITORIAL & GLASSMORPHISM (< lg) */}
        {/* ======================================================== */}
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`lg:hidden relative min-h-screen w-full flex flex-col justify-between p-5 sm:p-7 bg-[#0d0c0b] text-white selection:bg-orange selection:text-white ${
            isRtl ? 'font-arabic' : 'font-latin'
          }`}
        >
          {/* Full-Screen High-Resolution Fashion Background */}
          <div
            className="fixed inset-0 bg-cover bg-center select-none"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(13,12,11,0.72) 0%, rgba(13,12,11,0.85) 45%, rgba(13,12,11,0.98) 100%), url('https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?q=80&w=1400&auto=format&fit=crop')",
              backgroundPosition: 'center 20%'
            }}
          />

          {/* Floating Top Navigation */}
          <header className="relative z-20 flex items-center justify-between pb-4 border-b border-white/10" dir="ltr">
            <button
              type="button"
              onClick={onBackToStore}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
              title={language === 'ar' ? 'الذهاب إلى الصفحة الرئيسية' : 'Retour à la boutique'}
            >
              <BrandLogo textColor="text-white" />
              <span className="h-3.5 w-[1px] bg-white/25" />
              <span className="text-[9px] tracking-[0.25em] font-latin uppercase text-white/80 font-bold">
                Atelier
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* Glass Language Switcher */}
              <div className="flex items-center gap-1 border border-white/20 rounded-full p-1 bg-black/40 backdrop-blur-md text-[10px] font-latin font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`px-2 py-0.5 rounded-full font-arabic transition-colors duration-150 ${
                    language === 'ar' ? 'bg-white text-ink shadow-xs' : 'text-white/70 hover:text-white'
                  }`}
                >
                  ع
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded-full transition-colors duration-150 ${
                    language === 'en' ? 'bg-white text-ink shadow-xs' : 'text-white/70 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`px-1.5 py-0.5 rounded-full transition-colors duration-150 ${
                    language === 'fr' ? 'bg-white text-ink shadow-xs' : 'text-white/70 hover:text-white'
                  }`}
                >
                  FR
                </button>
              </div>

              {/* View Store */}
              <button
                type="button"
                onClick={onBackToStore}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-white hover:text-ink text-white text-[10px] font-semibold transition-colors"
              >
                <span>{at.viewStore}</span>
                <span className="font-latin text-xs">{isRtl ? '↖' : '↗'}</span>
              </button>
            </div>
          </header>

          {/* Center Floating Glass Card */}
          <main className="relative z-20 my-auto py-6 w-full max-w-sm mx-auto">
            <div className="bg-[#171514]/80 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 rounded-none relative shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
              {/* Luxury Accent Bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-orange/90 to-transparent" />

              <div className="mb-6 text-center">
                <span className="inline-block text-orange text-[9px] font-latin tracking-[0.3em] uppercase font-bold mb-2">
                  ✦ PRIVILEGED ATELIER ACCESS ✦
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                  {at.loginTitle}
                </h1>
                <p className="text-xs text-white/60 leading-relaxed font-normal">
                  {at.loginDesc}
                </p>
              </div>

              {loginError && (
                <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded-none leading-relaxed flex items-start gap-2">
                  <span className="text-sm">⚠</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-white/70 mb-1.5">
                    {at.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={at.emailPlaceholder}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white focus:bg-white/10 transition-all font-latin"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-white/70 mb-1.5">
                    {at.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={at.passwordPlaceholder}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className={`w-full h-12 ${
                        isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'
                      } bg-white/5 border border-white/15 text-xs text-white placeholder-white/30 outline-none focus:border-white focus:bg-white/10 transition-all font-latin`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className={`absolute top-1/2 -translate-y-1/2 ${
                        isRtl ? 'left-3' : 'right-3'
                      } text-white/50 hover:text-white transition-colors p-1 flex items-center justify-center`}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option (Mobile) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRememberMe(checked);
                          if (!checked) {
                            localStorage.setItem('miee_remember_me', 'false');
                            localStorage.removeItem('miee_remember_password');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded-none border border-white/30 bg-white/10 peer-checked:bg-white peer-checked:border-white transition-all flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-3 h-3 text-ink transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-white/80 group-hover:text-white transition-colors">
                        {at.rememberMe}
                      </span>
                    </label>

                    {rememberMe && adminPassword && (
                      <button
                        type="button"
                        onClick={handleClearSavedCredentials}
                        className="text-[10px] text-white/60 hover:text-red-400 underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'خروج بدون تذكرني' : 'Oublier mes identifiants'}
                      </button>
                    )}
                  </div>

                  {rememberMe && adminPassword && (
                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center gap-1.5 font-medium leading-tight">
                      <span className="text-emerald-400">✓</span>
                      <span>{language === 'ar' ? 'كلمة المرور محفوظة تلقائياً عبر ميزة (تذكرني)' : 'Mot de passe mémorisé automatiquement'}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full mt-5 h-12 bg-white text-ink text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-all flex items-center justify-between px-5 disabled:opacity-60 group shadow-lg active:scale-[0.99]"
                >
                  <span>
                    {isLoggingIn
                      ? language === 'ar'
                        ? 'جارٍ التحقق...'
                        : language === 'fr'
                        ? 'Vérification...'
                        : 'Authenticating...'
                      : at.loginSubmit}
                  </span>
                  <span className="font-latin text-base transition-transform group-hover:translate-x-1">
                    {isRtl ? '←' : '→'}
                  </span>
                </button>
              </form>
            </div>
          </main>

          {/* Bottom Mobile Signature */}
          <footer className="relative z-20 pt-4 pb-2 text-center text-[10px] text-white/50 tracking-[0.25em] uppercase font-latin">
            M I E E  ·  M A I S O N  D E  M O D E  ·  A L G E R
          </footer>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP EXPERIENCE: HAUTE SPLIT-SCREEN (lg+) */}
        {/* ======================================================== */}
        <div
          dir="ltr"
          className="hidden lg:flex min-h-screen bg-[#f5f2ed] text-ink flex-row selection:bg-orange selection:text-white w-full"
        >
          {/* Desktop Left Side: Haute Editorial Image & Luxury Heritage (Fixed Left Column) */}
          <div className="relative w-1/2 min-h-screen bg-[#1c1815] overflow-hidden select-none">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(18,18,18,0.2) 0%, rgba(18,18,18,0.78) 100%), url('https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?q=80&w=1400&auto=format&fit=crop')",
                backgroundPosition: 'center 26%'
              }}
            />

            <div className="relative z-10 w-full h-full p-12 lg:p-16 flex flex-col justify-between text-white">
              <button
                type="button"
                onClick={onBackToStore}
                className="flex items-center gap-3 cursor-pointer w-fit hover:opacity-85 transition-opacity text-left"
                title={language === 'ar' ? 'الذهاب إلى الصفحة الرئيسية' : 'Retour à la boutique'}
              >
                <BrandLogo textColor="text-white" />
                <span className="h-4 w-[1px] bg-white/30" />
                <span className="text-[10px] tracking-[0.3em] font-latin uppercase text-white/80">
                  Atelier Prive
                </span>
              </button>

              <div className="my-auto py-12" dir={isRtl ? 'rtl' : 'ltr'}>
                <span className="text-orange text-xs font-latin tracking-[0.3em] uppercase block mb-3 font-semibold">
                  M I E E  ·  M A I S O N
                </span>
                <h2 className="text-3xl lg:text-4xl font-medium tracking-tight leading-[1.35] max-w-md text-white/95">
                  {language === 'ar'
                    ? 'الأناقة تبدأ بالتفاصيل الهادئة والتصميم الأصيل.'
                    : language === 'fr'
                    ? 'L’élégance commence par la simplicité et le soin des détails.'
                    : 'Elegance begins in the quiet details of true craftsmanship.'}
                </h2>
              </div>

              <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-neutral-300">
                <span className="font-latin tracking-[0.2em] uppercase text-[10px] text-white/70">
                  Operations & Management Division
                </span>
                <span className="text-white/50 text-[10px] font-latin">© 2026 MIEE</span>
              </div>
            </div>
          </div>

          {/* Right Side: The Luxury Form & Authentication */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`flex-1 min-h-screen flex flex-col justify-between p-10 lg:p-14 bg-[#f5f2ed] ${
              isRtl ? 'font-arabic text-right' : 'font-latin text-left'
            }`}
          >
            {/* Top Bar inside right side */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-ink/10">
              <button
                type="button"
                onClick={onBackToStore}
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                title={language === 'ar' ? 'الذهاب إلى الصفحة الرئيسية' : 'Retour à la boutique'}
              >
                <BrandLogo textColor="text-ink" />
                <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-orange font-latin">
                  Backoffice
                </span>
              </button>

              <div className="flex items-center gap-3" dir="ltr">
                <div className="flex items-center gap-1 border border-ink/15 rounded-none p-1 bg-white/70 text-[10px] font-latin font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`px-2 py-0.5 rounded-none font-arabic transition-colors duration-150 ${
                      language === 'ar' ? 'bg-ink text-white shadow-xs' : 'text-neutral-600 hover:text-ink'
                    }`}
                  >
                    ع
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-1.5 py-0.5 rounded-none transition-colors duration-150 ${
                      language === 'en' ? 'bg-ink text-white shadow-xs' : 'text-neutral-600 hover:text-ink'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`px-1.5 py-0.5 rounded-none transition-colors duration-150 ${
                      language === 'fr' ? 'bg-ink text-white shadow-xs' : 'text-neutral-600 hover:text-ink'
                    }`}
                  >
                    FR
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onBackToStore}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-ink/15 bg-white/70 hover:bg-ink hover:text-white text-xs font-medium transition-colors shadow-2xs"
                >
                  <span>{at.viewStore}</span>
                  <span className="font-latin text-xs">{isRtl ? '↖' : '↗'}</span>
                </button>
              </div>
            </div>

            {/* Center Form Container */}
            <div className="w-full max-w-md mx-auto my-auto py-8">
              <div className="bg-white p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-ink/10 rounded-none relative">
                {/* Luxury Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-ink" />

                <div className="mb-8">
                  <span className="block text-[10px] font-latin tracking-[0.25em] uppercase text-orange font-bold mb-2">
                    PRIVILEGED ATELIER ACCESS
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink">
                    {at.loginTitle}
                  </h1>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {at.loginDesc}
                  </p>
                </div>

                {loginError && (
                  <div className="mb-6 p-4 bg-red-50/70 border-l-2 border-red-600 text-red-800 text-xs rounded-none leading-relaxed flex items-start gap-2.5">
                    <span className="text-sm">⚠</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 mb-2">
                      {at.emailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={at.emailPlaceholder}
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full h-12 px-4 bg-paper/60 border border-ink/15 text-xs outline-none focus:border-ink focus:bg-white transition-all font-latin"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 mb-2">
                      {at.passwordLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={at.passwordPlaceholder}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className={`w-full h-12 ${
                          isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'
                        } bg-paper/60 border border-ink/15 text-xs outline-none focus:border-ink focus:bg-white transition-all font-latin`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isRtl ? 'left-3.5' : 'right-3.5'
                        } text-neutral-400 hover:text-ink transition-colors p-1 flex items-center justify-center`}
                        title={
                          showPassword
                            ? language === 'ar'
                              ? 'إخفاء كلمة المرور'
                              : 'Hide password'
                            : language === 'ar'
                            ? 'إظهار كلمة المرور'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Option (Desktop) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setRememberMe(checked);
                            if (!checked) {
                              localStorage.setItem('miee_remember_me', 'false');
                              localStorage.removeItem('miee_remember_password');
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded-none border border-ink/30 bg-[#faf8f5] peer-checked:bg-ink peer-checked:border-ink transition-all flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-3 h-3 text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs text-ink/75 group-hover:text-ink transition-colors font-medium">
                          {at.rememberMe}
                        </span>
                      </label>

                      {rememberMe && adminPassword && (
                        <button
                          type="button"
                          onClick={handleClearSavedCredentials}
                          className="text-[11px] text-neutral-500 hover:text-red-600 underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          {language === 'ar' ? 'تسجيل الخروج بدون تذكرني' : 'Oublier mes identifiants'}
                        </button>
                      )}
                    </div>

                    {rememberMe && adminPassword && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                        <span className="text-emerald-600">✓</span>
                        <span>{language === 'ar' ? 'كلمة المرور محفوظة تلقائياً عبر ميزة (تذكرني)' : 'Mot de passe mémorisé automatiquement'}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full mt-4 h-13 bg-ink text-white text-xs font-semibold tracking-[0.18em] uppercase hover:bg-neutral-800 transition-all flex items-center justify-between px-6 disabled:opacity-60 group shadow-xs"
                  >
                    <span>
                      {isLoggingIn
                        ? language === 'ar'
                          ? 'جارٍ التحقق...'
                          : language === 'fr'
                          ? 'Vérification...'
                          : 'Authenticating...'
                        : at.loginSubmit}
                    </span>
                    <span className="font-latin text-base transition-transform group-hover:translate-x-1">
                      {isRtl ? '←' : '→'}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom subtle copyright */}
            <div className="pt-6 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 gap-2">
              <span className="font-latin tracking-[0.15em] uppercase">M I E E  ·  O F F I C I A L  P O R T A L</span>
              <button
                onClick={onBackToStore}
                className="hover:text-ink underline underline-offset-4 transition-colors"
              >
                {at.backToStore}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      dir={dir}
      className={`min-h-screen bg-[#f8f9fa] text-ink flex flex-col selection:bg-orange selection:text-white ${
        isRtl ? 'font-arabic' : 'font-latin'
      }`}
    >
      {/* ======================================================== */}
      {/* TOP ATELIER EXECUTIVE NAVIGATION (LUXURY MAISON CONSOLE) */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md text-white border-b border-white/10 px-4 sm:px-8 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.18)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Monogram */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onBackToStore}
              className="flex items-center cursor-pointer group text-left transition-opacity hover:opacity-85"
              title={language === 'ar' ? 'الذهاب إلى الصفحة الرئيسية للمتجر' : 'Retour à la boutique'}
              aria-label="Back to Store"
            >
              <BrandLogo textColor="text-white" />
            </button>
          </div>

          {/* Right: Language, View Store & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
            {/* Language Switcher Pill */}
            <div className="flex items-center p-1 rounded-full border border-white/15 bg-white/5 text-[10px] font-latin font-bold">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 font-arabic rounded-full transition-all ${
                  language === 'ar' ? 'bg-white text-ink shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                ع
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === 'en' ? 'bg-white text-ink shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === 'fr' ? 'bg-white text-ink shadow-xs' : 'text-white/60 hover:text-white'
                }`}
              >
                FR
              </button>
            </div>

            {/* View Live Boutique */}
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <span>{at.viewStore}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-xl"
              title={at.logout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">{at.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN ATELIER CONTENT CONTAINER */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-7">
        {/* Welcome & Title Header */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-800 tracking-wide font-arabic">
                {language === 'ar' ? 'المتجر نشط · متصل مباشرة' : 'Boutique en direct · Connecté'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {language === 'ar'
                ? 'لوحة القيادة ومتابعة المتجر'
                : language === 'fr'
                ? 'Tableau de Bord & Atelier'
                : 'Dashboard & Store Atelier'}
            </h1>
          </div>

          {newOrdersCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-xl text-xs font-bold shadow-md shadow-orange/20 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>
                  {language === 'ar'
                    ? `لديك ${newOrdersCount} طلبات جديدة تنتظر المتابعة`
                    : language === 'fr'
                    ? `${newOrdersCount} nouvelle(s) commande(s) en attente`
                    : `${newOrdersCount} new order(s) awaiting review`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODERN SEGMENTED CAPSULE TABS */}
        {/* ======================================================== */}
        <div className="bg-neutral-200/60 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1.5 border border-neutral-300/40 backdrop-blur-xs text-xs font-semibold">
          {/* Tab 1: Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[180px] py-3 px-5 flex items-center justify-center gap-2.5 transition-all rounded-xl cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-neutral-900 font-bold shadow-sm border border-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>{at.tabs.orders}</span>
            <span className={`font-latin text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'orders' ? 'bg-neutral-100 text-neutral-900' : 'bg-black/5 text-neutral-600'}`}>
              {orders.length}
            </span>
            {newOrdersCount > 0 && (
              <span className="bg-orange text-white text-[10px] px-2 py-0.5 font-latin font-bold rounded-full leading-none animate-pulse">
                {newOrdersCount} {at.tabs.newBadge}
              </span>
            )}
          </button>

          {/* Tab 2: Products */}
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[180px] py-3 px-5 flex items-center justify-center gap-2.5 transition-all rounded-xl cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-neutral-900 font-bold shadow-sm border border-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{at.tabs.products}</span>
            <span className={`font-latin text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'products' ? 'bg-neutral-100 text-neutral-900' : 'bg-black/5 text-neutral-600'}`}>
              {products.length}
            </span>
          </button>

          {/* Tab 3: Shipping */}
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 min-w-[180px] py-3 px-5 flex items-center justify-center gap-2.5 transition-all rounded-xl cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-white text-neutral-900 font-bold shadow-sm border border-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2" />
            </svg>
            <span>{at.tabs.shipping}</span>
            <span className={`font-latin text-[11px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'shipping' ? 'bg-neutral-100 text-neutral-900' : 'bg-black/5 text-neutral-600'}`}>
              58
            </span>
          </button>

          {/* Tab 4: Store Visuals & Banners */}
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex-1 min-w-[180px] py-3 px-5 flex items-center justify-center gap-2.5 transition-all rounded-xl cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-white text-neutral-900 font-bold shadow-sm border border-black/5'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{at.tabs.banners}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORDERS COMMAND CENTER */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 4 Haute KPI Metric Cards (Interactive) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Total Orders (Clickable) */}
              <button
                type="button"
                onClick={() => scrollToOrders('all')}
                className={`text-start bg-white p-6 rounded-2xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden ${
                  orderStatusFilter === 'all' && activeTab === 'orders'
                    ? 'border-neutral-900 ring-2 ring-neutral-900/10'
                    : 'border-neutral-200/80 hover:border-neutral-300'
                }`}
                title={language === 'ar' ? 'انقر لعرض جميع الطلبيات الحقيقية' : 'Click to view all real orders'}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {at.metrics.totalOrders}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-extrabold font-latin text-neutral-900">{orders.length}</h3>
                  <span className="text-[11px] text-orange font-bold">
                    {language === 'ar' ? '← عرض الكل' : 'View all →'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1.5 block">{at.metrics.totalOrdersSub}</span>
                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900/10 group-hover:bg-neutral-900 transition-colors" />
              </button>

              {/* Metric 2: Pending Orders (Clickable) */}
              <button
                type="button"
                onClick={() => scrollToOrders('new')}
                className={`text-start bg-white p-6 rounded-2xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden ${
                  orderStatusFilter === 'new' && activeTab === 'orders'
                    ? 'border-orange ring-2 ring-orange/20'
                    : 'border-neutral-200/80 hover:border-orange/60'
                }`}
                title={language === 'ar' ? 'انقر لتصفية الطلبات الجديدة' : 'Click to filter new orders'}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-orange uppercase tracking-wider">
                    {at.metrics.pendingOrders}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center text-orange group-hover:bg-orange group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-extrabold font-latin text-orange">{newOrdersCount}</h3>
                  <span className="text-[11px] text-orange font-bold">
                    {language === 'ar' ? '← تصفية' : 'Filter →'}
                  </span>
                </div>
                <span className="text-[10px] text-orange mt-1.5 block font-medium">{at.metrics.pendingOrdersSub}</span>
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange" />
              </button>

              {/* Metric 3: Shipped Orders (Clickable) */}
              <button
                type="button"
                onClick={() => scrollToOrders('shipped')}
                className={`text-start bg-white p-6 rounded-2xl border shadow-xs relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden ${
                  orderStatusFilter === 'shipped' && activeTab === 'orders'
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                    : 'border-neutral-200/80 hover:border-emerald-600/50'
                }`}
                title={language === 'ar' ? 'انقر لتصفية الطلبات المشحونة' : 'Click to filter shipped orders'}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {at.metrics.shippedOrders}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-extrabold font-latin text-emerald-700">{shippedOrdersCount}</h3>
                  <span className="text-[11px] text-emerald-700/80 font-bold">
                    {language === 'ar' ? '← تصفية' : 'Filter →'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 mt-1.5 block">{at.metrics.shippedOrdersSub}</span>
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600/30 group-hover:bg-emerald-600 transition-colors" />
              </button>

              {/* Metric 4: Gross Revenue (Clickable) */}
              <button
                type="button"
                onClick={() => scrollToOrders('all')}
                className="text-start bg-white p-6 rounded-2xl border border-neutral-200/80 hover:border-neutral-400 shadow-xs relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 focus:outline-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {at.metrics.totalRevenue}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <span className="font-latin font-bold text-xs">DZD</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold font-arabic text-neutral-900">
                  {totalRevenue.toLocaleString('fr-FR')} دج
                </h3>
                <span className="text-[10px] text-neutral-400 mt-1.5 block">{at.metrics.totalRevenueSub}</span>
                <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900/10 group-hover:bg-neutral-900 transition-colors" />
              </button>
            </div>

            {/* Modern Search & Filter Command Strip */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar with icon */}
              <div className="relative flex-1 max-w-lg">
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'} text-neutral-400 pointer-events-none`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={at.orders.searchPlaceholder}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className={`w-full h-11 ${
                    isRtl ? 'pr-10 pl-9' : 'pl-10 pr-9'
                  } bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all font-arabic`}
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch('')}
                    className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-neutral-400 hover:text-neutral-900 text-xs p-1`}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Pills with Dynamic Counters & Purge Action */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5">
                  {(['all', 'new', 'confirmed', 'shipped', 'cancelled'] as const).map((st) => {
                    const labels = {
                      all: at.orders.filterAll,
                      new: at.orders.filterNew,
                      confirmed: at.orders.filterConfirmed,
                      shipped: at.orders.filterShipped,
                      cancelled: at.orders.filterCancelled
                    };
                    const count = statusCounts[st];
                    const isActive = orderStatusFilter === st;

                    return (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3.5 py-2 border rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                          isActive
                            ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{labels[st]}</span>
                        <span
                          className={`text-[10px] font-latin px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : st === 'new' && count > 0
                              ? 'bg-orange text-white'
                              : 'bg-black/5 text-neutral-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Clear Test / Fake Orders Button */}
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllOrders}
                    className="px-3.5 py-2 text-xs border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-1.5 font-semibold cursor-pointer shrink-0 shadow-2xs"
                    title={language === 'ar' ? 'حذف كافة الطلبات التجريبية والوهمية والبدء من الصفر' : 'Purge test orders'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>
                      {language === 'ar'
                        ? 'تصفير الطلبات ومسح السجل (0)'
                        : language === 'fr'
                        ? 'Purger les tests (0)'
                        : 'Purge test orders (0)'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed */}
            <div id="orders-feed-section" className="scroll-mt-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 sm:p-16 text-center border border-neutral-200/80 rounded-2xl shadow-xs space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-base font-bold text-neutral-900">{at.orders.noOrders}</p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {orderSearch ? 'جرّب تغيير كلمات البحث أو مسح الفلتر' : 'ستظهر الطلبيات الجديدة هنا فور تسجيل الزبائن لطلباتهم في المتجر'}
                </p>
                {orders.length > 0 && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleClearAllOrders}
                      className="px-4 py-2 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>
                        {language === 'ar'
                          ? 'تصفير العداد وحذف كافة الطلبات المسجلة (العودة إلى 0)'
                          : 'Purger toutes les commandes et réinitialiser à 0'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all duration-200 relative overflow-hidden flex flex-col gap-4"
                  >
                    {/* Top Status Border Strip */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        ord.status === 'new'
                          ? 'bg-amber-500'
                          : ord.status === 'confirmed'
                          ? 'bg-blue-600'
                          : ord.status === 'shipped'
                          ? 'bg-emerald-600'
                          : 'bg-rose-500'
                      }`}
                    />

                    {/* Card Top Bar: Order ID, Timestamp, Status Badge, and Delete Button */}
                    <div className="flex items-center justify-between gap-3 flex-wrap border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Order ID Pill */}
                        <span className="font-mono text-xs font-bold bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200/80 text-neutral-900 select-all">
                          #{ord.orderId}
                        </span>

                        {/* Date & Time */}
                        <span className="text-xs text-neutral-400 font-latin font-medium flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatOrderDate(ord.createdAt)}</span>
                        </span>

                        {/* Current Status Pill */}
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            ord.status === 'new'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                              : ord.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : ord.status === 'shipped'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ord.status === 'new'
                                ? 'bg-amber-500 animate-pulse'
                                : ord.status === 'confirmed'
                                ? 'bg-blue-600'
                                : ord.status === 'shipped'
                                ? 'bg-emerald-600'
                                : 'bg-rose-600'
                            }`}
                          />
                          <span>
                            {ord.status === 'new'
                              ? at.orders.statusNew
                              : ord.status === 'confirmed'
                              ? at.orders.statusConfirmed
                              : ord.status === 'shipped'
                              ? at.orders.statusShipped
                              : at.orders.statusCancelled}
                          </span>
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRequestDeleteOrder(ord)}
                        className="w-8 h-8 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                        title={at.orders.deleteBtn}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Main Middle Row: Customer Info & Financials */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-start">
                      {/* Left: Customer Info, Direct Contact & Delivery */}
                      <div className="space-y-3 min-w-0">
                        {/* Customer Name */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {(ord.customerName?.trim() || 'C')[0].toUpperCase()}
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
                            {ord.customerName?.trim() || (language === 'ar' ? 'طلب بدون اسم' : 'Client')}
                          </h4>
                        </div>

                        {/* Direct Contact Buttons & Location */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct Phone Call Button */}
                          <a
                            href={`tel:${ord.phone}`}
                            className="text-xs font-latin font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 rounded-xl px-3 py-1.5 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                            title="اتصال هاتفي مباشر"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{ord.phone}</span>
                          </a>

                          {/* Wilaya & Delivery Method */}
                          <span className="text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5 font-medium shadow-2xs">
                            <span>📍</span>
                            <b>{ord.wilayaName}</b>
                            <span className="text-neutral-400 font-normal">
                              ({ord.deliveryMethod === 'home' ? at.orders.homeDelivery : at.orders.officeDelivery})
                            </span>
                          </span>
                        </div>

                        {/* Delivery Address Note if available */}
                        {ord.address && (
                          <div className="text-xs text-neutral-700 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 leading-relaxed flex items-start gap-2">
                            <span className="text-amber-700 mt-0.5">🏠</span>
                            <div>
                              <strong className="font-semibold text-neutral-900">{at.orders.addressLabel}</strong>{' '}
                              <span>{ord.address}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Financials */}
                      <div className="flex flex-col items-start lg:items-end justify-center bg-neutral-50/80 lg:bg-transparent p-4 lg:p-0 rounded-2xl border lg:border-none border-neutral-200/80 min-w-[200px]">
                        <div className={`${isRtl ? 'text-right' : 'text-left lg:text-right'}`}>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                            {at.orders.totalToCollect}
                          </span>
                          <strong className="text-2xl font-arabic font-extrabold text-neutral-900 block mt-0.5">
                            {Number(ord.total).toLocaleString('fr-FR')} دج
                          </strong>
                          {ord.shipping === 0 ? (
                            <span className="text-[10px] text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold inline-block mt-1">
                              {language === 'ar' ? 'توصيل مجاني (0 دج)' : 'Free Shipping (0 DZD)'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-500 font-latin block mt-0.5">
                              +{Number(ord.shipping).toLocaleString('fr-FR')} دج شحن
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Ordered Items Card - Clear, Detailed and Haute Couture */}
                    <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-4 space-y-3.5">
                      {/* Section Title */}
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🛍️</span>
                          <span className="font-arabic font-bold text-neutral-900">
                            {at.orders.orderedItemsTitle}
                          </span>
                        </div>
                        <span className="text-[11px] font-latin font-bold text-neutral-600 bg-white border border-neutral-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
                          {ord.items?.length || 0}{' '}
                          {language === 'ar'
                            ? (ord.items?.length === 1 ? 'قطعة' : 'قطع')
                            : (ord.items?.length || 0) > 1
                            ? 'items'
                            : 'item'}
                        </span>
                      </div>

                      {/* Items Cards */}
                      <div className="space-y-2.5">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((it: any, idx: number) => {
                            const swatch = getKnownColorSwatch(it.color || '');
                            const itemName = it.name || it.title || (language === 'ar' ? 'قطعة بدون اسم' : 'Unnamed piece');
                            const itemQty = Number(it.qty) || 1;
                            const itemPrice = Number(it.price) || 0;
                            const lineTotal = itemPrice * itemQty;
                            // Attempt to get product image from item or catalog match
                            const catalogMatch = products.find(
                              (p) => p.id === it.id || p.name?.trim().toLowerCase() === String(itemName).trim().toLowerCase()
                            );
                            const itemImg = it.image || catalogMatch?.image || '';

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors"
                              >
                                {/* Left/Start: Thumbnail + Name + Spec Badges */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {/* Thumbnail */}
                                  {itemImg ? (
                                    <img
                                      src={itemImg}
                                      alt={itemName}
                                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 bg-neutral-100 shadow-2xs"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center text-lg shadow-2xs">
                                      👗
                                    </div>
                                  )}

                                  {/* Info */}
                                  <div className="min-w-0 space-y-1.5">
                                    <h5 className="font-bold text-sm text-neutral-900 truncate">
                                      {itemName}
                                    </h5>

                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      {/* Color Badge */}
                                      {it.color && (
                                        <span className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/90 px-2.5 py-1 rounded-lg text-neutral-800 shadow-2xs">
                                          <span className="text-[10px] text-neutral-400 font-normal">
                                            {at.orders.colorLabel}
                                          </span>
                                          <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15 shadow-2xs"
                                            style={{ backgroundColor: swatch }}
                                          />
                                          <strong className="font-semibold text-neutral-900">{it.color}</strong>
                                        </span>
                                      )}

                                      {/* Size Badge */}
                                      {it.size && (
                                        <span className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/90 px-2.5 py-1 rounded-lg text-neutral-800 shadow-2xs">
                                          <span className="text-[10px] text-neutral-400 font-normal">
                                            {at.orders.sizeLabel}
                                          </span>
                                          <strong className="font-bold text-neutral-900 font-latin">{it.size}</strong>
                                        </span>
                                      )}

                                      {/* Quantity Badge */}
                                      <span className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                                        <span className="text-[10px] text-neutral-300 font-normal">
                                          {at.orders.qtyLabel}
                                        </span>
                                        <strong className="font-bold font-latin text-xs">×{itemQty}</strong>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right/End: Price Information (if available) */}
                                {itemPrice > 0 && (
                                  <div className={`${isRtl ? 'sm:text-left' : 'sm:text-right'} shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100`}>
                                    <span className="text-[10px] text-neutral-400 block font-normal">
                                      {at.orders.itemTotalLabel}
                                    </span>
                                    <strong className="text-sm font-arabic font-extrabold text-neutral-900 block">
                                      {Number(lineTotal).toLocaleString('fr-FR')} دج
                                    </strong>
                                    {itemQty > 1 && (
                                      <span className="text-[10px] text-neutral-400 font-latin block">
                                        ({Number(itemPrice).toLocaleString('fr-FR')} دج {at.orders.unitPriceLabel})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-neutral-400 p-3 text-center bg-white rounded-xl border border-neutral-200/70">
                            {language === 'ar' ? 'لا توجد منتجات مسجلة' : 'No items registered'}
                          </div>
                        )}
                      </div>

                      {/* Underneath Customer Items: Order Status Dropdown Selector (Returned to clean select) */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <label className="text-xs font-bold text-neutral-800">
                            {language === 'ar' ? 'حالة الطلب:' : language === 'fr' ? 'Statut de la commande :' : 'Order Status:'}
                          </label>
                          <select
                            value={ord.status || 'new'}
                            onChange={(e) =>
                              updateOrderStatus(ord.orderId, e.target.value as FirebaseOrder['status'])
                            }
                            className="h-10 text-xs bg-white border border-neutral-300 rounded-xl px-3.5 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 font-bold text-neutral-900 cursor-pointer transition-all shadow-2xs"
                          >
                            <option value="new">{at.orders.statusNew}</option>
                            <option value="confirmed">{at.orders.statusConfirmed}</option>
                            <option value="shipped">{at.orders.statusShipped}</option>
                            <option value="cancelled">{at.orders.statusCancelled}</option>
                          </select>
                        </div>

                        <span className="text-[11px] text-neutral-400 font-medium">
                          {language === 'ar' ? '⚡ التغيير يُحفظ فوراً في قاعدة البيانات' : 'Changes save instantly'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRODUCTS STUDIO (HAUTE COUTURE CATALOG) */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-[540px_1fr] xl:grid-cols-[600px_1fr] 2xl:grid-cols-[640px_1fr] gap-8 items-start"
          >
            {/* Left: Add New Product Form - Atelier Création Studio */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900 rounded-t-3xl" />

              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900">{at.products.addTitle}</h3>
                <p className="text-xs text-neutral-500 mt-1">{at.products.addDesc}</p>
              </div>

              {productSuccessMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{productSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddProduct} className="space-y-6 text-xs">
                {/* ---------------------------------------------------- */}
                {/* SECTION 1: BASIC INFORMATION & PRICING */}
                {/* ---------------------------------------------------- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      {language === 'ar' ? '01 · تفاصيل القطعة والتسعير' : '01 · Piece Details & Pricing'}
                    </span>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block font-semibold mb-1.5 text-neutral-900 text-xs">{at.products.nameLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={at.products.namePlaceholder}
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-arabic text-xs"
                    />
                  </div>

                  {/* Price & Tag */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1.5 text-neutral-900 text-xs">{at.products.priceLabel}</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="6500"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin font-bold text-xs"
                        />
                        <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3.5' : 'right-3.5'} text-[11px] text-neutral-400 font-arabic pointer-events-none`}>
                          دج
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1.5 text-neutral-900 text-xs">{at.products.tagLabel}</label>
                      <select
                        value={newProdTag}
                        onChange={(e) => setNewProdTag(e.target.value as any)}
                        className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-medium text-xs"
                      >
                        <option value="">{at.products.tagNone}</option>
                        <option value="جديد">{at.products.tagNew}</option>
                        <option value="الأكثر طلباً">{at.products.tagBestseller}</option>
                        <option value="PROMO">🏷️ {at.products.tagPromo || 'PROMO'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Stock Availability for New Product */}
                  <div className="bg-neutral-50/80 p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-neutral-900 text-xs">
                        {language === 'ar' ? 'حالة التوفر في المخزون' : language === 'fr' ? 'Disponibilité en stock' : 'Stock Availability'}
                      </label>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          newProdInStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {newProdInStock
                          ? (language === 'ar' ? 'متاح للطلب' : 'En stock')
                          : (language === 'ar' ? 'غير متوفر (مقفل)' : 'Épuisé')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setNewProdInStock(true)}
                        className={`h-10 px-3.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          newProdInStock
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-xs'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{language === 'ar' ? 'متوفر للطلب' : 'En stock'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProdInStock(false)}
                        className={`h-10 px-3.5 border rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          !newProdInStock
                            ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold shadow-xs'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{language === 'ar' ? 'غير متوفر (قفل الطلب)' : 'Épuisé'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 2: SIZES & MEASUREMENTS SUITE */}
                {/* ---------------------------------------------------- */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      {language === 'ar' ? '02 · بطاقة المقاسات والمعايير' : '02 · Sizes & Measurements'}
                    </span>
                  </div>

                  <AdminSizeSelectorCard
                    value={newProdSizes}
                    onChange={setNewProdSizes}
                    language={language}
                  />
                </div>

                {/* ---------------------------------------------------- */}
                {/* SECTION 3: COLORS & MEDIA STUDIO */}
                {/* ---------------------------------------------------- */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      {language === 'ar' ? '03 · بطاقة الألوان وصور العرض' : '03 · Colors & Imagery'}
                    </span>
                  </div>

                  {/* Colors Selector Card - Exact match with Sizes Selector */}
                  <AdminColorSelectorCard
                    value={newProdColors}
                    onChange={setNewProdColors}
                    language={language}
                  />

                  {/* Image URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-neutral-900 text-xs">{at.products.imageLabel}</label>
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        disabled={isUploadingMainImage}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{language === 'ar' ? 'رفع من الهاتف / الكاميرا' : language === 'fr' ? 'Téléverser photo' : 'Upload photo'}</span>
                      </button>
                    </div>
                    <input
                      type="url"
                      required
                      placeholder={at.products.imagePlaceholder}
                      value={newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin text-xs"
                    />

                    {/* Hidden Main Image File Input */}
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImageUpload}
                    />

                    {/* Upload button and status */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        disabled={isUploadingMainImage}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
                      >
                        {isUploadingMainImage ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{language === 'ar' ? 'جاري ضغط ورفع الصورة...' : language === 'fr' ? 'Téléversement en cours...' : 'Uploading image...'}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{language === 'ar' ? 'اختيار صورة من الهاتف أو الكاميرا' : language === 'fr' ? 'Choisir depuis le téléphone' : 'Choose from device'}</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'ar' ? 'ضغط تلقائي فوري لتوفير المساحة وسرعة التصفح' : language === 'fr' ? 'Compression auto pour chargement rapide' : 'Smart compression for fast loading'}
                      </span>
                    </div>
                  </div>

                  {/* Additional Images (Gallery) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-semibold text-neutral-900 text-xs">
                        {language === 'ar'
                          ? 'صور إضافية للمعرض (رابط في كل سطر)'
                          : language === 'fr'
                          ? 'Images supplémentaires de la galerie (une URL par ligne)'
                          : 'Additional Gallery Images (one URL per line)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isUploadingGalleryImages}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{language === 'ar' ? 'رفع صور متعددة' : language === 'fr' ? 'Sélectionner photos' : 'Select photos'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={newProdAdditionalImages}
                      onChange={(e) => setNewProdAdditionalImages(e.target.value)}
                      placeholder="https://...&#10;https://..."
                      className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin text-xs"
                    />

                    {/* Hidden Multi Gallery Files Input */}
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryImagesUpload}
                    />

                    {/* Gallery upload button and info */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isUploadingGalleryImages}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer border border-neutral-300/80 shadow-2xs"
                      >
                        {isUploadingGalleryImages ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-neutral-600/30 border-t-neutral-800 rounded-full animate-spin" />
                            <span>{galleryUploadProgress || (language === 'ar' ? 'جاري ضغط ورفع الصور...' : 'Uploading...')}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{language === 'ar' ? 'رفع صور متعددة للمعرض من الهاتف' : language === 'fr' ? 'Téléverser plusieurs photos (galerie)' : 'Upload multiple photos (gallery)'}</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'ar' ? '(يمكنك تحديد أكثر من صورة دفعة واحدة)' : language === 'fr' ? '(sélectionnez plusieurs images)' : '(select multiple images)'}
                      </span>
                    </div>

                    {/* Live Gallery Preview in Add Form */}
                    {(() => {
                      const urls = newProdAdditionalImages
                        .split(/\r?\n/)
                        .map((u) => u.trim())
                        .filter((u) => u.length > 5);
                      if (urls.length === 0) return null;
                      return (
                        <div className="mt-2.5 p-2.5 bg-neutral-100/70 border border-neutral-200/80 rounded-xl space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600">
                            <span>{language === 'ar' ? 'معاينة الصور الإضافية للمعرض:' : 'Gallery Images Preview:'}</span>
                            <span className="font-latin text-orange-600 font-bold">({urls.length})</span>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto py-1">
                            {urls.map((url, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-[3/4] w-14 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-2xs group"
                              >
                                <img
                                  src={url}
                                  alt={`Gallery ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.opacity = '0.35';
                                    e.currentTarget.title = 'تعذر تحميل هذا الرابط - يرجى التأكد منه';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(idx, false)}
                                  title={language === 'ar' ? 'حذف هذه الصورة من المعرض' : 'Remove this image'}
                                  className="absolute top-1 left-1 w-4 h-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs active:scale-90 transition-all cursor-pointer"
                                >
                                  ×
                                </button>
                                <span className="absolute bottom-1 right-1 bg-neutral-900/85 backdrop-blur-xs text-white text-[8px] px-1.5 py-0.5 rounded font-latin font-bold">
                                  #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Live Fashion Portrait Preview (3:4 aspect ratio) */}
                  {newProdImage && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-latin">
                        Live Lookbook Preview
                      </span>
                      <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto bg-neutral-100 rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs">
                        <img
                          src={newProdImage}
                          alt="Lookbook Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        {newProdTag && (
                          <span className={`absolute top-2.5 right-2.5 text-white text-[9px] px-2.5 py-1 rounded-full font-bold uppercase shadow-sm ${
                            newProdTag === 'PROMO' ? 'bg-rose-700' : newProdTag === 'الأكثر طلباً' ? 'bg-[#5c4d44]' : 'bg-orange'
                          }`}>
                            {newProdTag}
                          </span>
                        )}
                        <span className="absolute bottom-2.5 left-2.5 bg-neutral-900/80 backdrop-blur-md rounded-lg text-white text-[10px] font-bold px-2.5 py-1 font-latin">
                          {newProdPrice ? `${newProdPrice} DZD` : 'MIEE'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="w-full mt-3 h-13 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-black active:scale-[0.99] transition-all disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSavingProduct ? (
                    <span>{at.products.savingBtn}</span>
                  ) : (
                    <>
                      <span>{at.products.submitBtn}</span>
                      <span className="font-latin">{isRtl ? '←' : '→'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Current Collection Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    {at.products.listTitle}
                  </h3>
                  <span className="text-xs text-neutral-500 font-latin font-medium">
                    {products.length} {products.length === 1 ? 'Piece' : 'Pieces'} in Active Collection
                  </span>
                </div>
                <span className="text-xs text-neutral-400">{at.products.listSub}</span>
              </div>

              {/* Products Grid: Compact Squares on Mobile (2 columns), Haute Couture Portrait on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-neutral-200/80 rounded-xl sm:rounded-2xl shadow-2xs hover:shadow-md hover:border-neutral-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden"
                  >
                    {/* Photo Container: aspect-square on Mobile, aspect-[3/4] on Desktop */}
                    <div className="relative aspect-square sm:aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          prod.inStock === false ? 'grayscale-[35%] opacity-85' : ''
                        }`}
                      />

                      {/* Availability Quick Toggle Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleProductStock(prod)}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 z-20 text-[8px] sm:text-[9px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all ${
                          prod.inStock !== false
                            ? 'bg-emerald-700/95 hover:bg-emerald-800 text-white'
                            : 'bg-rose-800/95 hover:bg-rose-900 text-white'
                        }`}
                        title={
                          prod.inStock !== false
                            ? (language === 'ar' ? 'انقر للتحويل إلى: غير متوفر (قفل زر الطلب)' : 'Click to mark out of stock')
                            : (language === 'ar' ? 'انقر للتحويل إلى: متوفر في المخزون' : 'Click to mark in stock')
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prod.inStock !== false ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'
                          }`}
                        />
                        <span>
                          {prod.inStock !== false
                            ? (language === 'ar' ? 'متوفر' : language === 'fr' ? 'En stock' : 'In stock')
                            : (language === 'ar' ? 'غير متوفر' : language === 'fr' ? 'Épuisé' : 'Out of stock')}
                        </span>
                      </button>

                      {/* Tag Badge */}
                      {prod.tag && (
                        <span className={`absolute top-2 sm:top-3 right-2 sm:right-3 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold uppercase shadow-sm z-20 ${
                          prod.tag === 'PROMO' || prod.tagStyle === 'promo' ? 'bg-rose-700' : prod.tagStyle === 'soft' ? 'bg-[#5c4d44]' : 'bg-orange'
                        }`}>
                          {prod.tag}
                        </span>
                      )}

                      {/* Price Strip */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-20">
                        <span className="bg-neutral-900/85 backdrop-blur-md rounded-lg sm:rounded-xl text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1.5 font-arabic shadow-sm">
                          {Number(prod.price).toLocaleString('fr-FR')} دج
                        </span>
                      </div>
                    </div>

                    {/* Product Details & Actions */}
                    <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate mb-0.5">
                            {prod.name}
                          </h4>
                          <span
                            className={`hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              prod.inStock !== false
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {prod.inStock !== false
                              ? (language === 'ar' ? 'متاح للطلب' : 'Disponible')
                              : (language === 'ar' ? 'مغلق' : 'Bloqué')}
                          </span>
                        </div>
                        <span className="hidden sm:block text-[10px] text-neutral-400 font-mono">#{prod.id}</span>
                      </div>

                      {/* Desktop Sizes & Colors Block */}
                      <div className="hidden sm:block text-[11px] text-neutral-600 space-y-1.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-neutral-400 text-[10px] shrink-0 font-medium">{at.products.sizesText}:</span>
                          {(prod.sizes || []).map((sz) => (
                            <span
                              key={sz}
                              className="px-2 py-0.5 bg-white border border-neutral-200 rounded-md text-[10px] font-bold font-latin text-neutral-800 shadow-2xs"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                        <p className="truncate">
                          <span className="text-neutral-400 font-medium">{at.products.colorsText}:</span>{' '}
                          <b className="text-neutral-900">{prod.colors?.join(', ')}</b>
                        </p>
                      </div>

                      {/* Mobile Compact Specs */}
                      <div className="sm:hidden flex items-center justify-between text-[10px] text-neutral-500 font-latin truncate gap-1 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-200/50">
                        <span className="font-bold text-neutral-700 truncate">
                          {(prod.sizes || []).join('/')}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="truncate text-neutral-600 font-arabic text-[9px]">
                          {prod.colors?.[0] || ''}
                        </span>
                      </div>

                      {/* Action Buttons: Preview + Edit + Delete */}
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(prod)}
                          className="h-8 sm:h-9 w-8 sm:w-auto sm:px-3 border border-neutral-200 text-neutral-700 hover:bg-orange hover:text-white hover:border-orange text-xs font-semibold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                          title={language === 'ar' ? 'معاينة بطاقة المنتج الكاملة' : 'Preview Product Card'}
                        >
                          <span className="text-xs">👁️</span>
                          <span className="hidden sm:inline">{language === 'ar' ? 'معاينة' : 'Aperçu'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEditProduct(prod)}
                          className="flex-1 h-8 sm:h-9 bg-neutral-100 hover:bg-neutral-900 text-neutral-800 hover:text-white border border-neutral-200 hover:border-neutral-900 text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{language === 'ar' ? 'تعديل' : language === 'fr' ? 'Modifier' : 'Edit'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="w-8 h-8 sm:w-9 sm:h-9 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl text-xs font-medium transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title={at.products.deleteBtn}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================== */}
            {/* HAUTE COUTURE PRODUCT EDIT MODAL */}
            {/* ======================================================== */}
            {editingProduct && (
              <div
                className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden"
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleCloseEdit();
                }}
              >
                <div
                  className="bg-white border border-neutral-200/80 shadow-2xl rounded-3xl max-w-2xl w-full relative flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900 z-20" />

                  {/* Pinned Sticky Header */}
                  <div className="shrink-0 px-6 sm:px-8 py-5 border-b border-neutral-200/70 bg-white/95 backdrop-blur-sm flex items-center justify-between z-10">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-600 font-latin block mb-0.5">
                        Édition Atelier Miee
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                        {language === 'ar'
                          ? `تعديل القطعة: ${editingProduct.name}`
                          : language === 'fr'
                          ? `Modifier la pièce: ${editingProduct.name}`
                          : `Edit Product: ${editingProduct.name}`}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className="w-9 h-9 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center text-sm cursor-pointer shrink-0"
                      title={language === 'ar' ? 'إغلاق النافذة' : 'Close'}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form with scrollable body and pinned footer */}
                  <form onSubmit={handleSaveEditedProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 overscroll-contain bg-white">
                      {/* Name */}
                      <div>
                        <label className="block font-semibold mb-1.5 text-neutral-800 text-xs">{at.products.nameLabel}</label>
                        <input
                          type="text"
                          required
                          value={editProdName}
                          onChange={(e) => setEditProdName(e.target.value)}
                          className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-arabic"
                        />
                      </div>

                      {/* Price & Tag */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold mb-1.5 text-neutral-800 text-xs">{at.products.priceLabel}</label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              min="0"
                              value={editProdPrice}
                              onChange={(e) => setEditProdPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin font-bold"
                            />
                            <span className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3.5' : 'right-3.5'} text-[11px] text-neutral-400 font-arabic pointer-events-none`}>
                              دج
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1.5 text-neutral-800 text-xs">{at.products.tagLabel}</label>
                          <select
                            value={editProdTag}
                            onChange={(e) => setEditProdTag(e.target.value as any)}
                            className="w-full h-11 px-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-medium"
                          >
                            <option value="">{at.products.tagNone}</option>
                            <option value="جديد">{at.products.tagNew}</option>
                            <option value="الأكثر طلباً">{at.products.tagBestseller}</option>
                            <option value="PROMO">🏷️ {at.products.tagPromo || 'PROMO'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Stock Status Selector */}
                      <div className="bg-neutral-50/80 p-4 sm:p-5 border border-neutral-200/80 space-y-3 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-neutral-900 text-xs">
                            {language === 'ar' ? 'حالة توفر المنتج في المخزون' : 'Disponibilité en stock'}
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              editProdInStock
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {editProdInStock
                              ? (language === 'ar' ? 'متاح للطلب' : 'En stock')
                              : (language === 'ar' ? 'غير متوفر (مقفل)' : 'Épuisé')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setEditProdInStock(true)}
                            className={`py-2.5 px-3.5 border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl ${
                              editProdInStock
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-xs'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{language === 'ar' ? 'متوفر للطلب' : 'En stock'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProdInStock(false)}
                            className={`py-2.5 px-3.5 border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl ${
                              !editProdInStock
                                ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold shadow-xs'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>{language === 'ar' ? 'نفدت الكمية (قفل الطلب)' : 'Épuisé (Bloquer)'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          {editProdInStock
                            ? (language === 'ar'
                              ? 'المنتج متوفر: يستطيع الزوار إضافته للسلة وطلبه بكل المقاسات.'
                              : 'Disponible: les clients peuvent commander ce produit.')
                            : (language === 'ar'
                              ? 'غير متوفر: سيتم قفل زر الطلب فوراً وعرض شارة «نفدت الكمية» ولن يستطيع أي زبون طلبه.'
                              : 'Épuisé: le bouton de commande sera bloqué immédiatement.')}
                        </p>
                      </div>

                      {/* Sizes Selection Card */}
                      <div>
                        <AdminSizeSelectorCard
                          value={editProdSizes}
                          onChange={setEditProdSizes}
                          language={language}
                        />
                      </div>

                      {/* Colors Selection Card */}
                      <div>
                        <AdminColorSelectorCard
                          value={editProdColors}
                          onChange={setEditProdColors}
                          language={language}
                        />
                      </div>

                      {/* Image URL */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-neutral-800 text-xs">{at.products.imageLabel}</label>
                          <button
                            type="button"
                            onClick={() => editMainFileInputRef.current?.click()}
                            disabled={isEditUploadingMainImage}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{language === 'ar' ? 'رفع من الهاتف / الكاميرا' : language === 'fr' ? 'Téléverser photo' : 'Upload photo'}</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          required
                          value={editProdImage}
                          onChange={(e) => setEditProdImage(e.target.value)}
                          className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin"
                        />

                        {/* Hidden Main Image File Input for Edit */}
                        <input
                          ref={editMainFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEditMainImageUpload}
                        />

                        {/* Edit upload button and status */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => editMainFileInputRef.current?.click()}
                            disabled={isEditUploadingMainImage}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
                          >
                            {isEditUploadingMainImage ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>{language === 'ar' ? 'جاري ضغط ورفع الصورة...' : language === 'fr' ? 'Téléversement en cours...' : 'Uploading image...'}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{language === 'ar' ? 'اختيار صورة جديدة من الهاتف' : language === 'fr' ? 'Choisir photo du téléphone' : 'Choose photo from device'}</span>
                              </>
                            )}
                          </button>
                          <span className="text-[11px] text-neutral-400">
                            {language === 'ar' ? 'ضغط تلقائي فوري لتوفير المساحة' : language === 'fr' ? 'Compression auto' : 'Auto compressed'}
                          </span>
                        </div>
                      </div>

                      {/* Additional Gallery Images */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-neutral-800 text-xs">
                            {language === 'ar'
                              ? 'صور إضافية للمعرض (رابط في كل سطر)'
                              : language === 'fr'
                              ? 'Images supplémentaires de la galerie (une URL par ligne)'
                              : 'Additional Gallery Images (one URL per line)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => editGalleryFileInputRef.current?.click()}
                            disabled={isEditUploadingGalleryImages}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{language === 'ar' ? 'رفع صور متعددة' : language === 'fr' ? 'Sélectionner photos' : 'Select photos'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={editProdAdditionalImages}
                          onChange={(e) => setEditProdAdditionalImages(e.target.value)}
                          placeholder="https://...&#10;https://..."
                          className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-latin text-xs"
                        />

                        {/* Hidden Multi Gallery Files Input for Edit */}
                        <input
                          ref={editGalleryFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleEditGalleryImagesUpload}
                        />

                        {/* Edit Gallery upload button and info */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => editGalleryFileInputRef.current?.click()}
                            disabled={isEditUploadingGalleryImages}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer border border-neutral-300/80 shadow-2xs"
                          >
                            {isEditUploadingGalleryImages ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-neutral-600/30 border-t-neutral-800 rounded-full animate-spin" />
                                <span>{editGalleryUploadProgress || (language === 'ar' ? 'جاري ضغط ورفع الصور...' : 'Uploading...')}</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{language === 'ar' ? 'رفع صور إضافية للمعرض من الهاتف' : language === 'fr' ? 'Téléverser d\'autres photos' : 'Upload gallery photos'}</span>
                              </>
                            )}
                          </button>
                          <span className="text-[11px] text-neutral-400">
                            {language === 'ar' ? '(تحديد عدة صور معاً)' : language === 'fr' ? '(sélection multiple)' : '(select multiple)'}
                          </span>
                        </div>

                        {/* Live Gallery Preview in Edit Modal */}
                        {(() => {
                          const urls = editProdAdditionalImages
                            .split(/\r?\n/)
                            .map((u) => u.trim())
                            .filter((u) => u.length > 5);
                          if (urls.length === 0) return null;
                          return (
                            <div className="mt-2.5 p-2.5 bg-neutral-100/70 border border-neutral-200/80 rounded-xl space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600">
                                <span>{language === 'ar' ? 'معاينة الصور الإضافية للمعرض:' : 'Gallery Images Preview:'}</span>
                                <span className="font-latin text-orange-600 font-bold">({urls.length})</span>
                              </div>
                              <div className="flex items-center gap-2 overflow-x-auto py-1">
                                {urls.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-[3/4] w-14 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-2xs group"
                                  >
                                    <img
                                      src={url}
                                      alt={`Gallery ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.opacity = '0.35';
                                        e.currentTarget.title = 'تعذر تحميل هذا الرابط - يرجى التأكد منه';
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGalleryImage(idx, true)}
                                      title={language === 'ar' ? 'حذف هذه الصورة من المعرض' : 'Remove this image'}
                                      className="absolute top-1 left-1 w-4 h-4 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs active:scale-90 transition-all cursor-pointer"
                                    >
                                      ×
                                    </button>
                                    <span className="absolute bottom-1 right-1 bg-neutral-900/85 backdrop-blur-xs text-white text-[8px] px-1.5 py-0.5 rounded font-latin font-bold">
                                      #{idx + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Live Image Preview in Edit Modal */}
                      {editProdImage && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-latin">
                            Lookbook Preview
                          </span>
                          <div className="relative aspect-[3/4] w-full max-w-[180px] mx-auto bg-neutral-100 border border-neutral-200/80 overflow-hidden shadow-xs rounded-2xl">
                            <img
                              src={editProdImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pinned Sticky Footer Actions */}
                    <div className="shrink-0 px-6 sm:px-8 py-4 bg-neutral-50/90 border-t border-neutral-200/70 flex items-center gap-3 z-10">
                      <button
                        type="submit"
                        disabled={isUpdatingProduct}
                        className="flex-1 h-11 bg-neutral-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs rounded-xl"
                      >
                        {isUpdatingProduct ? (
                          <span>{at.products.savingBtn}</span>
                        ) : (
                          <>
                            <span>{language === 'ar' ? 'حفظ التعديلات' : language === 'fr' ? 'Enregistrer' : 'Save Changes'}</span>
                            <span className="font-latin">{isRtl ? '←' : '→'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseEdit}
                        className="px-6 h-11 border border-neutral-200 text-neutral-600 hover:bg-white transition-colors text-xs font-semibold cursor-pointer rounded-xl"
                      >
                        {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SHIPPING RATES MANAGEMENT (58 WILAYAS) */}
        {/* ======================================================== */}
        {activeTab === 'shipping' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Shipping Command Bar */}
            <div className="bg-white p-5 sm:p-6 border border-neutral-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  {language === 'ar' ? 'أسعار التوصيل' : language === 'fr' ? 'Tarifs de livraison' : 'Shipping Rates'}
                </h3>
              </div>

              <div className="flex items-center gap-2.5 self-stretch md:self-auto flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={handleSetFreeShippingAll}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs bg-neutral-50 text-neutral-800 border border-neutral-200 font-semibold hover:bg-neutral-100 rounded-xl transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="تفعيل التوصيل المجاني لكافة الـ 58 ولاية"
                >
                  <span>🎁</span>
                  <span>{at.shipping.freeAllBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaultShipping}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs bg-white text-neutral-700 border border-neutral-200 font-semibold hover:bg-neutral-50 rounded-xl transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="استعادة الأسعار الافتراضية للولايات"
                >
                  <span>🔄</span>
                  <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Restaurer défaut'}</span>
                </button>

                {/* Auto-Save Live Status Badge */}
                <div
                  className="flex-1 sm:flex-none px-3.5 py-2.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-xl font-bold whitespace-nowrap inline-flex items-center justify-center gap-2 shadow-xs select-none"
                  title={language === 'ar' ? 'يتم حفظ جميع التغييرات تلقائياً في قاعدة البيانات فور تعديل أي سعر' : 'All changes are automatically saved to Firebase'}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{language === 'ar' ? 'حفظ تلقائي مفعّل ✓' : 'Enregistrement auto actif ✓'}</span>
                </div>
              </div>
            </div>

            {shippingSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{shippingSuccessMsg}</span>
              </div>
            )}

            {/* Wilaya Filter Search */}
            <div className="relative max-w-md">
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'} text-neutral-400 pointer-events-none`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={at.shipping.searchPlaceholder}
                value={wilayaSearch}
                onChange={(e) => setWilayaSearch(e.target.value)}
                className={`w-full h-11 ${
                  isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                } bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all font-arabic shadow-xs`}
              />
            </div>

            {/* 58 Wilayas Modern Table */}
            <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className={`w-full text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-neutral-50/90 border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-5">{at.shipping.colCode}</th>
                      <th className="py-4 px-5">{at.shipping.colName}</th>
                      <th className="py-4 px-5">{at.shipping.colHome}</th>
                      <th className="py-4 px-5">{at.shipping.colOffice}</th>
                      <th className="py-4 px-5 text-center">{at.shipping.colFreeStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {wilayas
                      .filter((w) =>
                        w.name.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
                        w.id.includes(wilayaSearch)
                      )
                      .map((w) => {
                        const isFree = w.homePrice === 0 && w.officePrice === 0;
                        return (
                          <tr key={w.id} className="hover:bg-neutral-50/70 transition-colors">
                            {/* Code */}
                            <td className="py-3.5 px-5">
                              <span className="font-mono font-bold text-xs bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200/80 text-neutral-800">
                                {w.id}
                              </span>
                            </td>

                            {/* Wilaya Name */}
                            <td className="py-3.5 px-5 font-bold text-neutral-900 text-sm">
                              {w.name}
                            </td>

                            {/* Home Price Input */}
                            <td className="py-3.5 px-5">
                              <div className="relative inline-flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={w.homePrice}
                                  onChange={(e) =>
                                    handleUpdateWilayaRate(w.id, 'homePrice', Number(e.target.value))
                                  }
                                  className="w-28 h-9 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:bg-white focus:border-neutral-900 font-latin font-bold transition-all"
                                />
                                <span className="text-[10px] text-neutral-400 mx-2 font-arabic">دج</span>
                              </div>
                            </td>

                            {/* Office Price Input */}
                            <td className="py-3.5 px-5">
                              <div className="relative inline-flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={w.officePrice}
                                  onChange={(e) =>
                                    handleUpdateWilayaRate(w.id, 'officePrice', Number(e.target.value))
                                  }
                                  className="w-28 h-9 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs outline-none focus:bg-white focus:border-neutral-900 font-latin font-bold transition-all"
                                />
                                <span className="text-[10px] text-neutral-400 mx-2 font-arabic">دج</span>
                              </div>
                            </td>

                            {/* Toggle Free Button */}
                            <td className="py-3.5 px-5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleWilayaFree(w.id, isFree)}
                                className={`px-3.5 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer rounded-lg ${
                                  isFree
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-xs'
                                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                                }`}
                              >
                                {isFree ? at.shipping.isFree : at.shipping.makeFree}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: STORE VISUALS & BANNERS (HERO & PHILOSOPHY) */}
        {/* ======================================================== */}
        {activeTab === 'banners' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header & Quick Action Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-xs font-semibold mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  <span>{language === 'ar' ? 'استوديو واجهة المتجر' : 'Storefront Visual Studio'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight font-arabic">
                  {language === 'ar' ? 'تخصيص صور الهيرو وقسم الفلسفة' : 'Hero & Philosophy Visuals'}
                </h2>
                <p className="text-xs sm:text-[13px] text-neutral-500 max-w-2xl mt-1 leading-relaxed font-arabic">
                  {language === 'ar'
                    ? 'تحكّم كامل في الصور الكبيرة لواجهة متجر Miee. يمكنك رفع صور عالية الدقة مباشرة من هاتفك أو تعديل الروابط مع حفظ سحابي فوري يظهر لجميع الزوار.'
                    : 'Manage top Hero banner visual slides and the Our Philosophy section image with real-time cloud sync.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleResetBanners}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer border border-neutral-200"
                >
                  {language === 'ar' ? '↺ استعادة الصور الافتراضية' : 'Reset Defaults'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBanners()}
                  disabled={isSavingBanners}
                  className="flex-1 md:flex-initial px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingBanners ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{language === 'ar' ? '💾 حفظ وتحديث المتجر' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success alert message */}
            {bannersSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{bannersSuccessMsg}</span>
              </motion.div>
            )}

            {/* TWO MAIN VISUAL CARDS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* CARD 1: HERO SECTION IMAGES */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange/10 flex items-center justify-center text-orange font-bold text-xs font-latin">
                        01
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 font-arabic">
                          {language === 'ar' ? 'صور قسم الهيرو (أعلى الواجهة الرئيسية)' : 'Hero Section Visuals'}
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-arabic">
                          {language === 'ar' ? 'الصور الكبيرة بجانب شعار Closet Miee' : 'Large banner visual on homepage top'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload from phone button */}
                  <div>
                    <input
                      ref={heroBannerFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleHeroBannerUpload}
                    />
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => heroBannerFileRef.current?.click()}
                        disabled={isUploadingHeroBanner}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
                      >
                        {isUploadingHeroBanner ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{heroBannerUploadProgress || (language === 'ar' ? 'جاري ضغط ورفع صور الهيرو...' : 'Uploading...')}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{language === 'ar' ? '📷 رفع صور من الهاتف / الكاميرا' : '📷 Upload from phone / camera'}</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'ar' ? '(تحديد صورة واحدة أو عدة صور للتناوب التلقائي)' : '(single or multiple images)'}
                      </span>
                    </div>

                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {language === 'ar' ? 'روابط صور الهيرو (رابط في كل سطر):' : 'Hero Image URLs (one per line):'}
                    </label>
                    <textarea
                      rows={3}
                      value={heroImagesInput}
                      onChange={(e) => setHeroImagesInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-latin outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all"
                    />
                  </div>

                  {/* Hero Images Gallery Thumbnails */}
                  {(() => {
                    const urls = heroImagesInput
                      .split(/\r?\n/)
                      .map((u) => u.trim())
                      .filter((u) => u.length > 5);
                    if (urls.length === 0) return null;
                    return (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                          <span>{language === 'ar' ? 'الصور الحالية المعتمدة للهيرو:' : 'Current Hero Slides:'}</span>
                          <span className="font-latin text-orange font-bold">({urls.length})</span>
                        </div>
                        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                          {urls.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-[4/3] w-24 shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-2xs group"
                            >
                              <img
                                src={url}
                                alt={`Hero slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.opacity = '0.35';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveHeroBannerImage(idx)}
                                title={language === 'ar' ? 'حذف هذه الصورة من الهيرو' : 'Remove image'}
                                className="absolute top-1 left-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs active:scale-90 transition-all cursor-pointer"
                              >
                                ×
                              </button>
                              <span className="absolute bottom-1 right-1 bg-neutral-900/85 text-white text-[8px] px-1.5 py-0.5 rounded font-latin font-bold">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Live Hero Lookbook Mockup */}
                  {(() => {
                    const firstUrl = heroImagesInput.split(/\r?\n/).map((u) => u.trim()).find((u) => u.length > 5);
                    if (!firstUrl) return null;
                    return (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-latin">
                          Live Hero Mockup Preview
                        </span>
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-xs">
                          <img
                            src={firstUrl}
                            alt="Hero preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
                          <span
                            className="absolute top-3 right-3 text-white font-latin text-[8px] tracking-[0.25em] uppercase opacity-90"
                            style={{ writingMode: 'vertical-rl' }}
                          >
                            M I E E
                          </span>
                          <div className="absolute left-3 bottom-3 w-12 h-12 border border-white/90 rounded-full flex flex-col items-center justify-center text-white text-[7px] font-latin font-bold rotate-[-12deg] backdrop-blur-xs">
                            <span>MADE</span>
                            <span>FOR YOU</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* CARD 2: PHILOSOPHY SECTION IMAGE */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-700 font-bold text-xs font-latin">
                        02
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900 font-arabic">
                          {language === 'ar' ? 'صورة قسم الفلسفة (OUR PHILOSOPHY)' : 'Our Philosophy Section Visual'}
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-arabic">
                          {language === 'ar' ? '«We design for the woman who knows presence needs no noise»' : 'Image alongside philosophy manifesto'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload from phone button */}
                  <div>
                    <input
                      ref={philosophyBannerFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhilosophyBannerUpload}
                    />
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => philosophyBannerFileRef.current?.click()}
                        disabled={isUploadingPhilosophyBanner}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
                      >
                        {isUploadingPhilosophyBanner ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{language === 'ar' ? 'جاري ضغط ورفع صورة الفلسفة...' : 'Uploading...'}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{language === 'ar' ? '📷 رفع صورة من الهاتف / الكاميرا' : '📷 Upload from phone / camera'}</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'ar' ? 'ضغط ذكي تلقائي بأعلى جودة' : 'Smart compression'}
                      </span>
                    </div>

                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {language === 'ar' ? 'رابط صورة قسم الفلسفة:' : 'Philosophy Image URL:'}
                    </label>
                    <input
                      type="url"
                      value={philosophyImageInput}
                      onChange={(e) => setPhilosophyImageInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-latin outline-none focus:bg-white focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all"
                    />
                  </div>

                  {/* Live Philosophy Mockup Preview */}
                  {philosophyImageInput && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block font-latin">
                        Live Philosophy Mockup Preview
                      </span>
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-neutral-200 bg-[#343e30] shadow-xs flex">
                        {/* Image Half */}
                        <div className="w-1/2 h-full relative overflow-hidden">
                          <img
                            src={philosophyImageInput}
                            alt="Philosophy preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        {/* Copy Mock Half */}
                        <div className="w-1/2 h-full p-4 flex flex-col justify-center text-[#faf8f4] text-right" dir="rtl">
                          <span className="text-[8px] font-semibold text-[#d3d8c9] uppercase tracking-wider mb-1">
                            {language === 'ar' ? 'فلسفتنا' : 'OUR PHILOSOPHY'}
                          </span>
                          <p className="text-[10px] font-medium leading-snug line-clamp-2 text-white">
                            We design for the woman who knows presence needs no noise.
                          </p>
                          <div className="mt-2 pt-2 border-t border-white/20 flex gap-2 text-[7px] text-[#e4e7df]">
                            <span>01 الجودة</span>
                            <span>02 الأناقة</span>
                            <span>03 البساطة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Sticky-style Action Bar */}
            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500 font-arabic">
                {language === 'ar'
                  ? '💡 بمجرد الضغط على «حفظ وتحديث المتجر»، ستتغير الصور فوراً لدى جميع الزبائن في المتجر دون الحاجة لإعادة نشر الموقع.'
                  : 'Changes take effect immediately for all storefront visitors upon saving.'}
              </span>
              <button
                type="button"
                onClick={() => handleSaveBanners()}
                disabled={isSavingBanners}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSavingBanners ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'ar' ? '💾 حفظ وتحديث المتجر الآن' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-auto py-8 sm:py-10 border-t border-neutral-200/60 text-center text-[11px] text-neutral-400 font-latin tracking-[0.25em] uppercase">
        MIEE · BACKOFFICE MANAGEMENT SYSTEM · ALGER
      </footer>

      {/* Product Detail Modal for Admin Live Preview */}
      <ProductDetailModal
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {/* ======================================================== */}
      {/* LUXURY HAUTE COUTURE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div
            className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 shadow-2xl rounded-3xl max-w-md w-full relative overflow-hidden text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Luxury Accent Top Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  confirmModal.isDangerous ? 'bg-rose-500' : 'bg-neutral-900'
                }`}
              />

              <div className="p-6 sm:p-7 space-y-4">
                {/* Header with Icon & Close Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        confirmModal.isDangerous
                          ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                          : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                      }`}
                    >
                      {confirmModal.isDangerous ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-600 font-latin block mb-0.5">
                        {confirmModal.subtitle || 'Atelier Miee'}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                        {confirmModal.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-8 h-8 rounded-full border border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center text-xs font-latin cursor-pointer shrink-0"
                    title={language === 'ar' ? 'إلغاء' : 'Close'}
                  >
                    ✕
                  </button>
                </div>

                {/* Message */}
                <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                  {confirmModal.message}
                </p>

                {/* Optional Item Badge / Preview */}
                {confirmModal.itemBadge && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl flex items-center gap-2.5 text-neutral-800">
                    <span className="text-base">🏷️</span>
                    <span className="text-xs font-bold font-latin truncate flex-1">
                      {confirmModal.itemBadge}
                    </span>
                  </div>
                )}

                {/* Action Buttons: Confirm & Cancel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirmModal.onConfirm) {
                        await confirmModal.onConfirm();
                      }
                    }}
                    className={`flex-1 h-11 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 text-white ${
                      confirmModal.isDangerous
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-neutral-900 hover:bg-black'
                    }`}
                  >
                    {confirmModal.confirmText || (language === 'ar' ? 'تأكيد الحذف' : 'Confirmer')}
                  </button>

                  {confirmModal.secondaryText && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirmModal.onSecondary) {
                          await confirmModal.onSecondary();
                        }
                      }}
                      className="px-4 h-11 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                    >
                      {confirmModal.secondaryText}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-5 h-11 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                  >
                    {confirmModal.cancelText || (language === 'ar' ? 'إلغاء' : 'Annuler')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

