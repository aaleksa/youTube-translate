import { randomUUID } from 'node:crypto';
import { ApiError, ConflictError, NotFoundError } from '../errors';
import type { CreateFlashcardInput, Flashcard, FlashcardRecord } from '../types';
import { normalizeFlashcardId } from '../validation/flashcard-id';
import {
  normalizeFlashcardWord,
  validateCreateFlashcardInput,
} from '../validation/flashcard-input';
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

export function listFlashcards(userId: string): FlashcardRecord[] {
  const db = getLocalDatabase();
  const rows = db
    .prepare(
      `SELECT * FROM flashcards WHERE userId = ? ORDER BY createdAt ASC`
    )
    .all(userId) as FlashcardRow[];

  return rows.map(toRecord);
}

export function listFlashcardsPaginated(
  userId: string,
  params: { limit: number; offset: number }
): { items: FlashcardRecord[]; total: number } {
  const db = getLocalDatabase();
  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM flashcards WHERE userId = ?`)
    .get(userId) as { count: number };

  const rows = db
    .prepare(
      `SELECT * FROM flashcards
       WHERE userId = ?
       ORDER BY createdAt ASC
       LIMIT ? OFFSET ?`
    )
    .all(userId, params.limit, params.offset) as FlashcardRow[];

  return {
    items: rows.map(toRecord),
    total: totalRow.count,
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

function hasFlashcardWithWord(userId: string, word: string): boolean {
  const db = getLocalDatabase();
  const normalized = normalizeFlashcardWord(word);
  const row = db
    .prepare(
      `SELECT id FROM flashcards
       WHERE userId = ? AND lower(trim(word)) = ?`
    )
    .get(userId, normalized) as { id: string } | undefined;

  return Boolean(row);
}

export function createFlashcard(
  userId: string,
  input: CreateFlashcardInput
): FlashcardRecord {
  const validated = validateCreateFlashcardInput(input);

  if (hasFlashcardWithWord(userId, validated.word)) {
    throw new ConflictError('A flashcard with this word already exists');
  }

  const now = Date.now();
  const id = randomUUID();
  const meta: FlashcardMeta = {
    tags: validated.tags ?? [],
    deckIds: validated.deckIds ?? [],
    repetitions: validated.repetitions ?? 0,
    ease: validated.ease ?? 2.5,
    interval: validated.interval ?? 0,
    nextReview: validated.nextReview,
    knownCount: validated.knownCount ?? 0,
    unknownCount: validated.unknownCount ?? 0,
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
    validated.word,
    validated.translation,
    validated.example ?? '',
    validated.videoId ?? null,
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
  const normalizedId = normalizeFlashcardId(cardId);
  const existing = getRow(userId, normalizedId);
  if (!existing) {
    throw new NotFoundError('Flashcard not found');
  }

  const db = getLocalDatabase();
  db.prepare(`DELETE FROM flashcards WHERE id = ? AND userId = ?`).run(
    normalizedId,
    userId
  );

  return { success: true };
}
