import type { AuthenticatedContext, UserProgressRecord } from '../types';
import { progressSk, userPk } from '../dynamodb/keys';
import { getItem, type DynamoItem } from '../dynamodb/repository';
import { listFlashcards } from './flashcard-service';

interface ProgressItem extends DynamoItem {
  entityType: 'PROGRESS';
  cardsTotal: number;
  cardsMastered: number;
  cardsDueToday: number;
  streakDays: number;
  lastStudiedAt?: number;
}

function defaultProgress(userId: string): UserProgressRecord {
  return {
    userId,
    cardsTotal: 0,
    cardsMastered: 0,
    cardsDueToday: 0,
    streakDays: 0,
    updatedAt: Date.now(),
  };
}

function toRecord(item: ProgressItem): UserProgressRecord {
  return {
    userId: item.userId,
    cardsTotal: item.cardsTotal,
    cardsMastered: item.cardsMastered,
    cardsDueToday: item.cardsDueToday,
    streakDays: item.streakDays,
    lastStudiedAt: item.lastStudiedAt,
    updatedAt: item.updatedAt ?? item.createdAt,
  };
}

export async function getProgress(
  auth: AuthenticatedContext
): Promise<UserProgressRecord> {
  const stored = await getItem<ProgressItem>(
    userPk(auth.userId),
    progressSk()
  );

  if (stored) {
    return toRecord(stored);
  }

  const cards = await listFlashcards(auth);
  const now = Date.now();

  return {
    userId: auth.userId,
    cardsTotal: cards.length,
    cardsMastered: cards.filter((card) => (card.repetitions ?? 0) >= 7).length,
    cardsDueToday: cards.filter(
      (card) => !card.nextReview || card.nextReview <= now
    ).length,
    streakDays: 0,
    updatedAt: Date.now(),
  };
}
