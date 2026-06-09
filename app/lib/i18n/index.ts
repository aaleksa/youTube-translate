import {
  INTERFACE_LANGUAGES,
  messages,
  type InterfaceLanguage,
  type TranslationKey,
} from './messages';

export { INTERFACE_LANGUAGES, messages, type InterfaceLanguage, type TranslationKey };

export function isInterfaceLanguage(code: string): code is InterfaceLanguage {
  return INTERFACE_LANGUAGES.some((lang) => lang.code === code);
}

export function detectBrowserInterfaceLanguage(): InterfaceLanguage {
  if (typeof navigator === 'undefined') return 'uk';

  const primary = navigator.language.split('-')[0]?.toLowerCase();
  if (primary && isInterfaceLanguage(primary)) {
    return primary;
  }

  for (const lang of navigator.languages ?? []) {
    const code = lang.split('-')[0]?.toLowerCase();
    if (code && isInterfaceLanguage(code)) {
      return code;
    }
  }

  return 'en';
}

export function translate(
  language: InterfaceLanguage,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = messages[language][key] ?? messages.en[key] ?? key;

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
}

export function getInterfaceLanguageName(code: InterfaceLanguage): string {
  return INTERFACE_LANGUAGES.find((lang) => lang.code === code)?.name ?? code;
}

const INTERFACE_LOCALES: Record<InterfaceLanguage, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  pl: 'pl-PL',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR',
};

export function getInterfaceLocale(language: InterfaceLanguage): string {
  return INTERFACE_LOCALES[language] ?? 'en-US';
}
