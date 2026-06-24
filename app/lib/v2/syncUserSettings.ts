import type {
  CreateQuizResultInput,
  UpdateUserSettingsInput,
  UserSettingsRecord,
} from '../../../v2-core/types';
import {
  getLearningGoals,
  saveDailyCardGoal,
  saveLearningLevel,
  saveVocabularyGoal,
  type LearningLevel,
} from '../learningGoals';
import { getLearningSettings, saveLearningSettings } from '../learningSettings';
import {
  getLanguageSettings,
  saveLanguageSettings,
  type LanguageSettings,
} from '../languageSettings';
import { isInterfaceLanguage } from '../i18n';
import { isTranslationLanguage } from '../translationLanguages';
import { isBackendV2Enabled } from './config';
import * as settingsApi from './settingsApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

const SYNC_DEBOUNCE_MS = 2000;
const SETTINGS_SYNCED_EVENT = 'yoytube-settings-synced';

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let bootstrapPromise: Promise<void> | null = null;
let applyingRemote = false;

export function resetUserSettingsSyncBootstrap(): void {
  bootstrapPromise = null;
}

export function cancelPendingUserSettingsSync(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

function readLocalTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
}

function buildLocalSettingsPayload(): UpdateUserSettingsInput {
  const language = getLanguageSettings();
  const goals = getLearningGoals();
  const learning = getLearningSettings();

  return {
    interfaceLanguage: language.interfaceLanguage,
    translationLanguage: language.translationLanguage,
    theme: readLocalTheme(),
    autoPause: learning.autoPause,
    dailyCardGoal: goals.dailyCardGoal,
    vocabularyGoal: goals.vocabularyGoal,
    learningLevel: goals.learningLevel,
  };
}

function applyServerSettings(record: UserSettingsRecord): void {
  applyingRemote = true;
  try {
    saveLearningSettings({ autoPause: record.autoPause });

    const currentGoals = getLearningGoals();
    if (currentGoals.dailyCardGoal !== record.dailyCardGoal) {
      saveDailyCardGoal(record.dailyCardGoal);
    }
    if (currentGoals.vocabularyGoal !== record.vocabularyGoal) {
      saveVocabularyGoal(record.vocabularyGoal);
    }
    if (currentGoals.learningLevel !== record.learningLevel) {
      saveLearningLevel(record.learningLevel as LearningLevel);
    }

    const languagePatch: Partial<LanguageSettings> = {};
    const currentLanguage = getLanguageSettings();

    if (
      isInterfaceLanguage(record.interfaceLanguage) &&
      currentLanguage.interfaceLanguage !== record.interfaceLanguage
    ) {
      languagePatch.interfaceLanguage = record.interfaceLanguage;
    }

    if (
      isTranslationLanguage(record.translationLanguage) &&
      currentLanguage.translationLanguage !== record.translationLanguage
    ) {
      languagePatch.translationLanguage = record.translationLanguage;
    }

    if (Object.keys(languagePatch).length > 0) {
      saveLanguageSettings(languagePatch);
    }

    if (typeof window !== 'undefined') {
      const theme = record.theme === 'dark' ? 'dark' : 'light';
      if (readLocalTheme() !== theme) {
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new Event(SETTINGS_SYNCED_EVENT));
      }
    }
  } finally {
    applyingRemote = false;
  }
}

async function pushUserSettings(): Promise<void> {
  if (!canSync() || applyingRemote) return;

  await withPendingSync(async () => {
    try {
      await settingsApi.updateUserSettings(buildLocalSettingsPayload());
    } catch (error) {
      console.warn('[settings] Failed to push to server:', error);
    }
  });
}

export function scheduleUserSettingsSync(): void {
  if (!canSync() || applyingRemote) return;

  if (pushTimer) {
    clearTimeout(pushTimer);
  }

  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushUserSettings();
  }, SYNC_DEBOUNCE_MS);
}

export async function bootstrapUserSettingsSync(_userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const serverSettings = await settingsApi.getUserSettings();
      applyServerSettings(serverSettings);
    } catch (error) {
      console.warn('[settings] Failed to load from server:', error);
    }
  })();

  return bootstrapPromise;
}

export { SETTINGS_SYNCED_EVENT };
