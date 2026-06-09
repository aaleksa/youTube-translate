import type { VideoTimelineResult } from './videoTimeline';

const STORAGE_PREFIX = 'yoytube-timeline-';

export interface TimelineCacheEntry extends VideoTimelineResult {
  videoId: string;
  textLength: number;
  interfaceLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, interfaceLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${interfaceLanguage}`;
}

export function getTimelineCache(
  videoId: string,
  textLength: number,
  interfaceLanguage: string
): VideoTimelineResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, interfaceLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as TimelineCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.interfaceLanguage !== interfaceLanguage ||
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
  interfaceLanguage: string,
  result: VideoTimelineResult
): void {
  const entry: TimelineCacheEntry = {
    videoId,
    textLength,
    interfaceLanguage,
    moments: result.moments,
    savedAt: Date.now(),
  };

  localStorage.setItem(
    cacheKey(videoId, interfaceLanguage),
    JSON.stringify(entry)
  );
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
