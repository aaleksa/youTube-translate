import type { VideoChaptersResult } from './videoChapters';

const STORAGE_PREFIX = 'yoytube-chapters-';

export interface ChaptersCacheEntry extends VideoChaptersResult {
  videoId: string;
  textLength: number;
  taskLanguage: string;
  /** @deprecated legacy field */
  interfaceLanguage?: string;
  savedAt: number;
}

function cacheKey(videoId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${taskLanguage}`;
}

function entryTaskLanguage(entry: ChaptersCacheEntry): string {
  return entry.taskLanguage ?? entry.interfaceLanguage ?? '';
}

export function getChaptersCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoChaptersResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as ChaptersCacheEntry;
    if (
      entry.textLength !== textLength ||
      entryTaskLanguage(entry) !== taskLanguage ||
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
  taskLanguage: string,
  result: VideoChaptersResult
): void {
  const entry: ChaptersCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    chapters: result.chapters,
    savedAt: Date.now(),
  };

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}
