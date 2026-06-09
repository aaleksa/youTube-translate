import type { PhrasalVerbItem } from './phrasalVerbs';

const STORAGE_PREFIX = 'yoytube-phrasal-verbs-';

export interface PhrasalVerbsCacheEntry {
  videoId: string;
  textLength: number;
  phrasalVerbs: PhrasalVerbItem[];
  savedAt: number;
}

export function getPhrasalVerbsCache(
  videoId: string,
  textLength: number
): PhrasalVerbItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as PhrasalVerbsCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.phrasalVerbs)) {
      return null;
    }

    return entry.phrasalVerbs;
  } catch {
    return null;
  }
}

export function setPhrasalVerbsCache(
  videoId: string,
  textLength: number,
  phrasalVerbs: PhrasalVerbItem[]
): void {
  const entry: PhrasalVerbsCacheEntry = {
    videoId,
    textLength,
    phrasalVerbs,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearPhrasalVerbsCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
