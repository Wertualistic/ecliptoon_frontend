'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import uzTranslations from '../locales/uz.json';

type TranslationsType = typeof uzTranslations;

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>('uz');
  const [translations, setTranslations] = useState<any>(uzTranslations);

  // Set up localstorage cache to save locale in the future
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'uz';
    setLocaleState(savedLocale);
  }, []);

  const setLocale = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
    // In the future, dynamically load ru.json or en.json
    // For now, Ecliptoon only uses uz.json as the base
    setTranslations(uzTranslations);
  };

  // Helper to parse nested keys (e.g., "common.home")
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key itself if not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters e.g. {diamonds}
    let result = value;
    if (params) {
      Object.entries(params).forEach(([paramName, paramVal]) => {
        result = result.replace(new RegExp(`{${paramName}}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
