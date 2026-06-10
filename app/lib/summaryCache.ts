import type { VideoSummaryResult } from './videoSummary';

const STORAGE_PREFIX = 'yoytube-summary-';

export interface SummaryCacheEntry extends VideoSummaryResult {
  videoId: string;
  textLength: number;
  taskLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${taskLanguage}`;
}

export function getSummaryCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoSummaryResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as SummaryCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.taskLanguage !== taskLanguage ||
      !entry.summary
    ) {
      return null;
    }

    return { summary: entry.summary };
  } catch {
    return null;
  }
}

export function setSummaryCache(
  videoId: string,
  textLength: number,
  taskLanguage: string,
  result: VideoSummaryResult
): void {
  const entry: SummaryCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    summary: result.summary,
    savedAt: Date.now(),
  };

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearSummaryCache(videoId: string): void {
  const prefix = `${STORAGE_PREFIX}${videoId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
