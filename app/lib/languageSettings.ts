import {
  detectBrowserInterfaceLanguage,
  isInterfaceLanguage,
  type InterfaceLanguage,
} from './i18n';
import {
  DEFAULT_TRANSLATION_LANGUAGE,
  isTranslationLanguage,
  type TranslationLanguageCode,
} from './translationLanguages';

const STORAGE_KEY = 'yoytube-language-settings';
const LEGACY_TRANSLATION_KEY = 'yoytube-translation-language';

export interface LanguageSettings {
  interfaceLanguage: InterfaceLanguage;
  transcriptLanguage: string;
  translationLanguage: TranslationLanguageCode;
}

function defaultSettings(): LanguageSettings {
  const interfaceLanguage = detectBrowserInterfaceLanguage();
  return {
    interfaceLanguage,
    transcriptLanguage: 'en',
    translationLanguage: interfaceLanguage,
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
          : isTranslationLanguage(migrated.interfaceLanguage)
            ? migrated.interfaceLanguage
            : DEFAULT_TRANSLATION_LANGUAGE,
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

export function getSavedTranslationLanguage(): TranslationLanguageCode {
  return getLanguageSettings().translationLanguage;
}

export function saveTranslationLanguage(code: string): LanguageSettings {
  if (!isTranslationLanguage(code)) {
    return getLanguageSettings();
  }
  return saveLanguageSettings({ translationLanguage: code });
}

export function saveTranscriptLanguage(code: string): LanguageSettings {
  return saveLanguageSettings({ transcriptLanguage: code });
}
