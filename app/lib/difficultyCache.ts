import type { VideoDifficultyResult } from './cefrLevel';

const STORAGE_PREFIX = 'yoytube-difficulty-';

export interface DifficultyCacheEntry extends VideoDifficultyResult {
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

function entryTaskLanguage(entry: DifficultyCacheEntry): string {
  return entry.taskLanguage ?? entry.interfaceLanguage ?? '';
}

export function getDifficultyCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoDifficultyResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as DifficultyCacheEntry;
    if (
      entry.textLength !== textLength ||
      entryTaskLanguage(entry) !== taskLanguage ||
      !entry.level ||
      !entry.explanation
    ) {
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
  taskLanguage: string,
  result: VideoDifficultyResult
): void {
  const entry: DifficultyCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    level: result.level,
    explanation: result.explanation,
    savedAt: Date.now(),
  };

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearDifficultyCache(videoId: string): void {
  const prefix = `${STORAGE_PREFIX}${videoId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
