import type { VideoSummaryResult } from './videoSummary';

const STORAGE_PREFIX = 'yoytube-summary-';

export interface SummaryCacheEntry extends VideoSummaryResult {
  videoId: string;
  textLength: number;
  savedAt: number;
}

export function getSummaryCache(
  videoId: string,
  textLength: number
): VideoSummaryResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as SummaryCacheEntry;
    if (entry.textLength !== textLength || !entry.summary) {
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
  result: VideoSummaryResult
): void {
  const entry: SummaryCacheEntry = {
    videoId,
    textLength,
    summary: result.summary,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearSummaryCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
