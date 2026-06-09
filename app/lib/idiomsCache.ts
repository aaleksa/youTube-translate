import type { IdiomItem } from './idioms';

const STORAGE_PREFIX = 'yoytube-idioms-';

export interface IdiomsCacheEntry {
  videoId: string;
  textLength: number;
  idioms: IdiomItem[];
  savedAt: number;
}

export function getIdiomsCache(
  videoId: string,
  textLength: number
): IdiomItem[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
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
  idioms: IdiomItem[]
): void {
  const entry: IdiomsCacheEntry = {
    videoId,
    textLength,
    idioms,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearIdiomsCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
