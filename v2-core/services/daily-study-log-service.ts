import type {
  AuthenticatedContext,
  DailyStudyLogRecord,
  UpsertDailyStudyLogInput,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localDailyStudyLog from '../storage/local-daily-study-log-store';
import {
  mergeDailyStudyCounts,
  validateUpsertDailyStudyLogInput,
} from '../validation/daily-study-log-input';
import { dailyStudySk, userPk } from '../dynamodb/keys';
import { getItem, putItem, queryByUser, type DynamoItem } from '../dynamodb/repository';

interface DailyStudyItem extends DynamoItem {
  entityType: 'DAILY_STUDY';
  date: string;
  cardsReviewed: number;
  correctReviews: number;
  incorrectReviews: number;
}

function toRecord(item: DailyStudyItem): DailyStudyLogRecord {
  return {
    userId: item.userId,
    date: item.date,
    cardsReviewed: item.cardsReviewed,
    correctReviews: item.correctReviews,
    incorrectReviews: item.incorrectReviews,
    updatedAt: item.updatedAt ?? item.createdAt,
  };
}

export async function listDailyStudyLog(
  auth: AuthenticatedContext
): Promise<DailyStudyLogRecord[]> {
  if (isLocalBackend()) {
    return localDailyStudyLog.listDailyStudyLog(auth.userId);
  }

  const items = await queryByUser<DailyStudyItem>(auth.userId, 'DAILY_STUDY#');
  return items
    .map(toRecord)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function upsertDailyStudyLog(
  auth: AuthenticatedContext,
  input: UpsertDailyStudyLogInput
): Promise<DailyStudyLogRecord> {
  const validated = validateUpsertDailyStudyLogInput(input);

  if (isLocalBackend()) {
    return localDailyStudyLog.upsertDailyStudyLog(auth.userId, validated);
  }

  const pk = userPk(auth.userId);
  const sk = dailyStudySk(validated.date);
  const existing = await getItem<DailyStudyItem>(pk, sk);
  const now = Date.now();
  const mergedCounts = existing
    ? mergeDailyStudyCounts(existing, validated)
    : {
        cardsReviewed: validated.cardsReviewed,
        correctReviews: validated.correctReviews ?? 0,
        incorrectReviews: validated.incorrectReviews ?? 0,
      };

  const item: DailyStudyItem = {
    PK: pk,
    SK: sk,
    entityType: 'DAILY_STUDY',
    userId: auth.userId,
    date: validated.date,
    cardsReviewed: mergedCounts.cardsReviewed,
    correctReviews: mergedCounts.correctReviews ?? 0,
    incorrectReviews: mergedCounts.incorrectReviews ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}
