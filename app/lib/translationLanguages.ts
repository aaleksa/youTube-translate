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

export function isTranslationLanguage(code: string): boolean {
  return TRANSLATION_LANGUAGES.some((lang) => lang.code === code);
}

export function getTranslationLanguageName(code: string): string {
  return (
    TRANSLATION_LANGUAGES.find((lang) => lang.code === code)?.name ?? code
  );
}

export function getTranslationLanguageShortCode(code: string): string {
  return code.toUpperCase();
}
