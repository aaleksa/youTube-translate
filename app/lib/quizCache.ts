import type { VideoQuiz } from './videoQuiz';

const STORAGE_PREFIX = 'yoytube-quiz-';

export interface QuizCacheEntry extends VideoQuiz {
  videoId: string;
  textLength: number;
  savedAt: number;
}

export function getQuizCache(
  videoId: string,
  textLength: number
): VideoQuiz | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as QuizCacheEntry;
    if (entry.textLength !== textLength || !Array.isArray(entry.questions)) {
      return null;
    }

    if (entry.questions.length < 5) return null;

    return { questions: entry.questions };
  } catch {
    return null;
  }
}

export function setQuizCache(
  videoId: string,
  textLength: number,
  quiz: VideoQuiz
): void {
  const entry: QuizCacheEntry = {
    videoId,
    textLength,
    questions: quiz.questions,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(entry));
}

export function clearQuizCache(videoId: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`);
}
