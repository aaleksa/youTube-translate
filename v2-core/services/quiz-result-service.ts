import type {
  AuthenticatedContext,
  QuizResultRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localQuizResults from '../storage/local-quiz-result-store';
import { normalizeQuizResultVideoIdFilter } from '../validation/quiz-result-input';
import { queryByUser, type DynamoItem } from '../dynamodb/repository';

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
