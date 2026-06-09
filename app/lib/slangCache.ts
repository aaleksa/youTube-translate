import type { SlangItem } from './slang';

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
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
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

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearSlangCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
