import { isBackendV2Enabled } from './config';
import { getStoredUser } from './tokenStorage';

const LAST_USER_ID_KEY = 'yoytube-v2-last-user-id';

export function getActiveUserId(): string | null {
  if (!isBackendV2Enabled() || typeof window === 'undefined') {
    return null;
  }

  const storedUser = getStoredUser();
  if (storedUser?.userId) return storedUser.userId;

  return localStorage.getItem(LAST_USER_ID_KEY);
}

/** Per-user localStorage key when V2 auth is enabled. */
export function userScopedStorageKey(baseKey: string): string {
  const userId = getActiveUserId();
  return userId ? `${baseKey}::${userId}` : baseKey;
}

export const LEGACY_USER_DATA_KEYS = [
  'yoytube-flashcards',
  'yoytube-decks',
  'yoytube-bookmarks',
  'yoytube-quiz-attempts',
  'yoytube-pronunciation-attempts',
  'yoytube-daily-study',
  'yoytube-learning-goals',
  'yoytube-learning-settings',
  'yoytube-flashcard-settings',
  'yoytube-sentences',
  'yoytube-transcript-history',
  'yoytube-language-settings',
  'yoytube-translation-language',
] as const;

export function clearLegacyGlobalUserData(): void {
  if (typeof window === 'undefined') return;

  for (const key of LEGACY_USER_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}
