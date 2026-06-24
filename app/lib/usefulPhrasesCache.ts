import type { UsefulPhraseItem } from './usefulPhrases';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-useful-phrases-';

export interface UsefulPhrasesCacheEntry {
  videoId: string;
  textLength: number;
  phrases: UsefulPhraseItem[];
  savedAt: number;
}

export function getUsefulPhrasesCache(
  videoId: string,
  textLength: number
): UsefulPhraseItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as UsefulPhrasesCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.phrases)) {
      return null;
    }

    return entry.phrases;
  } catch {
    return null;
  }
}

export function setUsefulPhrasesCache(
  videoId: string,
  textLength: number,
  phrases: UsefulPhraseItem[]
): void {
  const entry: UsefulPhrasesCacheEntry = {
    videoId,
    textLength,
    phrases,
    savedAt: Date.now(),
  };

  setAiCacheRaw(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearUsefulPhrasesCache(videoId: string): void {
  removeAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
}
