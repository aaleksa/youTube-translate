import type { VideoDifficultyResult } from './cefrLevel';

const STORAGE_PREFIX = 'yoytube-difficulty-';

export interface DifficultyCacheEntry extends VideoDifficultyResult {
  videoId: string;
  textLength: number;
  savedAt: number;
}

export function getDifficultyCache(
  videoId: string,
  textLength: number
): VideoDifficultyResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as DifficultyCacheEntry;
    if (entry.textLength !== textLength || !entry.level || !entry.explanation) {
      return null;
    }

    return {
      level: entry.level,
      explanation: entry.explanation,
    };
  } catch {
    return null;
  }
}

export function setDifficultyCache(
  videoId: string,
  textLength: number,
  result: VideoDifficultyResult
): void {
  const entry: DifficultyCacheEntry = {
    videoId,
    textLength,
    level: result.level,
    explanation: result.explanation,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearDifficultyCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
