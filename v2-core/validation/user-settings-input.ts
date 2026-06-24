import { ApiError } from '../errors';
import type {
  UpdateUserSettingsInput,
  UserSettingsAutoPause,
  UserSettingsRecord,
} from '../types';

export const DEFAULT_INTERFACE_LANGUAGE = 'uk';
export const DEFAULT_TRANSLATION_LANGUAGE = 'uk';
export const DEFAULT_THEME = 'light';
export const DEFAULT_DAILY_CARD_GOAL = 30;
export const DEFAULT_VOCABULARY_GOAL = 1000;
export const DEFAULT_LEARNING_LEVEL = 'intermediate';

const VALID_LEARNING_LEVELS = new Set(['beginner', 'intermediate', 'advanced']);

const VALID_LANGUAGE_CODES = new Set([
  'uk',
  'en',
  'pl',
  'es',
  'de',
  'fr',
]);
const VALID_THEMES = new Set(['light', 'dark']);
const AUTO_PAUSE_KEYS = [
  'explainSentence',
  'translateSelection',
  'grammarAnalysis',
  'quiz',
] as const;

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
    dailyCardGoal: DEFAULT_DAILY_CARD_GOAL,
    vocabularyGoal: DEFAULT_VOCABULARY_GOAL,
    learningLevel: DEFAULT_LEARNING_LEVEL,
  };
}

function validateLanguageCode(
  value: unknown,
  field: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(`${field} must be a string`, 400, 'INVALID_USER_SETTINGS');
  }

  const code = value.trim().toLowerCase();
  if (!VALID_LANGUAGE_CODES.has(code)) {
    throw new ApiError(`${field} has an invalid value`, 400, 'INVALID_USER_SETTINGS');
  }

  return code;
}

function validateTheme(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError('theme must be a string', 400, 'INVALID_USER_SETTINGS');
  }

  const theme = value.trim().toLowerCase();
  if (!VALID_THEMES.has(theme)) {
    throw new ApiError('theme must be light or dark', 400, 'INVALID_USER_SETTINGS');
  }

  return theme;
}

function validateAutoPausePatch(
  value: unknown
): Partial<UserSettingsAutoPause> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'object') {
    throw new ApiError('autoPause must be an object', 400, 'INVALID_USER_SETTINGS');
  }

  const source = value as Record<string, unknown>;
  const patch: Partial<UserSettingsAutoPause> = {};

  for (const key of AUTO_PAUSE_KEYS) {
    if (source[key] === undefined) continue;
    if (typeof source[key] !== 'boolean') {
      throw new ApiError(
        `autoPause.${key} must be a boolean`,
        400,
        'INVALID_USER_SETTINGS'
      );
    }
    patch[key] = source[key];
  }

  return Object.keys(patch).length > 0 ? patch : undefined;
}

function validatePositiveInteger(
  value: unknown,
  field: string
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new ApiError(
      `${field} must be a positive number`,
      400,
      'INVALID_USER_SETTINGS'
    );
  }

  return Math.round(numeric);
}

function validateLearningLevel(
  value: unknown
): UserSettingsRecord['learningLevel'] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(
      'learningLevel must be a string',
      400,
      'INVALID_USER_SETTINGS'
    );
  }

  const level = value.trim().toLowerCase();
  if (!VALID_LEARNING_LEVELS.has(level)) {
    throw new ApiError(
      'learningLevel has an invalid value',
      400,
      'INVALID_USER_SETTINGS'
    );
  }

  return level as UserSettingsRecord['learningLevel'];
}

export function validateUpdateUserSettingsInput(
  input: UpdateUserSettingsInput
): UpdateUserSettingsInput {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_USER_SETTINGS');
  }

  const interfaceLanguage = validateLanguageCode(
    input.interfaceLanguage,
    'interfaceLanguage'
  );
  const translationLanguage = validateLanguageCode(
    input.translationLanguage,
    'translationLanguage'
  );
  const theme = validateTheme(input.theme);
  const autoPause = validateAutoPausePatch(input.autoPause);
  const dailyCardGoal = validatePositiveInteger(
    input.dailyCardGoal,
    'dailyCardGoal'
  );
  const vocabularyGoal = validatePositiveInteger(
    input.vocabularyGoal,
    'vocabularyGoal'
  );
  const learningLevel = validateLearningLevel(input.learningLevel);

  let bilingualMode: boolean | undefined;
  if (input.bilingualMode !== undefined && input.bilingualMode !== null) {
    if (typeof input.bilingualMode !== 'boolean') {
      throw new ApiError(
        'bilingualMode must be a boolean',
        400,
        'INVALID_USER_SETTINGS'
      );
    }
    bilingualMode = input.bilingualMode;
  }

  if (
    interfaceLanguage === undefined &&
    translationLanguage === undefined &&
    theme === undefined &&
    autoPause === undefined &&
    bilingualMode === undefined &&
    dailyCardGoal === undefined &&
    vocabularyGoal === undefined &&
    learningLevel === undefined
  ) {
    throw new ApiError(
      'At least one setting field is required',
      400,
      'INVALID_USER_SETTINGS'
    );
  }

  return {
    ...(interfaceLanguage !== undefined ? { interfaceLanguage } : {}),
    ...(translationLanguage !== undefined ? { translationLanguage } : {}),
    ...(theme !== undefined ? { theme } : {}),
    ...(autoPause !== undefined ? { autoPause } : {}),
    ...(bilingualMode !== undefined ? { bilingualMode } : {}),
    ...(dailyCardGoal !== undefined ? { dailyCardGoal } : {}),
    ...(vocabularyGoal !== undefined ? { vocabularyGoal } : {}),
    ...(learningLevel !== undefined ? { learningLevel } : {}),
  };
}

export function mergeUserSettings(
  current: UserSettingsRecord,
  patch: UpdateUserSettingsInput
): UserSettingsRecord {
  return {
    userId: current.userId,
    interfaceLanguage: patch.interfaceLanguage ?? current.interfaceLanguage,
    translationLanguage:
      patch.translationLanguage ?? current.translationLanguage,
    theme: patch.theme ?? current.theme,
    autoPause: {
      ...current.autoPause,
      ...(patch.autoPause ?? {}),
    },
    bilingualMode: patch.bilingualMode ?? current.bilingualMode,
    dailyCardGoal: patch.dailyCardGoal ?? current.dailyCardGoal,
    vocabularyGoal: patch.vocabularyGoal ?? current.vocabularyGoal,
    learningLevel: patch.learningLevel ?? current.learningLevel,
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
