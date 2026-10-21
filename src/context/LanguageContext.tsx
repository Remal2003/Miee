import React, { createContext, useContext, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, Translations } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('miee-language') as Language;
      return (saved === 'ar' || saved === 'en' || saved === 'fr') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.ar, [language]);
  const dir = t.dir;

  // Immediate DOM synchronization to avoid double-paint and layout delays
  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    const nextT = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    // Apply direction and language immediately before React commits new tree
    document.documentElement.dir = nextT.dir;
    document.documentElement.lang = lang;
    document.title = nextT.title;
    try {
      localStorage.setItem('miee-language', lang);
    } catch {}
    setLanguageState(lang);
  }, [language]);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.title = t.title;
  }, [language, dir, t.title]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    dir
  }), [language, setLanguage, t, dir]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
