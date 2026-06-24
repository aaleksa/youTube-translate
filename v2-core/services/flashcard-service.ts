import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../errors';
import type { AuthenticatedContext, FlashcardRecord } from '../types';
import { cardSk, userPk } from '../dynamodb/keys';
import {
  deleteItem,
  getItem,
  putItem,
  queryByUser,
  updateItem,
  type DynamoItem,
} from '../dynamodb/repository';

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

export async function listFlashcards(
  auth: AuthenticatedContext
): Promise<FlashcardRecord[]> {
  const items = await queryByUser<FlashcardItem>(auth.userId, 'CARD#');
  return items.map(toRecord);
}

export async function createFlashcard(
  auth: AuthenticatedContext,
  input: Omit<FlashcardRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<FlashcardRecord> {
  const now = Date.now();
  const id = randomUUID();
  const item: FlashcardItem = {
    PK: userPk(auth.userId),
    SK: cardSk(id),
    entityType: 'CARD',
    userId: auth.userId,
    id,
    word: input.word,
    translation: input.translation,
    example: input.example,
    tags: input.tags ?? [],
    videoId: input.videoId,
    deckIds: input.deckIds ?? [],
    repetitions: input.repetitions ?? 0,
    ease: input.ease ?? 2.5,
    interval: input.interval ?? 0,
    nextReview: input.nextReview,
    knownCount: input.knownCount ?? 0,
    unknownCount: input.unknownCount ?? 0,
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
  const pk = userPk(auth.userId);
  const sk = cardSk(cardId);
  const existing = await getItem<FlashcardItem>(pk, sk);

  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Flashcard not found');
  }

  await deleteItem(pk, sk);
  return { success: true };
}
