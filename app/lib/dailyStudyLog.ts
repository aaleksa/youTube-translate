import { startOfDay } from './flashcardSrs';
import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-daily-study';

function dailyStudyStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export interface DailyStudyEntry {
  date: string;
  cardsReviewed: number;
  correctReviews?: number;
  incorrectReviews?: number;
}

function todayKey(date = new Date()): string {
  const normalized = new Date(startOfDay(date));
  return normalized.toISOString().slice(0, 10);
}

function readLog(): DailyStudyEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(dailyStudyStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DailyStudyEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLog(entries: DailyStudyEntry[]): void {
  const trimmed = entries
    .filter((entry) => entry.date && entry.cardsReviewed > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 400);
  localStorage.setItem(dailyStudyStorageKey(), JSON.stringify(trimmed));
}

export function recordDailyCardReview(count = 1, known = true): void {
  if (typeof window === 'undefined' || count <= 0) return;

  const key = todayKey();
  const log = readLog();
  const index = log.findIndex((entry) => entry.date === key);

  if (index >= 0) {
    const entry = log[index];
    log[index] = {
      ...entry,
      cardsReviewed: entry.cardsReviewed + count,
      correctReviews: (entry.correctReviews ?? 0) + (known ? count : 0),
      incorrectReviews: (entry.incorrectReviews ?? 0) + (known ? 0 : count),
    };
  } else {
    log.push({
      date: key,
      cardsReviewed: count,
      correctReviews: known ? count : 0,
      incorrectReviews: known ? 0 : count,
    });
  }

  writeLog(log);
}

export function getTodayStudyEntry(): DailyStudyEntry {
  const key = todayKey();
  return (
    readLog().find((entry) => entry.date === key) ?? {
      date: key,
      cardsReviewed: 0,
      correctReviews: 0,
      incorrectReviews: 0,
    }
  );
}

export function getTodayCardsReviewed(): number {
  const key = todayKey();
  return readLog().find((entry) => entry.date === key)?.cardsReviewed ?? 0;
}

export function getStudyStreak(): number {
  const log = readLog();
  if (log.length === 0) return 0;

  const reviewedDates = new Set(log.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date(startOfDay());

  while (reviewedDates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getDailyStudyLog(): DailyStudyEntry[] {
  return readLog();
}

export function restoreDailyStudyLog(entries: DailyStudyEntry[]): void {
  writeLog(entries);
}
