'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  translate,
  type InterfaceLanguage,
  type TranslationKey,
} from '../lib/i18n';
import {
  getSavedInterfaceLanguage,
  saveInterfaceLanguage,
} from '../lib/languageSettings';

interface InterfaceLanguageContextValue {
  language: InterfaceLanguage;
  setLanguage: (language: InterfaceLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const InterfaceLanguageContext =
  createContext<InterfaceLanguageContextValue | null>(null);

export function InterfaceLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<InterfaceLanguage>('uk');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLanguageState(getSavedInterfaceLanguage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
  }, [language, ready]);

  const setLanguage = useCallback((next: InterfaceLanguage) => {
    saveInterfaceLanguage(next);
    setLanguageState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <InterfaceLanguageContext.Provider value={value}>
      {children}
    </InterfaceLanguageContext.Provider>
  );
}

export function useI18n(): InterfaceLanguageContextValue {
  const context = useContext(InterfaceLanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within InterfaceLanguageProvider');
  }
  return context;
}
