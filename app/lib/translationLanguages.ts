import {
  INTERFACE_LANGUAGES,
  detectBrowserInterfaceLanguage,
  isInterfaceLanguage,
  type InterfaceLanguage,
} from './i18n';

export type TranslationLanguageCode = InterfaceLanguage;

export interface TranslationLanguage {
  code: TranslationLanguageCode;
  name: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = INTERFACE_LANGUAGES.map(
  (lang) => ({ code: lang.code, name: lang.name })
);

export const DEFAULT_TRANSLATION_LANGUAGE: TranslationLanguageCode =
  detectBrowserInterfaceLanguage();

export function isTranslationLanguage(
  code: string
): code is TranslationLanguageCode {
  return isInterfaceLanguage(code);
}

export function resolveTranslationLanguage(
  value: unknown,
  fallback: TranslationLanguageCode = DEFAULT_TRANSLATION_LANGUAGE
): TranslationLanguageCode {
  if (typeof value === 'string' && isTranslationLanguage(value)) {
    return value;
  }
  return fallback;
}

export function getTranslationLanguageName(code: string): string {
  return (
    TRANSLATION_LANGUAGES.find((lang) => lang.code === code)?.name ?? code
  );
}

export function getTranslationLanguageShortCode(code: string): string {
  return code.toUpperCase();
}
