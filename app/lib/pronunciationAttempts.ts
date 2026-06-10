import type { ShadowingAttempt } from './pronunciationTypes';

const STORAGE_KEY = 'yoytube-pronunciation-attempts';
const MAX_ATTEMPTS = 200;

export function getPronunciationAttempts(): ShadowingAttempt[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShadowingAttempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePronunciationAttempt(attempt: ShadowingAttempt): ShadowingAttempt[] {
  const updated = [attempt, ...getPronunciationAttempts()].slice(0, MAX_ATTEMPTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getAttemptsForPhrase(
  videoId: string,
  phraseId?: string,
  expectedText?: string
): ShadowingAttempt[] {
  return getPronunciationAttempts().filter((attempt) => {
    if (attempt.videoId !== videoId) return false;
    if (phraseId && attempt.phraseId === phraseId) return true;
    if (expectedText && attempt.expectedText === expectedText) return true;
    return false;
  });
}

export function getBestScoreForPhrase(
  videoId: string,
  phraseId?: string,
  expectedText?: string
): number | null {
  const attempts = getAttemptsForPhrase(videoId, phraseId, expectedText);
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map((attempt) => attempt.score));
}
