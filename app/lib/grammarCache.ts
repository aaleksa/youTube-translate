import type { GrammarHighlightsResult } from './grammarHighlights';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-grammar-';

export interface GrammarCacheEntry extends GrammarHighlightsResult {
  videoId: string;
  textLength: number;
  taskLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${taskLanguage}`;
}

export function getGrammarCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): GrammarHighlightsResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as GrammarCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.taskLanguage !== taskLanguage ||
      !Array.isArray(entry.highlights)
    ) {
      return null;
    }

    return { highlights: entry.highlights };
  } catch {
    return null;
  }
}

export function setGrammarCache(
  videoId: string,
  textLength: number,
  taskLanguage: string,
  result: GrammarHighlightsResult
): void {
  const entry: GrammarCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    highlights: result.highlights,
    savedAt: Date.now(),
  };

  setAiCacheRaw(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearGrammarCache(videoId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
