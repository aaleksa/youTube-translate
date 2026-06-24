import type {
  AuthenticatedContext,
  UpsertVocabularyProgressInput,
  VocabularyProgressRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localVocabularyProgress from '../storage/local-vocabulary-progress-store';
import {
  normalizeVocabularyProgressWord,
  validateUpsertVocabularyProgressInput,
} from '../validation/vocabulary-progress-input';
import { userPk, vocabularyProgressSk } from '../dynamodb/keys';
import { putItem, queryByUser, type DynamoItem } from '../dynamodb/repository';
import { randomUUID } from 'node:crypto';

interface VocabularyProgressItem extends DynamoItem {
  entityType: 'VOCAB_PROGRESS';
  id: string;
  word: string;
  reviewCount: number;
  mastered: boolean;
  lastReviewDate: number | null;
}

function toRecord(item: VocabularyProgressItem): VocabularyProgressRecord {
  return {
    id: item.id,
    userId: item.userId,
    word: item.word,
    reviewCount: item.reviewCount,
    mastered: item.mastered,
    lastReviewDate: item.lastReviewDate,
  };
}

export async function upsertVocabularyProgress(
  auth: AuthenticatedContext,
  input: UpsertVocabularyProgressInput
): Promise<VocabularyProgressRecord> {
  const validated = validateUpsertVocabularyProgressInput(input);

  if (isLocalBackend()) {
    return localVocabularyProgress.upsertVocabularyProgress(auth.userId, validated);
  }

  const items = await queryByUser<VocabularyProgressItem>(
    auth.userId,
    'VOCAB_PROGRESS#'
  );
  const existing = items.find(
    (item) =>
      normalizeVocabularyProgressWord(item.word) === validated.word
  );

  const id = existing?.id ?? randomUUID();
  const lastReviewDate =
    validated.lastReviewDate !== undefined
      ? validated.lastReviewDate
      : (existing?.lastReviewDate ?? null);

  const item: VocabularyProgressItem = {
    PK: userPk(auth.userId),
    SK: vocabularyProgressSk(id),
    entityType: 'VOCAB_PROGRESS',
    userId: auth.userId,
    id,
    word: validated.word,
    reviewCount: validated.reviewCount,
    mastered: validated.mastered,
    lastReviewDate,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  await putItem(item);
  return toRecord(item);
}
