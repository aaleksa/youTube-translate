import { randomUUID } from 'crypto';
import type {
  AuthenticatedContext,
  CreateQuizResultInput,
  QuizResultRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localQuizResults from '../storage/local-quiz-result-store';
import {
  normalizeQuizResultVideoIdFilter,
  validateCreateQuizResultInput,
} from '../validation/quiz-result-input';
import { quizResultSk, userPk } from '../dynamodb/keys';
import { putItem, queryByUser, type DynamoItem } from '../dynamodb/repository';

interface QuizResultItem extends DynamoItem {
  entityType: 'QUIZ_RESULT';
  id: string;
  videoId: string;
  score: number;
  totalQuestions: number;
}

function toRecord(item: QuizResultItem): QuizResultRecord {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    score: item.score,
    totalQuestions: item.totalQuestions,
    createdAt: item.createdAt,
  };
}

export async function listQuizResults(
  auth: AuthenticatedContext,
  videoId?: string
): Promise<QuizResultRecord[]> {
  const filter = normalizeQuizResultVideoIdFilter(videoId ?? null);

  if (isLocalBackend()) {
    return localQuizResults.listQuizResults(auth.userId, filter);
  }

  const items = await queryByUser<QuizResultItem>(auth.userId, 'QUIZ_RESULT#');
  const records = items.map(toRecord);

  if (!filter) {
    return records.sort((left, right) => right.createdAt - left.createdAt);
  }

  return records
    .filter((result) => result.videoId === filter)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function createQuizResult(
  auth: AuthenticatedContext,
  input: CreateQuizResultInput
): Promise<QuizResultRecord> {
  const validated = validateCreateQuizResultInput(input);

  if (isLocalBackend()) {
    return localQuizResults.createQuizResult(auth.userId, validated);
  }

  const now = Date.now();
  const id = randomUUID();
  const item: QuizResultItem = {
    PK: userPk(auth.userId),
    SK: quizResultSk(id),
    entityType: 'QUIZ_RESULT',
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    score: validated.score,
    totalQuestions: validated.totalQuestions,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}
