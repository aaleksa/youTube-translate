import type { QuizResultRecord } from '../types';
import { getLocalDatabase } from './local-db';

interface QuizResultRow {
  id: string;
  userId: string;
  videoId: string;
  score: number;
  totalQuestions: number;
  createdAt: number;
}

function toRecord(row: QuizResultRow): QuizResultRecord {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    score: row.score,
    totalQuestions: row.totalQuestions,
    createdAt: row.createdAt,
  };
}

export function listQuizResults(
  userId: string,
  videoId?: string
): QuizResultRecord[] {
  const db = getLocalDatabase();
  const rows = videoId
    ? (db
        .prepare(
          `SELECT * FROM quiz_results
           WHERE userId = ? AND videoId = ?
           ORDER BY createdAt DESC`
        )
        .all(userId, videoId) as QuizResultRow[])
    : (db
        .prepare(
          `SELECT * FROM quiz_results
           WHERE userId = ?
           ORDER BY createdAt DESC`
        )
        .all(userId) as QuizResultRow[]);

  return rows.map(toRecord);
}
