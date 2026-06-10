import { startOfDay } from './flashcardSrs';

const STORAGE_KEY = 'yoytube-daily-study';

export interface DailyStudyEntry {
  date: string;
  cardsReviewed: number;
}

function todayKey(date = new Date()): string {
  const normalized = new Date(startOfDay(date));
  return normalized.toISOString().slice(0, 10);
}

function readLog(): DailyStudyEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function recordDailyCardReview(count = 1): void {
  if (typeof window === 'undefined' || count <= 0) return;

  const key = todayKey();
  const log = readLog();
  const index = log.findIndex((entry) => entry.date === key);

  if (index >= 0) {
    log[index] = {
      ...log[index],
      cardsReviewed: log[index].cardsReviewed + count,
    };
  } else {
    log.push({ date: key, cardsReviewed: count });
  }

  writeLog(log);
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
