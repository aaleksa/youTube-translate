import type { VideoTimelineResult } from './videoTimeline';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

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
    const raw = getAiCacheRaw(cacheKey(videoId, taskLanguage));
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

  setAiCacheRaw(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearTimelineCache(videoId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
