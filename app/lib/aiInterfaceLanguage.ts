import { getInterfaceLanguageName, type InterfaceLanguage } from './i18n';

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

export function getAiResponseLanguageName(code: InterfaceLanguage): string {
  return AI_LANGUAGE_NAMES[code] ?? getInterfaceLanguageName(code);
}
