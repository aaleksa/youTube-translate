import type { DailyStudyLogRecord, UpsertDailyStudyLogInput } from '../types';
import {
  mergeDailyStudyCounts,
  validateUpsertDailyStudyLogInput,
} from '../validation/daily-study-log-input';
import { getLocalDatabase } from './local-db';

interface DailyStudyRow {
  userId: string;
  date: string;
  cardsReviewed: number;
  correctReviews: number;
  incorrectReviews: number;
  updatedAt: number;
}

function toRecord(row: DailyStudyRow): DailyStudyLogRecord {
  return {
    userId: row.userId,
    date: row.date,
    cardsReviewed: row.cardsReviewed,
    correctReviews: row.correctReviews,
    incorrectReviews: row.incorrectReviews,
    updatedAt: row.updatedAt,
  };
}

export function listDailyStudyLog(userId: string): DailyStudyLogRecord[] {
  const db = getLocalDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM daily_study_log
       WHERE userId = ?
       ORDER BY date DESC`
    )
    .all(userId) as DailyStudyRow[];

  return rows.map(toRecord);
}

export function upsertDailyStudyLog(
  userId: string,
  input: UpsertDailyStudyLogInput
): DailyStudyLogRecord {
  const validated = validateUpsertDailyStudyLogInput(input);
  const db = getLocalDatabase();
  const existing = db
    .prepare(`SELECT * FROM daily_study_log WHERE userId = ? AND date = ?`)
    .get(userId, validated.date) as DailyStudyRow | undefined;

  const now = Date.now();
  const mergedCounts = existing
    ? mergeDailyStudyCounts(existing, validated)
    : {
        cardsReviewed: validated.cardsReviewed,
        correctReviews: validated.correctReviews ?? 0,
        incorrectReviews: validated.incorrectReviews ?? 0,
      };

  db.prepare(
    `INSERT INTO daily_study_log (
      userId, date, cardsReviewed, correctReviews, incorrectReviews, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId, date) DO UPDATE SET
      cardsReviewed = excluded.cardsReviewed,
      correctReviews = excluded.correctReviews,
      incorrectReviews = excluded.incorrectReviews,
      updatedAt = excluded.updatedAt`
  ).run(
    userId,
    validated.date,
    mergedCounts.cardsReviewed,
    mergedCounts.correctReviews ?? 0,
    mergedCounts.incorrectReviews ?? 0,
    now
  );

  const row = db
    .prepare(`SELECT * FROM daily_study_log WHERE userId = ? AND date = ?`)
    .get(userId, validated.date) as DailyStudyRow;

  return toRecord(row);
}
