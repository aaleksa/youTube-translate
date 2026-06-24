import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-bilingual-';

export interface BilingualCacheEntry {
  videoId: string;
  targetLanguage: string;
  lineCount: number;
  translations: string[];
  savedAt: number;
}

function cacheKey(videoId: string, targetLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${targetLanguage}`;
}

export function getBilingualCache(
  videoId: string,
  lineCount: number,
  targetLanguage: string
): string[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(cacheKey(videoId, targetLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as BilingualCacheEntry;
    if (
      entry.targetLanguage !== targetLanguage ||
      entry.lineCount !== lineCount ||
      !Array.isArray(entry.translations)
    ) {
      return null;
    }

    return entry.translations;
  } catch {
    return null;
  }
}

export function setBilingualCache(
  videoId: string,
  lineCount: number,
  targetLanguage: string,
  translations: string[]
): void {
  const entry: BilingualCacheEntry = {
    videoId,
    targetLanguage,
    lineCount,
    translations,
    savedAt: Date.now(),
  };

  setAiCacheRaw(
    cacheKey(videoId, targetLanguage),
    JSON.stringify(entry)
  );
}

export function clearBilingualCache(
  videoId: string,
  targetLanguage?: string
): void {
  if (targetLanguage) {
    removeAiCacheRaw(cacheKey(videoId, targetLanguage));
    return;
  }

  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
