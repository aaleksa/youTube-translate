import type { VideoChaptersResult } from './videoChapters';

const STORAGE_PREFIX = 'yoytube-chapters-';

export interface ChaptersCacheEntry extends VideoChaptersResult {
  videoId: string;
  textLength: number;
  interfaceLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, interfaceLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${interfaceLanguage}`;
}

export function getChaptersCache(
  videoId: string,
  textLength: number,
  interfaceLanguage: string
): VideoChaptersResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, interfaceLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as ChaptersCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.interfaceLanguage !== interfaceLanguage ||
      !Array.isArray(entry.chapters) ||
      entry.chapters.length === 0
    ) {
      return null;
    }

    return { chapters: entry.chapters };
  } catch {
    return null;
  }
}

export function setChaptersCache(
  videoId: string,
  textLength: number,
  interfaceLanguage: string,
  result: VideoChaptersResult
): void {
  const entry: ChaptersCacheEntry = {
    videoId,
    textLength,
    interfaceLanguage,
    chapters: result.chapters,
    savedAt: Date.now(),
  };

  localStorage.setItem(
    cacheKey(videoId, interfaceLanguage),
    JSON.stringify(entry)
  );
}
