import type { CollocationItem } from './collocations';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-collocations-';

export interface CollocationsCacheEntry {
  videoId: string;
  textLength: number;
  collocations: CollocationItem[];
  savedAt: number;
}

export function getCollocationsCache(
  videoId: string,
  textLength: number
): CollocationItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CollocationsCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.collocations)) {
      return null;
    }

    return entry.collocations;
  } catch {
    return null;
  }
}

export function setCollocationsCache(
  videoId: string,
  textLength: number,
  collocations: CollocationItem[]
): void {
  const entry: CollocationsCacheEntry = {
    videoId,
    textLength,
    collocations,
    savedAt: Date.now(),
  };

  setAiCacheRaw(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearCollocationsCache(videoId: string): void {
  removeAiCacheRaw(`${STORAGE_PREFIX}${videoId}`);
}
