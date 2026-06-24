import { randomUUID } from 'node:crypto';
import { ApiError } from '../errors';
import type {
  UpsertVocabularyProgressInput,
  VocabularyProgressRecord,
} from '../types';
import { validateUpsertVocabularyProgressInput } from '../validation/vocabulary-progress-input';
import { getLocalDatabase } from './local-db';

interface VocabularyProgressRow {
  id: string;
  userId: string;
  word: string;
  reviewCount: number;
  mastered: number;
  lastReviewDate: number | null;
}

function toRecord(row: VocabularyProgressRow): VocabularyProgressRecord {
  return {
    id: row.id,
    userId: row.userId,
    word: row.word,
    reviewCount: row.reviewCount,
    mastered: row.mastered === 1,
    lastReviewDate: row.lastReviewDate,
  };
}

function getRowByWord(userId: string, word: string): VocabularyProgressRow | null {
  const db = getLocalDatabase();
  return (
    (db
      .prepare(`SELECT * FROM vocabulary_progress WHERE userId = ? AND word = ?`)
      .get(userId, word) as VocabularyProgressRow | undefined) ?? null
  );
}

function getRowById(userId: string, id: string): VocabularyProgressRow | null {
  const db = getLocalDatabase();
  return (
    (db
      .prepare(`SELECT * FROM vocabulary_progress WHERE id = ? AND userId = ?`)
      .get(id, userId) as VocabularyProgressRow | undefined) ?? null
  );
}

export function upsertVocabularyProgress(
  userId: string,
  input: UpsertVocabularyProgressInput
): VocabularyProgressRecord {
  const validated = validateUpsertVocabularyProgressInput(input);
  const existing = getRowByWord(userId, validated.word);
  const id = existing?.id ?? randomUUID();
  const lastReviewDate =
    validated.lastReviewDate !== undefined
      ? validated.lastReviewDate
      : (existing?.lastReviewDate ?? null);

  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO vocabulary_progress (
      id, userId, word, reviewCount, mastered, lastReviewDate
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId, word) DO UPDATE SET
      reviewCount = excluded.reviewCount,
      mastered = excluded.mastered,
      lastReviewDate = excluded.lastReviewDate`
  ).run(
    id,
    userId,
    validated.word,
    validated.reviewCount,
    validated.mastered ? 1 : 0,
    lastReviewDate
  );

  const row = getRowById(userId, id) ?? getRowByWord(userId, validated.word);
  if (!row) {
    throw new ApiError(
      'Failed to save vocabulary progress',
      500,
      'VOCABULARY_PROGRESS_SAVE_FAILED'
    );
  }

  return toRecord(row);
}
