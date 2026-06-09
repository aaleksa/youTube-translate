import type { GrammarHighlightsResult } from './grammarHighlights';

const STORAGE_PREFIX = 'yoytube-grammar-';

export interface GrammarCacheEntry extends GrammarHighlightsResult {
  videoId: string;
  textLength: number;
  savedAt: number;
}

export function getGrammarCache(
  videoId: string,
  textLength: number
): GrammarHighlightsResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as GrammarCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.highlights)) {
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
  result: GrammarHighlightsResult
): void {
  const entry: GrammarCacheEntry = {
    videoId,
    textLength,
    highlights: result.highlights,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearGrammarCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
