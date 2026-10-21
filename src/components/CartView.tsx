import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { WILAYAS } from '../data/wilayas';
import { DeliveryMethod, Wilaya } from '../types';
import { SuccessModal } from './SuccessModal';
import { BrandLogo } from './BrandLogo';
import { saveOrderToFirebase, subscribeToWilayas } from '../firebase';

export const CartView: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQty,
    updateColor,
    updateSize,
    clearCart,
    subtotal,
    totalCount
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('office');
  const [selectedWilayaId, setSelectedWilayaId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [wilayasList, setWilayasList] = useState<Wilaya[]>(WILAYAS);
  const [wilayaError, setWilayaError] = useState<boolean>(false);
  const wilayaSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const [phoneTouched, setPhoneTouched] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const phoneInputRef = React.useRef<HTMLInputElement | null>(null);
  const [nameError, setNameError] = useState<string>('');
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);
  const [addressError, setAddressError] = useState<string>('');
  const addressInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = subscribeToWilayas((live) => {
      if (live && live.length > 0) {
        setWilayasList(live);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Calculate shipping based on wilaya and delivery method
  const selectedWilaya = wilayasList.find(w => w.id === selectedWilayaId);
  const homeFee = selectedWilaya ? Math.max(0, Number(selectedWilaya.homePrice ?? 0)) : 0;
  const officeFee = selectedWilaya ? Math.max(0, Number(selectedWilaya.officePrice ?? 0)) : 0;

  const rawShippingFee = selectedWilaya
    ? deliveryMethod === 'home'
      ? homeFee
      : officeFee
    : 0;

  const isFreeShipping = selectedWilaya ? rawShippingFee === 0 : false;
  const shippingFee = isFreeShipping ? 0 : rawShippingFee;
  const grandTotal = subtotal + shippingFee;

  const formatMoney = (n: number) => {
    return `${Number(n).toLocaleString('fr-FR')} دج`;
  };

  const normalizeDigits = (val: string) => {
    return val
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/\D/g, '');
  };

  const handlePhoneInteraction = () => {
    if (!selectedWilayaId) {
      setWilayaError(true);
      wilayaSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handlePhoneChange = (raw: string) => {
    const digits = normalizeDigits(raw).slice(0, 10);
    setPhone(digits);
    if (!selectedWilayaId) {
      setWilayaError(true);
    }
    // Validation while typing
    if (digits.length >= 2 && !/^0[567]/.test(digits)) {
      setPhoneError(
        dir === 'rtl'
          ? 'يجب أن يبدأ الرقم بـ 05 أو 06 أو 07'
          : language === 'fr'
          ? 'Doit commencer par 05, 06 ou 07'
          : 'Must start with 05, 06, or 07'
      );
    } else if (digits.length === 10 && /^0[567]\d{8}$/.test(digits)) {
      setPhoneError('');
    } else if (phoneTouched && digits.length < 10) {
      setPhoneError(
        dir === 'rtl'
          ? 'يجب إدخال 10 أرقام بالضبط (10 أرقام إلزامي)'
          : language === 'fr'
          ? '10 chiffres obligatoires'
          : 'Exactly 10 digits required'
      );
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    if (!phone) {
      setPhoneError(
        dir === 'rtl'
          ? 'رقم الهاتف إلزامي'
          : language === 'fr'
          ? 'Numéro obligatoire'
          : 'Phone number is required'
      );
      return;
    }
    if (!/^0[567]/.test(phone)) {
      setPhoneError(
        dir === 'rtl'
          ? 'يجب أن يبدأ الرقم بـ 05 أو 06 أو 07'
          : language === 'fr'
          ? 'Doit commencer par 05, 06 ou 07'
          : 'Must start with 05, 06, or 07'
      );
    } else if (phone.length !== 10) {
      setPhoneError(
        dir === 'rtl'
          ? 'يجب إدخال 10 أرقام بالضبط (10 أرقام إلزامي)'
          : language === 'fr'
          ? '10 chiffres obligatoires'
          : 'Exactly 10 digits required'
      );
    } else {
      setPhoneError('');
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    if (!selectedWilayaId) {
      setWilayaError(true);
      wilayaSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      wilayaSelectRef.current?.focus();
      return;
    }
    if (!customerName.trim()) {
      setNameError(dir === 'rtl' ? 'الرجاء إدخال الاسم الكامل.' : 'Please enter your full name.');
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
      return;
    }
    setNameError('');

    if (!phone.trim() || !/^0[567]\d{8}$/.test(phone)) {
      setPhoneTouched(true);
      const errMsg = !/^0[567]/.test(phone)
        ? (dir === 'rtl' ? 'يجب أن يبدأ الرقم بـ 05 أو 06 أو 07' : 'Must start with 05, 06, or 07')
        : (dir === 'rtl' ? 'يجب إدخال 10 أرقام بالضبط (10 أرقام إلزامي)' : 'Phone number must be exactly 10 digits');
      setPhoneError(errMsg);
      phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      phoneInputRef.current?.focus();
      return;
    }

    if (deliveryMethod === 'home' && !address.trim()) {
      setAddressError(dir === 'rtl' ? 'الرجاء إدخال العنوان التفصيلي للتوصيل.' : 'Please enter your detailed home address.');
      addressInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addressInputRef.current?.focus();
      return;
    }
    setAddressError('');

    setIsSubmitting(true);

    const orderId = `MIEE-${Date.now().toString().slice(-6)}`;
    setCreatedOrderId(orderId);

    const orderPayload = {
      orderId,
      customerName,
      phone,
      wilayaId: selectedWilayaId,
      wilayaName: selectedWilaya?.name || selectedWilayaId,
      deliveryMethod,
      address: deliveryMethod === 'home' ? address.trim() : '',
      items: cart,
      subtotal,
      shipping: shippingFee,
      total: grandTotal
    };

    // Save immediately (LocalStorage, Cloud Firestore, Realtime Database)
    await saveOrderToFirebase(orderPayload);

    try {
      // Also notify Node.js & Express API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (res.ok && data.success && data.orderId) {
        setCreatedOrderId(data.orderId);
      }
    } catch {
      // Offline fallback: order already registered in Firebase
    } finally {
      setIsSubmitting(false);
      clearCart();
      setShowSuccess(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    closeCart();
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-paper overflow-y-auto"
          >
            {/* Header */}
            <header className="sticky top-0 z-20 h-[72px] md:h-[86px] bg-paper border-b border-ink/10 px-[5.2vw] flex items-center justify-between">
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 text-xs font-medium text-ink hover:text-orange transition-colors"
              >
                <span>{dir === 'rtl' ? '→' : '←'}</span>
                <span>{t.cart.backToShop}</span>
              </button>

              <a href="#top" onClick={closeCart} className="flex items-center justify-center py-1">
                <BrandLogo />
              </a>

              <div className="hidden sm:block text-[11px] text-neutral-600 font-medium">
                {t.cart.secureDelivery}
              </div>
            </header>

            {/* Main Cart & Checkout Area */}
            <main className="max-w-7xl mx-auto px-[5.2vw] py-10 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-10 md:gap-14 items-start">
              {/* Left Column: Cart Items */}
              <section className="min-w-0">
                <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-500 uppercase mb-3">
                  MIEE / YOUR SELECTION
                </p>

                <div className="flex items-end justify-between border-b border-ink/15 pb-5 mb-8">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink"
                    dangerouslySetInnerHTML={{ __html: t.cart.title }}
                  />
                  <span className="text-xs text-neutral-500">
                    {totalCount} {t.cart.itemCount}
                  </span>
                </div>

                {/* Empty State */}
                {cart.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <span className="w-14 h-14 bg-cream rounded-full flex items-center justify-center text-xl text-ink mx-auto mb-5">
                      ✦
                    </span>
                    <h2 className="text-2xl font-medium text-ink mb-3">
                      {t.cart.emptyTitle}
                    </h2>
                    <p className="text-xs text-neutral-600 max-w-[340px] mx-auto leading-relaxed mb-7">
                      {t.cart.emptyDesc}
                    </p>
                    <button
                      onClick={closeCart}
                      className="inline-flex items-center gap-4 text-xs font-semibold text-ink border-b border-ink pb-1.5 hover:text-orange hover:border-orange transition-colors"
                    >
                      <span>{t.cart.emptyAction}</span>
                      <span className="font-latin text-base">↙</span>
                    </button>
                  </div>
                ) : (
                  /* Item List */
                  <div className="divide-y divide-ink/10">
                    {cart.map((item, index) => {
                      const itemName = t.productNames[item.id] || item.name;
                      return (
                        <article
                          key={`${item.id}-${item.color}-${item.size}-${index}`}
                          className="py-6 grid grid-cols-[100px_1fr_auto] sm:grid-cols-[125px_1fr_auto] gap-4 sm:gap-6 items-center"
                        >
                          {/* Image */}
                          <div className="h-[125px] sm:h-[145px] bg-neutral-200 overflow-hidden">
                            <img
                              src={item.image}
                              alt={itemName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info & Selects */}
                          <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-ink m-0">
                              {itemName}
                            </h3>
                            <span className="text-xs font-semibold font-arabic text-ink">
                              {formatMoney(item.price)}
                            </span>

                            {/* Options: Color & Size */}
                            <div className="flex flex-wrap gap-2 mt-1">
                              <select
                                value={item.color}
                                onChange={e => updateColor(index, e.target.value)}
                                className="bg-transparent border border-ink/20 text-[10px] px-2 py-1 outline-none max-w-[120px]"
                              >
                                {item.colors.map(col => (
                                  <option key={col} value={col}>
                                    {col}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={item.size}
                                onChange={e => updateSize(index, e.target.value)}
                                className="bg-transparent border border-ink/20 text-[10px] px-2 py-1 outline-none"
                              >
                                {item.sizes.map(sz => (
                                  <option key={sz} value={sz}>
                                    {sz}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-2 border border-ink/20 w-max px-2 py-0.5 mt-2">
                              <button
                                onClick={() => updateQty(index, item.qty - 1)}
                                className="w-5 h-5 flex items-center justify-center text-sm font-latin hover:text-orange"
                              >
                                −
                              </button>
                              <span className="text-xs font-latin font-medium min-w-[14px] text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(index, item.qty + 1)}
                                className="w-5 h-5 flex items-center justify-center text-sm font-latin hover:text-orange"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Line Total & Remove */}
                          <div className="text-right sm:text-left self-start flex flex-col justify-between h-full pt-1">
                            <b className="font-arabic text-xs sm:text-sm font-semibold text-ink whitespace-nowrap block mb-5">
                              {formatMoney(item.price * item.qty)}
                            </b>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-[10px] text-neutral-500 hover:text-red-600 underline underline-offset-4 transition-colors"
                            >
                              {t.cart.remove}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Right Column: Checkout Sidebar */}
              {cart.length > 0 && (
                <aside className="sticky top-28 bg-[#e9e2d8] p-6 sm:p-8 shadow-sm">
                  <div className="border-b border-ink/15 pb-4 mb-6">
                    <p className="text-[10px] tracking-[0.1em] font-medium text-neutral-600 uppercase mb-1">
                      {t.cart.checkoutEyebrow}
                    </p>
                    <h2
                      className="text-2xl sm:text-3xl font-medium tracking-tight text-ink"
                      dangerouslySetInnerHTML={{ __html: t.cart.checkoutHeading }}
                    />
                  </div>

                  {/* Delivery Method */}
                  <div className="pb-5 border-b border-ink/15">
                    <label className="block text-[11px] font-medium text-ink mb-2.5">
                      {t.cart.deliveryMethod}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('office')}
                        className={`p-3 text-right flex flex-col gap-0.5 border transition-all cursor-pointer ${
                          deliveryMethod === 'office'
                            ? 'bg-ink text-white border-ink shadow-xs'
                            : 'bg-transparent text-ink border-ink/20 hover:border-ink'
                        }`}
                      >
                        <span className="font-latin text-sm">◫</span>
                        <b className="text-[11px] font-semibold">{t.cart.office}</b>
                        <small
                          className={`text-[9px] ${
                            deliveryMethod === 'office' ? 'text-neutral-300' : 'text-neutral-600'
                          }`}
                        >
                          {t.cart.officeDesc}
                        </small>
                        {selectedWilaya && (
                          <span
                            className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              officeFee === 0
                                ? 'bg-emerald-500/25 text-emerald-800 border border-emerald-400/40'
                                : deliveryMethod === 'office'
                                ? 'bg-white/20 text-white font-latin'
                                : 'bg-ink/5 text-orange font-latin'
                            }`}
                          >
                            {officeFee === 0 ? (dir === 'rtl' ? 'مجاني ✨' : 'Free ✨') : formatMoney(officeFee)}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('home')}
                        className={`p-3 text-right flex flex-col gap-0.5 border transition-all cursor-pointer ${
                          deliveryMethod === 'home'
                            ? 'bg-ink text-white border-ink shadow-xs'
                            : 'bg-transparent text-ink border-ink/20 hover:border-ink'
                        }`}
                      >
                        <span className="font-latin text-sm">⌂</span>
                        <b className="text-[11px] font-semibold">{t.cart.home}</b>
                        <small
                          className={`text-[9px] ${
                            deliveryMethod === 'home' ? 'text-neutral-300' : 'text-neutral-600'
                          }`}
                        >
                          {t.cart.homeDesc}
                        </small>
                        {selectedWilaya && (
                          <span
                            className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                              homeFee === 0
                                ? 'bg-emerald-500/25 text-emerald-800 border border-emerald-400/40'
                                : deliveryMethod === 'home'
                                ? 'bg-white/20 text-white font-latin'
                                : 'bg-ink/5 text-orange font-latin'
                            }`}
                          >
                            {homeFee === 0 ? (dir === 'rtl' ? 'مجاني ✨' : 'Free ✨') : formatMoney(homeFee)}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customer & Address Form */}
                  <div className="py-5 border-b border-ink/15 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Wilaya Selection */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-[10px] font-medium transition-colors ${
                          wilayaError && !selectedWilayaId ? 'text-rose-600 font-semibold' : 'text-ink'
                        }`}>
                          {t.cart.wilaya}
                        </label>
                        {wilayaError && !selectedWilayaId && (
                          <span className="text-[10px] font-bold text-rose-600 animate-pulse font-arabic flex items-center gap-1">
                            <span>⚠️</span>
                            <span>{dir === 'rtl' ? 'قم باختيار الولاية' : language === 'fr' ? 'Choisissez la wilaya' : 'Select wilaya'}</span>
                          </span>
                        )}
                      </div>
                      <select
                        ref={wilayaSelectRef}
                        value={selectedWilayaId}
                        onChange={e => {
                          setSelectedWilayaId(e.target.value);
                          if (e.target.value) {
                            setWilayaError(false);
                          }
                        }}
                        className={`w-full h-10 px-3 text-xs outline-none font-arabic transition-all duration-200 ${
                          wilayaError && !selectedWilayaId
                            ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-[0_0_0_3px_rgba(244,63,94,0.18)]'
                            : 'bg-[#f7f4ef] border border-ink/20 text-ink focus:border-ink'
                        }`}
                      >
                        <option value="">{t.cart.wilayaPrompt}</option>
                        {wilayasList.map(w => {
                          const isFree = (w.homePrice === 0 && w.officePrice === 0) ||
                            (deliveryMethod === 'home' ? w.homePrice === 0 : w.officePrice === 0);
                          return (
                            <option key={w.id} value={w.id}>
                              {w.id} — {w.name} {isFree ? (dir === 'rtl' ? '✦ (توصيل مجاني)' : '✦ (Free Delivery)') : ''}
                            </option>
                          );
                        })}
                      </select>
                      {wilayaError && !selectedWilayaId && (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium font-arabic flex items-center gap-1">
                          <span>*</span>
                          <span>{dir === 'rtl' ? 'يرجى اختيار الولاية لحساب سعر التوصيل' : 'Please select your wilaya first'}</span>
                        </p>
                      )}
                    </div>

                    {/* Address (If Home Delivery) */}
                    {deliveryMethod === 'home' && (
                      <div className="sm:col-span-2">
                        <label className={`block text-[10px] font-medium mb-1.5 ${
                          addressError ? 'text-rose-600 font-semibold' : 'text-ink'
                        }`}>
                          {t.cart.address}
                        </label>
                        <input
                          ref={addressInputRef}
                          type="text"
                          value={address}
                          onChange={e => {
                            setAddress(e.target.value);
                            if (addressError) setAddressError('');
                          }}
                          placeholder={t.cart.addressPlaceholder}
                          className={`w-full h-10 px-3 text-xs outline-none font-arabic transition-all ${
                            addressError
                              ? 'bg-rose-50 border-2 border-rose-500 text-rose-900'
                              : 'bg-[#f7f4ef] border border-ink/20 text-ink focus:border-ink'
                          }`}
                        />
                        {addressError && (
                          <p className="mt-1 text-[11px] text-rose-600 font-medium font-arabic flex items-center gap-1">
                            <span>*</span>
                            <span>{addressError}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Customer Name */}
                    <div>
                      <label className={`block text-[10px] font-medium mb-1.5 ${
                        nameError ? 'text-rose-600 font-semibold' : 'text-ink'
                      }`}>
                        {t.cart.name}
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={customerName}
                        onChange={e => {
                          setCustomerName(e.target.value);
                          if (nameError) setNameError('');
                        }}
                        placeholder={t.cart.namePlaceholder}
                        className={`w-full h-10 px-3 text-xs outline-none font-arabic transition-all ${
                          nameError
                            ? 'bg-rose-50 border-2 border-rose-500 text-rose-900'
                            : 'bg-[#f7f4ef] border border-ink/20 text-ink focus:border-ink'
                        }`}
                      />
                      {nameError && (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium font-arabic flex items-center gap-1">
                          <span>*</span>
                          <span>{nameError}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-[10px] font-medium transition-colors ${
                          phoneError ? 'text-rose-600 font-semibold' : 'text-ink'
                        }`}>
                          {t.cart.phone}
                        </label>
                        <div className="flex items-center gap-1.5">
                          {wilayaError && !selectedWilayaId && (
                            <span className="text-[10px] text-rose-600 font-bold font-arabic animate-pulse">
                              ⚠️ {dir === 'rtl' ? 'قم باختيار الولاية' : 'Select wilaya'}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-latin font-medium px-1.5 py-0.5 rounded transition-colors ${
                              phone.length === 10 && /^0[567]\d{8}$/.test(phone)
                                ? 'bg-emerald-100 text-emerald-800'
                                : phoneError
                                ? 'bg-rose-100 text-rose-700'
                                : 'text-neutral-500 bg-black/5'
                            }`}
                          >
                            {phone.length}/10
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onFocus={handlePhoneInteraction}
                          onClick={handlePhoneInteraction}
                          onBlur={handlePhoneBlur}
                          onChange={e => handlePhoneChange(e.target.value)}
                          placeholder="05 / 06 / 07 XX XX XX XX"
                          className={`w-full h-10 bg-[#f7f4ef] px-3 text-xs outline-none font-latin tracking-wider transition-all ${
                            phoneError
                              ? 'border-2 border-rose-500 bg-rose-50/50 text-rose-900 shadow-[0_0_0_2px_rgba(244,63,94,0.15)]'
                              : phone.length === 10 && /^0[567]\d{8}$/.test(phone)
                              ? 'border-2 border-emerald-500 bg-emerald-50/30 text-emerald-950'
                              : 'border border-ink/20 focus:border-ink text-ink'
                          }`}
                        />
                        {phone.length === 10 && /^0[567]\d{8}$/.test(phone) && (
                          <span className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-bold pointer-events-none`}>
                            ✓
                          </span>
                        )}
                      </div>
                      {phoneError ? (
                        <p className="mt-1 text-[11px] text-rose-600 font-medium font-arabic flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{phoneError}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-neutral-400 font-arabic">
                          {dir === 'rtl' ? '10 أرقام تبدأ بـ 05 أو 06 أو 07' : '10 digits starting with 05, 06, or 07'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Totals */}
                  <div className="pt-4 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>{t.cart.subtotal}</span>
                      <b className="font-arabic text-ink">{formatMoney(subtotal)}</b>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>{t.cart.shipping}</span>
                      {selectedWilayaId ? (
                        isFreeShipping ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            {dir === 'rtl' ? 'توصيل مجاني (0 دج)' : 'Free Shipping (0 DZD)'}
                          </span>
                        ) : (
                          <b className="font-arabic text-ink">{formatMoney(shippingFee)}</b>
                        )
                      ) : (
                        <span className="text-neutral-500 text-xs">{t.cart.shippingSelectWilaya}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center border-t border-ink/15 pt-3 mt-1 text-sm font-semibold text-ink">
                      <span>{t.cart.total}</span>
                      <strong className="font-arabic text-xl font-bold text-ink">
                        {formatMoney(grandTotal)}
                      </strong>
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full mt-6 py-4 px-6 bg-ink text-white text-xs font-semibold flex items-center justify-between tracking-wide transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <span>{isSubmitting ? '...' : t.cart.placeOrder}</span>
                    <span className="font-latin text-lg transition-transform group-hover:translate-x-1">
                      ↙
                    </span>
                  </button>

                  <p className="text-[9px] text-neutral-500 text-center leading-relaxed mt-3">
                    {t.cart.orderHint}
                  </p>
                </aside>
              )}
            </main>

            {/* Bottom 3 Assurances Strip */}
            <section className="bg-moss text-[#f4f2ec] py-8 px-[5.2vw] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs max-w-7xl mx-auto mb-10">
              {t.cart.assurances.map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <b className="font-latin text-lg font-light text-[#d9dfcf]">
                    0{idx + 1}
                  </b>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        orderId={createdOrderId}
        onClose={handleSuccessClose}
      />
    </>
  );
};
