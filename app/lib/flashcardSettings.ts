const STORAGE_KEY = 'yoytube-flashcard-settings';

export interface FlashcardSettings {
  autoEnrichNewCards: boolean;
}

const DEFAULT_SETTINGS: FlashcardSettings = {
  autoEnrichNewCards: true,
};

export function getFlashcardSettings(): FlashcardSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateAutoEnrichNewCards(enabled: boolean): FlashcardSettings {
  const settings = { ...getFlashcardSettings(), autoEnrichNewCards: enabled };
  saveFlashcardSettings(settings);
  return settings;
}

export function isAutoEnrichNewCardsEnabled(): boolean {
  return getFlashcardSettings().autoEnrichNewCards;
}
