import type { FrequentWordItem } from './frequentWords';

const STORAGE_PREFIX = 'yoytube-frequent-words-';

export interface FrequentWordsCacheEntry {
  videoId: string;
  textLength: number;
  frequentWords: FrequentWordItem[];
  savedAt: number;
}

export function getFrequentWordsCache(
  videoId: string,
  textLength: number
): FrequentWordItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as FrequentWordsCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.frequentWords)) {
      return null;
    }

    return entry.frequentWords;
  } catch {
    return null;
  }
}

export function setFrequentWordsCache(
  videoId: string,
  textLength: number,
  frequentWords: FrequentWordItem[]
): void {
  const entry: FrequentWordsCacheEntry = {
    videoId,
    textLength,
    frequentWords,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearFrequentWordsCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
