import type { SlangItem } from './slang';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-slang-';

export interface SlangCacheEntry {
  videoId: string;
  textLength: number;
  slang: SlangItem[];
  savedAt: number;
}

export function getSlangCache(
  videoId: string,
  textLength: number
): SlangItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as SlangCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.slang)) {
      return null;
    }

    return entry.slang;
  } catch {
    return null;
  }
}

export function setSlangCache(
  videoId: string,
  textLength: number,
  slang: SlangItem[]
): void {
  const entry: SlangCacheEntry = {
    videoId,
    textLength,
    slang,
    savedAt: Date.now(),
  };

  setAiCacheRaw(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearSlangCache(videoId: string): void {
  removeAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
}
