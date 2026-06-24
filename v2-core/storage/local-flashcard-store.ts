import { randomUUID } from 'node:crypto';
import { ApiError, NotFoundError } from '../errors';
import type { Flashcard, FlashcardRecord } from '../types';
import { getLocalDatabase } from './local-db';

interface FlashcardMeta {
  tags?: string[];
  deckIds?: string[];
  repetitions?: number;
  ease?: number;
  interval?: number;
  nextReview?: number;
  knownCount?: number;
  unknownCount?: number;
  updatedAt?: number;
}

interface FlashcardRow {
  id: string;
  userId: string;
  word: string;
  translation: string;
  example: string;
  videoId: string | null;
  createdAt: number;
  meta: string;
}

function parseMeta(raw: string): FlashcardMeta {
  try {
    return JSON.parse(raw) as FlashcardMeta;
  } catch {
    return {};
  }
}

function toFlashcard(row: FlashcardRow): Flashcard {
  return {
    id: row.id,
    userId: row.userId,
    word: row.word,
    translation: row.translation,
    example: row.example,
    videoId: row.videoId,
    createdAt: row.createdAt,
  };
}

function toRecord(row: FlashcardRow): FlashcardRecord {
  const meta = parseMeta(row.meta);
  return {
    ...toFlashcard(row),
    example: row.example || undefined,
    videoId: row.videoId ?? undefined,
    tags: meta.tags,
    deckIds: meta.deckIds,
    repetitions: meta.repetitions,
    ease: meta.ease,
    interval: meta.interval,
    nextReview: meta.nextReview,
    knownCount: meta.knownCount,
    unknownCount: meta.unknownCount,
    updatedAt: meta.updatedAt,
  };
}

function getRow(userId: string, cardId: string): FlashcardRow | null {
  const db = getLocalDatabase();
  return (
    (db
      .prepare(`SELECT * FROM flashcards WHERE id = ? AND userId = ?`)
      .get(cardId, userId) as FlashcardRow | undefined) ?? null
  );
}

export function listFlashcards(userId: string): FlashcardRecord[] {
  const db = getLocalDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM flashcards WHERE userId = ? ORDER BY createdAt ASC`
    )
    .all(userId) as FlashcardRow[];

  return rows.map(toRecord);
}

export function createFlashcard(
  userId: string,
  input: Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): FlashcardRecord {
  const word = input.word?.trim();
  const translation = input.translation?.trim();

  if (!word || !translation) {
    throw new ApiError('word and translation are required', 400, 'INVALID_FLASHCARD');
  }

  const now = Date.now();
  const id = randomUUID();
  const meta: FlashcardMeta = {
    tags: input.tags ?? [],
    deckIds: input.deckIds ?? [],
    repetitions: input.repetitions ?? 0,
    ease: input.ease ?? 2.5,
    interval: input.interval ?? 0,
    nextReview: input.nextReview,
    knownCount: input.knownCount ?? 0,
    unknownCount: input.unknownCount ?? 0,
    updatedAt: now,
  };

  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO flashcards (
      id, userId, word, translation, example, videoId, createdAt, meta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    word,
    translation,
    input.example?.trim() ?? '',
    input.videoId?.trim() || null,
    now,
    JSON.stringify(meta)
  );

  const row = getRow(userId, id);
  if (!row) {
    throw new ApiError('Failed to create flashcard', 500, 'FLASHCARD_CREATE_FAILED');
  }

  return toRecord(row);
}

export function updateFlashcard(
  userId: string,
  cardId: string,
  input: Partial<Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>>
): FlashcardRecord {
  const existing = getRow(userId, cardId);
  if (!existing) {
    throw new NotFoundError('Flashcard not found');
  }

  const meta = parseMeta(existing.meta);
  const updatedAt = Date.now();
  const nextMeta: FlashcardMeta = {
    ...meta,
    tags: input.tags ?? meta.tags,
    deckIds: input.deckIds ?? meta.deckIds,
    repetitions: input.repetitions ?? meta.repetitions,
    ease: input.ease ?? meta.ease,
    interval: input.interval ?? meta.interval,
    nextReview: input.nextReview ?? meta.nextReview,
    knownCount: input.knownCount ?? meta.knownCount,
    unknownCount: input.unknownCount ?? meta.unknownCount,
    updatedAt,
  };

  const db = getLocalDatabase();
  db.prepare(
    `UPDATE flashcards
     SET word = ?, translation = ?, example = ?, videoId = ?, meta = ?
     WHERE id = ? AND userId = ?`
  ).run(
    input.word?.trim() ?? existing.word,
    input.translation?.trim() ?? existing.translation,
    input.example !== undefined ? input.example.trim() : existing.example,
    input.videoId !== undefined
      ? input.videoId.trim() || null
      : existing.videoId,
    JSON.stringify(nextMeta),
    cardId,
    userId
  );

  const row = getRow(userId, cardId);
  if (!row) {
    throw new NotFoundError('Flashcard not found');
  }

  return toRecord(row);
}

export function deleteFlashcard(
  userId: string,
  cardId: string
): { success: true } {
  const existing = getRow(userId, cardId);
  if (!existing) {
    throw new NotFoundError('Flashcard not found');
  }

  const db = getLocalDatabase();
  db.prepare(`DELETE FROM flashcards WHERE id = ? AND userId = ?`).run(
    cardId,
    userId
  );

  return { success: true };
}
