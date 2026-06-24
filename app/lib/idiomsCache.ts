import type { IdiomItem } from './idioms';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-idioms-';

export interface IdiomsCacheEntry {
  videoId: string;
  textLength: number;
  idioms: IdiomItem[];
  savedAt: number;
}

function cacheKey(videoId: string, translationLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${translationLanguage}`;
}

export function getIdiomsCache(
  videoId: string,
  textLength: number,
  translationLanguage: string
): IdiomItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(cacheKey(videoId, translationLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as IdiomsCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.idioms)) {
      return null;
    }

    return entry.idioms;
  } catch {
    return null;
  }
}

export function setIdiomsCache(
  videoId: string,
  textLength: number,
  idioms: IdiomItem[],
  translationLanguage: string
): void {
  const entry: IdiomsCacheEntry = {
    videoId,
    textLength,
    idioms,
    savedAt: Date.now(),
  };

  setAiCacheRaw(
    cacheKey(videoId, translationLanguage),
    JSON.stringify(entry)
  );
}

export function clearIdiomsCache(
  videoId: string,
  translationLanguage?: string
): void {
  if (translationLanguage) {
    removeAiCacheRaw(cacheKey(videoId, translationLanguage));
    return;
  }

  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
