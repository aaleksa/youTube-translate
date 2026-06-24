import { ConflictError, NotFoundError } from '../errors';
import type {
  AuthenticatedContext,
  CreateFlashcardInput,
  FlashcardListParams,
  FlashcardRecord,
  PaginatedFlashcards,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localFlashcards from '../storage/local-flashcard-store';
import { validateCreateFlashcardInput, normalizeFlashcardWord } from '../validation/flashcard-input';
import {
  parsePaginationParams,
  toPaginatedResponse,
} from '../validation/pagination';
import { cardSk, userPk } from '../dynamodb/keys';
import {
  deleteItem,
  getItem,
  putItem,
  queryByUser,
  updateItem,
  type DynamoItem,
} from '../dynamodb/repository';
import { randomUUID } from 'node:crypto';

interface FlashcardItem extends DynamoItem {
  entityType: 'CARD';
  id: string;
  word: string;
  translation: string;
  example?: string;
  tags?: string[];
  videoId?: string;
  deckIds?: string[];
  repetitions?: number;
  ease?: number;
  interval?: number;
  nextReview?: number;
  knownCount?: number;
  unknownCount?: number;
}

function toRecord(item: FlashcardItem): FlashcardRecord {
  return {
    id: item.id,
    userId: item.userId,
    word: item.word,
    translation: item.translation,
    example: item.example,
    tags: item.tags,
    videoId: item.videoId,
    deckIds: item.deckIds,
    repetitions: item.repetitions,
    ease: item.ease,
    interval: item.interval,
    nextReview: item.nextReview,
    knownCount: item.knownCount,
    unknownCount: item.unknownCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function listAllFlashcards(
  auth: AuthenticatedContext
): Promise<FlashcardRecord[]> {
  if (isLocalBackend()) {
    return localFlashcards.listFlashcards(auth.userId);
  }

  const items = await queryByUser<FlashcardItem>(auth.userId, 'CARD#');
  return items.map(toRecord);
}

export async function listFlashcards(
  auth: AuthenticatedContext,
  params: FlashcardListParams = {}
): Promise<PaginatedFlashcards> {
  const pagination = parsePaginationParams(
    new URLSearchParams({
      ...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
      ...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
    })
  );

  if (isLocalBackend()) {
    const page = localFlashcards.listFlashcardsPaginated(
      auth.userId,
      pagination
    );
    return toPaginatedResponse(page.items, page.total, pagination);
  }

  const items = await queryByUser<FlashcardItem>(auth.userId, 'CARD#');
  const records = items
    .map(toRecord)
    .sort((left, right) => left.createdAt - right.createdAt);
  const slice = records.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );

  return toPaginatedResponse(slice, records.length, pagination);
}

export async function createFlashcard(
  auth: AuthenticatedContext,
  input: CreateFlashcardInput
): Promise<FlashcardRecord> {
  const validated = validateCreateFlashcardInput(input);

  if (isLocalBackend()) {
    return localFlashcards.createFlashcard(auth.userId, validated);
  }

  const existing = await queryByUser<FlashcardItem>(auth.userId, 'CARD#');
  const normalized = normalizeFlashcardWord(validated.word);
  if (
    existing.some(
      (card) => normalizeFlashcardWord(card.word) === normalized
    )
  ) {
    throw new ConflictError('A flashcard with this word already exists');
  }

  const now = Date.now();
  const id = randomUUID();
  const item: FlashcardItem = {
    PK: userPk(auth.userId),
    SK: cardSk(id),
    entityType: 'CARD',
    userId: auth.userId,
    id,
    word: validated.word,
    translation: validated.translation,
    example: validated.example,
    tags: validated.tags ?? [],
    videoId: validated.videoId,
    deckIds: validated.deckIds ?? [],
    repetitions: validated.repetitions ?? 0,
    ease: validated.ease ?? 2.5,
    interval: validated.interval ?? 0,
    nextReview: validated.nextReview,
    knownCount: validated.knownCount ?? 0,
    unknownCount: validated.unknownCount ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}

export async function updateFlashcard(
  auth: AuthenticatedContext,
  cardId: string,
  input: Partial<Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt'>>
): Promise<FlashcardRecord> {
  if (isLocalBackend()) {
    return localFlashcards.updateFlashcard(auth.userId, cardId, input);
  }

  const pk = userPk(auth.userId);
  const sk = cardSk(cardId);
  const existing = await getItem<FlashcardItem>(pk, sk);

  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Flashcard not found');
  }

  const updatedAt = Date.now();
  await updateItem(pk, sk, { ...input, updatedAt });

  const updated = await getItem<FlashcardItem>(pk, sk);
  if (!updated) {
    throw new NotFoundError('Flashcard not found');
  }

  return toRecord(updated);
}

export async function deleteFlashcard(
  auth: AuthenticatedContext,
  cardId: string
): Promise<{ success: true }> {
  if (isLocalBackend()) {
    return localFlashcards.deleteFlashcard(auth.userId, cardId);
  }

  const pk = userPk(auth.userId);
  const sk = cardSk(cardId);
  const existing = await getItem<FlashcardItem>(pk, sk);

  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Flashcard not found');
  }

  await deleteItem(pk, sk);
  return { success: true };
}
