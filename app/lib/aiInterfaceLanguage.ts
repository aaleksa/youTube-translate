import { getInterfaceLanguageName, type InterfaceLanguage } from './i18n';
import {
  isTranslationLanguage,
  type TranslationLanguageCode,
} from './translationLanguages';

const AI_LANGUAGE_NAMES: Record<InterfaceLanguage, string> = {
  uk: 'Ukrainian',
  en: 'English',
  pl: 'Polish',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
};

export function resolveInterfaceLanguage(
  value: unknown,
  fallback: InterfaceLanguage = 'uk'
): InterfaceLanguage {
  if (typeof value === 'string' && value in AI_LANGUAGE_NAMES) {
    return value as InterfaceLanguage;
  }
  return fallback;
}

export function resolveTranslationLanguage(
  value: unknown,
  fallback: TranslationLanguageCode = 'uk'
): TranslationLanguageCode {
  if (typeof value === 'string' && isTranslationLanguage(value)) {
    return value;
  }
  return fallback;
}

export function resolveTaskLanguage(
  value: unknown,
  fallback: TranslationLanguageCode = 'uk'
): TranslationLanguageCode {
  return resolveTranslationLanguage(value, fallback);
}

export function getAiResponseLanguageName(
  code: InterfaceLanguage | TranslationLanguageCode
): string {
  if (code in AI_LANGUAGE_NAMES) {
    return AI_LANGUAGE_NAMES[code as InterfaceLanguage];
  }
  return getInterfaceLanguageName(code as InterfaceLanguage);
}
