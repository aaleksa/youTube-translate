import { randomUUID } from 'crypto';
import type {
  CreatePronunciationAttemptInput,
  PronunciationAttemptRecord,
} from '../types';
import { validateCreatePronunciationAttemptInput } from '../validation/pronunciation-attempt-input';
import { getLocalDatabase } from './local-db';

interface PronunciationAttemptRow {
  id: string;
  userId: string;
  videoId: string;
  sentenceId: string | null;
  phraseId: string | null;
  expectedText: string;
  recognizedText: string;
  score: number;
  missedWords: string;
  extraWords: string;
  durationMs: number;
  createdAt: number;
}

function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function toRecord(row: PronunciationAttemptRow): PronunciationAttemptRecord {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    sentenceId: row.sentenceId ?? undefined,
    phraseId: row.phraseId ?? undefined,
    expectedText: row.expectedText,
    recognizedText: row.recognizedText,
    score: row.score,
    missedWords: parseStringArray(row.missedWords),
    extraWords: parseStringArray(row.extraWords),
    durationMs: row.durationMs,
    createdAt: row.createdAt,
  };
}

export function listPronunciationAttempts(
  userId: string
): PronunciationAttemptRecord[] {
  const db = getLocalDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM pronunciation_attempts
       WHERE userId = ?
       ORDER BY createdAt DESC`
    )
    .all(userId) as PronunciationAttemptRow[];

  return rows.map(toRecord);
}

export function createPronunciationAttempt(
  userId: string,
  input: CreatePronunciationAttemptInput
): PronunciationAttemptRecord {
  const validated = validateCreatePronunciationAttemptInput(input);
  const id = validated.id ?? randomUUID();
  const createdAt = validated.createdAt ?? Date.now();
  const db = getLocalDatabase();

  const existing = db
    .prepare(`SELECT * FROM pronunciation_attempts WHERE id = ? AND userId = ?`)
    .get(id, userId) as PronunciationAttemptRow | undefined;
  if (existing) {
    return toRecord(existing);
  }

  db.prepare(
    `INSERT INTO pronunciation_attempts (
      id, userId, videoId, sentenceId, phraseId, expectedText, recognizedText,
      score, missedWords, extraWords, durationMs, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    validated.videoId,
    validated.sentenceId ?? null,
    validated.phraseId ?? null,
    validated.expectedText,
    validated.recognizedText,
    validated.score,
    JSON.stringify(validated.missedWords ?? []),
    JSON.stringify(validated.extraWords ?? []),
    validated.durationMs,
    createdAt
  );

  const row = db
    .prepare(`SELECT * FROM pronunciation_attempts WHERE id = ? AND userId = ?`)
    .get(id, userId) as PronunciationAttemptRow;

  return toRecord(row);
}
