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
  getLanguageSettings,
  saveInterfaceLanguage,
  saveTaskLanguage,
  saveTranslationLanguage,
} from '../lib/languageSettings';
import type { TranslationLanguageCode } from '../lib/translationLanguages';

interface InterfaceLanguageContextValue {
  language: InterfaceLanguage;
  translationLanguage: TranslationLanguageCode;
  taskLanguage: TranslationLanguageCode;
  setLanguage: (language: InterfaceLanguage) => void;
  setTranslationLanguage: (language: TranslationLanguageCode) => void;
  setTaskLanguage: (language: TranslationLanguageCode) => void;
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
  const [translationLanguage, setTranslationLanguageState] =
    useState<TranslationLanguageCode>('uk');
  const [taskLanguage, setTaskLanguageState] =
    useState<TranslationLanguageCode>('uk');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const settings = getLanguageSettings();
    setLanguageState(settings.interfaceLanguage);
    setTranslationLanguageState(settings.translationLanguage);
    setTaskLanguageState(settings.taskLanguage);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
  }, [language, ready]);

  const setLanguage = useCallback((next: InterfaceLanguage) => {
    const current = getLanguageSettings();
    const translationMatchedInterface =
      current.interfaceLanguage === current.translationLanguage;

    saveInterfaceLanguage(next);
    setLanguageState(next);

    if (translationMatchedInterface) {
      saveTranslationLanguage(next);
      saveTaskLanguage(next);
      setTranslationLanguageState(next);
      setTaskLanguageState(next);
    }
  }, []);

  const setTranslationLanguage = useCallback((next: TranslationLanguageCode) => {
    const current = getLanguageSettings();
    const interfaceMatchedTranslation =
      current.interfaceLanguage === current.translationLanguage;

    saveTranslationLanguage(next);
    setTranslationLanguageState(next);

    if (interfaceMatchedTranslation) {
      saveInterfaceLanguage(next);
      setLanguageState(next);
    }
  }, []);

  const setTaskLanguage = useCallback((next: TranslationLanguageCode) => {
    saveTaskLanguage(next);
    setTaskLanguageState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      translationLanguage,
      taskLanguage,
      setLanguage,
      setTranslationLanguage,
      setTaskLanguage,
      t,
    }),
    [
      language,
      translationLanguage,
      taskLanguage,
      setLanguage,
      setTranslationLanguage,
      setTaskLanguage,
      t,
    ]
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
