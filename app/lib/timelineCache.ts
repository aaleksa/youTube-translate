import type { VideoTimelineResult } from './videoTimeline';

const STORAGE_PREFIX = 'yoytube-timeline-';

export interface TimelineCacheEntry extends VideoTimelineResult {
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

function entryTaskLanguage(entry: TimelineCacheEntry): string {
  return entry.taskLanguage ?? entry.interfaceLanguage ?? '';
}

export function getTimelineCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoTimelineResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as TimelineCacheEntry;
    if (
      entry.textLength !== textLength ||
      entryTaskLanguage(entry) !== taskLanguage ||
      !Array.isArray(entry.moments) ||
      entry.moments.length === 0
    ) {
      return null;
    }

    return { moments: entry.moments };
  } catch {
    return null;
  }
}

export function setTimelineCache(
  videoId: string,
  textLength: number,
  taskLanguage: string,
  result: VideoTimelineResult
): void {
  const entry: TimelineCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    moments: result.moments,
    savedAt: Date.now(),
  };

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearTimelineCache(videoId: string): void {
  const prefix = `${STORAGE_PREFIX}${videoId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
