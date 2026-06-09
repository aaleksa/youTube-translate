import {
  detectBrowserInterfaceLanguage,
  isInterfaceLanguage,
  type InterfaceLanguage,
} from './i18n';
import { DEFAULT_TRANSLATION_LANGUAGE, isTranslationLanguage } from './translationLanguages';

const STORAGE_KEY = 'yoytube-language-settings';
const LEGACY_TRANSLATION_KEY = 'yoytube-translation-language';

export interface LanguageSettings {
  interfaceLanguage: InterfaceLanguage;
  transcriptLanguage: string;
  translationLanguage: string;
}

function defaultSettings(): LanguageSettings {
  return {
    interfaceLanguage: detectBrowserInterfaceLanguage(),
    transcriptLanguage: 'en',
    translationLanguage: DEFAULT_TRANSLATION_LANGUAGE,
  };
}

function migrateLegacySettings(): LanguageSettings {
  const defaults = defaultSettings();

  if (typeof window === 'undefined') return defaults;

  try {
    const legacyTranslation = localStorage.getItem(LEGACY_TRANSLATION_KEY);
    if (legacyTranslation && isTranslationLanguage(legacyTranslation)) {
      defaults.translationLanguage = legacyTranslation;
    }
  } catch {
    // ignore
  }

  return defaults;
}

export function getLanguageSettings(): LanguageSettings {
  if (typeof window === 'undefined') return defaultSettings();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return migrateLegacySettings();
    }

    const parsed = JSON.parse(raw) as Partial<LanguageSettings>;
    const migrated = migrateLegacySettings();

    return {
      interfaceLanguage:
        parsed.interfaceLanguage && isInterfaceLanguage(parsed.interfaceLanguage)
          ? parsed.interfaceLanguage
          : migrated.interfaceLanguage,
      transcriptLanguage:
        typeof parsed.transcriptLanguage === 'string' &&
        parsed.transcriptLanguage.trim()
          ? parsed.transcriptLanguage.trim()
          : migrated.transcriptLanguage,
      translationLanguage:
        parsed.translationLanguage &&
        isTranslationLanguage(parsed.translationLanguage)
          ? parsed.translationLanguage
          : migrated.translationLanguage,
    };
  } catch {
    return migrateLegacySettings();
  }
}

export function saveLanguageSettings(
  partial: Partial<LanguageSettings>
): LanguageSettings {
  const current = getLanguageSettings();
  const next: LanguageSettings = { ...current, ...partial };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  localStorage.setItem(LEGACY_TRANSLATION_KEY, next.translationLanguage);

  return next;
}

export function getSavedInterfaceLanguage(): InterfaceLanguage {
  return getLanguageSettings().interfaceLanguage;
}

export function saveInterfaceLanguage(code: InterfaceLanguage): LanguageSettings {
  return saveLanguageSettings({ interfaceLanguage: code });
}

export function getSavedTranslationLanguage(): string {
  return getLanguageSettings().translationLanguage;
}

export function saveTranslationLanguage(code: string): LanguageSettings {
  return saveLanguageSettings({ translationLanguage: code });
}

export function saveTranscriptLanguage(code: string): LanguageSettings {
  return saveLanguageSettings({ transcriptLanguage: code });
}
