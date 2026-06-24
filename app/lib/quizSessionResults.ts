import type { QuizResultRecord } from '../../v2-core/types';
import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-quiz-session-results';
const MAX_RESULTS = 100;

function storageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export function getQuizSessionResults(): QuizResultRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? (JSON.parse(raw) as QuizResultRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addQuizSessionResult(record: QuizResultRecord): void {
  if (typeof window === 'undefined') return;

  const existing = getQuizSessionResults();
  const next = [record, ...existing.filter((item) => item.id !== record.id)].slice(
    0,
    MAX_RESULTS
  );
  localStorage.setItem(storageKey(), JSON.stringify(next));
}

export function mergeQuizSessionResults(serverResults: QuizResultRecord[]): void {
  if (typeof window === 'undefined' || serverResults.length === 0) return;

  const byId = new Map(getQuizSessionResults().map((item) => [item.id, item]));
  for (const record of serverResults) {
    byId.set(record.id, record);
  }

  const merged = [...byId.values()].sort(
    (left, right) => right.createdAt - left.createdAt
  );
  localStorage.setItem(storageKey(), JSON.stringify(merged.slice(0, MAX_RESULTS)));
}
