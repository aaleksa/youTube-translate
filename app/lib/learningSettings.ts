import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-learning-settings';

export type AutoPauseFeature =
  | 'explainSentence'
  | 'translateSelection'
  | 'grammarAnalysis'
  | 'quiz';

export interface LearningSettings {
  autoPause: Record<AutoPauseFeature, boolean>;
}

const DEFAULT_SETTINGS: LearningSettings = {
  autoPause: {
    explainSentence: false,
    translateSelection: false,
    grammarAnalysis: false,
    quiz: false,
  },
};

function learningSettingsStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export function getLearningSettings(): LearningSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(learningSettingsStorageKey());
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<LearningSettings>;
    return {
      autoPause: {
        ...DEFAULT_SETTINGS.autoPause,
        ...parsed.autoPause,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLearningSettings(settings: LearningSettings): void {
  localStorage.setItem(learningSettingsStorageKey(), JSON.stringify(settings));
}

export function updateAutoPause(
  feature: AutoPauseFeature,
  enabled: boolean
): LearningSettings {
  const settings = getLearningSettings();
  settings.autoPause[feature] = enabled;
  saveLearningSettings(settings);
  return settings;
}

export function shouldAutoPause(feature: AutoPauseFeature): boolean {
  return getLearningSettings().autoPause[feature];
}
