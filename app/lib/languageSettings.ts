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
import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-language-settings';
const LEGACY_TRANSLATION_KEY = 'yoytube-translation-language';

function languageSettingsStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export interface LanguageSettings {
  interfaceLanguage: InterfaceLanguage;
  transcriptLanguage: string;
  translationLanguage: TranslationLanguageCode;
  /** Language for AI tasks: quiz, notes, summaries, explanations */
  taskLanguage: TranslationLanguageCode;
}

function defaultSettings(): LanguageSettings {
  const interfaceLanguage = detectBrowserInterfaceLanguage();
  return {
    interfaceLanguage,
    transcriptLanguage: 'en',
    translationLanguage: interfaceLanguage,
    taskLanguage: interfaceLanguage,
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
    const raw = localStorage.getItem(languageSettingsStorageKey());
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
      taskLanguage:
        parsed.taskLanguage && isTranslationLanguage(parsed.taskLanguage)
          ? parsed.taskLanguage
          : parsed.translationLanguage &&
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

  localStorage.setItem(languageSettingsStorageKey(), JSON.stringify(next));
  localStorage.setItem(LEGACY_TRANSLATION_KEY, next.translationLanguage);

  void import('./v2/syncUserSettings').then(({ scheduleUserSettingsSync }) => {
    scheduleUserSettingsSync();
  });

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

export function getSavedTaskLanguage(): TranslationLanguageCode {
  return getLanguageSettings().taskLanguage;
}

export function saveTaskLanguage(code: string): LanguageSettings {
  if (!isTranslationLanguage(code)) {
    return getLanguageSettings();
  }
  return saveLanguageSettings({ taskLanguage: code });
}

export function saveTranscriptLanguage(code: string): LanguageSettings {
  return saveLanguageSettings({ transcriptLanguage: code });
}
