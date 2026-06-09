export interface TranslationLanguage {
  code: string;
  name: string;
}

export const DEFAULT_TRANSLATION_LANGUAGE = 'uk';

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: 'uk', name: 'Українська' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pl', name: 'Polski' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'cs', name: 'Čeština' },
  { code: 'sk', name: 'Slovenčina' },
];

const STORAGE_KEY = 'yoytube-translation-language';

export function isTranslationLanguage(code: string): boolean {
  return TRANSLATION_LANGUAGES.some((lang) => lang.code === code);
}

export function getSavedTranslationLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_TRANSLATION_LANGUAGE;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && isTranslationLanguage(saved)) {
    return saved;
  }

  return DEFAULT_TRANSLATION_LANGUAGE;
}

export function saveTranslationLanguage(code: string): void {
  localStorage.setItem(STORAGE_KEY, code);
}

export function getTranslationLanguageName(code: string): string {
  return (
    TRANSLATION_LANGUAGES.find((lang) => lang.code === code)?.name ?? code
  );
}

export function getTranslationLanguageShortCode(code: string): string {
  return code.toUpperCase();
}
