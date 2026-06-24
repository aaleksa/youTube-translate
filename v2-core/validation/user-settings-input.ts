import type { UserSettingsAutoPause, UserSettingsRecord } from '../types';

export const DEFAULT_INTERFACE_LANGUAGE = 'uk';
export const DEFAULT_TRANSLATION_LANGUAGE = 'uk';
export const DEFAULT_THEME = 'light';

export const DEFAULT_AUTO_PAUSE: UserSettingsAutoPause = {
  explainSentence: false,
  translateSelection: false,
  grammarAnalysis: false,
  quiz: false,
};

export function defaultUserSettings(userId: string): UserSettingsRecord {
  return {
    userId,
    interfaceLanguage: DEFAULT_INTERFACE_LANGUAGE,
    translationLanguage: DEFAULT_TRANSLATION_LANGUAGE,
    theme: DEFAULT_THEME,
    autoPause: { ...DEFAULT_AUTO_PAUSE },
    bilingualMode: false,
  };
}

export function parseAutoPause(value: unknown): UserSettingsAutoPause {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_AUTO_PAUSE };
  }

  const source = value as Partial<UserSettingsAutoPause>;
  return {
    explainSentence: Boolean(source.explainSentence),
    translateSelection: Boolean(source.translateSelection),
    grammarAnalysis: Boolean(source.grammarAnalysis),
    quiz: Boolean(source.quiz),
  };
}

export function parseStoredAutoPause(raw: string): UserSettingsAutoPause {
  try {
    return parseAutoPause(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AUTO_PAUSE };
  }
}
