const STORAGE_PREFIX = 'yoytube-bilingual-';

export interface BilingualCacheEntry {
  videoId: string;
  lineCount: number;
  translations: string[];
  savedAt: number;
}

export function getBilingualCache(videoId: string, lineCount: number): string[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as BilingualCacheEntry;
    if (entry.lineCount !== lineCount || !Array.isArray(entry.translations)) {
      return null;
    }

    return entry.translations;
  } catch {
    return null;
  }
}

export function setBilingualCache(
  videoId: string,
  lineCount: number,
  translations: string[]
): void {
  const entry: BilingualCacheEntry = {
    videoId,
    lineCount,
    translations,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearBilingualCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
