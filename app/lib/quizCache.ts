import type { VideoQuiz } from './videoQuiz';

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
    const raw = localStorage.getItem(cacheKey(videoId, taskLanguage));
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

  localStorage.setItem(cacheKey(videoId, taskLanguage), JSON.stringify(entry));
}

export function clearQuizCache(videoId: string): void {
  const prefix = `${STORAGE_PREFIX}${videoId}`;
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  }
}
