import { isBackendV2Enabled } from './config';
import { getStoredUser } from './tokenStorage';

const LAST_USER_ID_KEY = 'yoytube-v2-last-user-id';

export function getActiveUserId(): string | null {
  if (!isBackendV2Enabled() || typeof window === 'undefined') {
    return null;
  }

  return getStoredUser()?.userId ?? null;
}

const ANONYMOUS_SCOPE = '__anonymous__';

export function scopedStorageKeyForUser(baseKey: string, userId: string): string {
  return `${baseKey}::${userId}`;
}

/** Per-user localStorage key when V2 auth is enabled. */
export function userScopedStorageKey(baseKey: string): string {
  if (!isBackendV2Enabled()) {
    return baseKey;
  }

  const userId = getActiveUserId();
  return userId
    ? scopedStorageKeyForUser(baseKey, userId)
    : scopedStorageKeyForUser(baseKey, ANONYMOUS_SCOPE);
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

const MIGRATABLE_LEGACY_KEYS = new Set<string>([
  'yoytube-transcript-history',
  'yoytube-language-settings',
  'yoytube-translation-language',
]);

function tryParseJson(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Copy legacy global keys into the active user scope before they are cleared. */
export function migrateLegacyUserDataToScoped(
  userId: string,
  options?: { firstSessionOnBrowser?: boolean }
): void {
  if (typeof window === 'undefined' || !userId) return;

  const firstSessionOnBrowser = options?.firstSessionOnBrowser ?? false;

  for (const baseKey of LEGACY_USER_DATA_KEYS) {
    const legacyRaw = localStorage.getItem(baseKey);
    if (!legacyRaw) continue;

    if (!firstSessionOnBrowser && !MIGRATABLE_LEGACY_KEYS.has(baseKey)) {
      continue;
    }

    const scopedKey = scopedStorageKeyForUser(baseKey, userId);
    const scopedRaw = localStorage.getItem(scopedKey);

    if (baseKey === 'yoytube-transcript-history') {
      if (isBackendV2Enabled()) {
        continue;
      }

      const legacyEntries = tryParseJson(legacyRaw);
      if (!Array.isArray(legacyEntries) || legacyEntries.length === 0) continue;

      const scopedEntries = scopedRaw ? tryParseJson(scopedRaw) : null;
      const merged =
        Array.isArray(scopedEntries) && scopedEntries.length > 0
          ? mergeTranscriptHistoryForMigration(scopedEntries, legacyEntries)
          : legacyEntries;

      localStorage.setItem(scopedKey, JSON.stringify(merged));
      continue;
    }

    if (!scopedRaw) {
      localStorage.setItem(scopedKey, legacyRaw);
    }
  }
}

function mergeTranscriptHistoryForMigration(
  scoped: unknown[],
  legacy: unknown[]
): unknown[] {
  const byVideoId = new Map<string, Record<string, unknown>>();

  for (const entry of [...scoped, ...legacy]) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const videoId = typeof record.videoId === 'string' ? record.videoId : '';
    if (!videoId) continue;

    const existing = byVideoId.get(videoId);
    if (!existing) {
      byVideoId.set(videoId, record);
      continue;
    }

    const savedAt = Math.max(
      typeof existing.savedAt === 'number' ? existing.savedAt : 0,
      typeof record.savedAt === 'number' ? record.savedAt : 0
    );

    byVideoId.set(videoId, {
      ...existing,
      ...record,
      title: record.title || existing.title,
      url: record.url || existing.url,
      text: record.text || existing.text,
      savedAt,
    });
  }

  return [...byVideoId.values()].sort((left, right) => {
    const leftSavedAt = typeof left.savedAt === 'number' ? left.savedAt : 0;
    const rightSavedAt = typeof right.savedAt === 'number' ? right.savedAt : 0;
    return rightSavedAt - leftSavedAt;
  });
}

export function clearUserScopedLocalData(userId: string): void {
  if (typeof window === 'undefined' || !userId) return;

  for (const baseKey of LEGACY_USER_DATA_KEYS) {
    localStorage.removeItem(scopedStorageKeyForUser(baseKey, userId));
  }
}

export function clearLegacyGlobalUserData(): void {
  if (typeof window === 'undefined') return;

  for (const key of LEGACY_USER_DATA_KEYS) {
    localStorage.removeItem(key);
  }
}
