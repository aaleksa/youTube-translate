import type { VideoSummaryResult } from './videoSummary';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

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
    const raw = getAiCacheRaw(cacheKey(videoId, taskLanguage));
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

  setAiCacheRaw(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearSummaryCache(videoId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
