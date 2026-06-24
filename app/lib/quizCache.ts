import type { VideoQuiz } from './videoQuiz';

import {
  getAiCacheRaw,
  removeAiCacheKeysWithLogicalPrefix,
  removeAiCacheRaw,
  setAiCacheRaw,
} from './aiCacheStorage';

const STORAGE_PREFIX = 'yoytube-quiz-';

export interface QuizCacheEntry extends VideoQuiz {
  videoId: string;
  textLength: number;
  taskLanguage: string;
  savedAt: number;
}

function cacheKey(videoId: string, taskLanguage: string): string {
  return `${STORAGE_PREFIX}${videoId}-${taskLanguage}`;
}

export function getQuizCache(
  videoId: string,
  textLength: number,
  taskLanguage: string
): VideoQuiz | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = getAiCacheRaw(cacheKey(videoId, taskLanguage));
    if (!raw) return null;

    const entry = JSON.parse(raw) as QuizCacheEntry;
    if (
      entry.textLength !== textLength ||
      entry.taskLanguage !== taskLanguage ||
      !Array.isArray(entry.questions)
    ) {
      return null;
    }

    if (entry.questions.length < 3) return null;

    return { questions: entry.questions };
  } catch {
    return null;
  }
}

export function setQuizCache(
  videoId: string,
  textLength: number,
  taskLanguage: string,
  quiz: VideoQuiz
): void {
  const entry: QuizCacheEntry = {
    videoId,
    textLength,
    taskLanguage,
    questions: quiz.questions,
    savedAt: Date.now(),
  };

  setAiCacheRaw(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearQuizCache(videoId: string): void {
  removeAiCacheKeysWithLogicalPrefix(`${STORAGE_PREFIX}${videoId}`);
}
