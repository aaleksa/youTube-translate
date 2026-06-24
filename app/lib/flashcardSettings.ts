import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-flashcard-settings';

export interface FlashcardSettings {
  autoEnrichNewCards: boolean;
}

const DEFAULT_SETTINGS: FlashcardSettings = {
  autoEnrichNewCards: true,
};

function flashcardSettingsStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export function getFlashcardSettings(): FlashcardSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(flashcardSettingsStorageKey());
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<FlashcardSettings>;
    return {
      autoEnrichNewCards:
        parsed.autoEnrichNewCards ?? DEFAULT_SETTINGS.autoEnrichNewCards,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveFlashcardSettings(settings: FlashcardSettings): void {
  localStorage.setItem(flashcardSettingsStorageKey(), JSON.stringify(settings));
}

export function updateAutoEnrichNewCards(enabled: boolean): FlashcardSettings {
  const settings = { ...getFlashcardSettings(), autoEnrichNewCards: enabled };
  saveFlashcardSettings(settings);
  return settings;
}

export function isAutoEnrichNewCardsEnabled(): boolean {
  return getFlashcardSettings().autoEnrichNewCards;
}
