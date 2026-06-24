import { randomUUID } from 'crypto';
import type {
  AuthenticatedContext,
  CreatePronunciationAttemptInput,
  PronunciationAttemptRecord,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localPronunciationAttempts from '../storage/local-pronunciation-attempt-store';
import { validateCreatePronunciationAttemptInput } from '../validation/pronunciation-attempt-input';
import { pronunciationAttemptSk, userPk } from '../dynamodb/keys';
import { putItem, queryByUser, type DynamoItem } from '../dynamodb/repository';

interface PronunciationAttemptItem extends DynamoItem {
  entityType: 'PRONUNCIATION';
  id: string;
  videoId: string;
  sentenceId?: string;
  phraseId?: string;
  expectedText: string;
  recognizedText: string;
  score: number;
  missedWords: string[];
  extraWords: string[];
  durationMs: number;
}

function toRecord(item: PronunciationAttemptItem): PronunciationAttemptRecord {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    sentenceId: item.sentenceId,
    phraseId: item.phraseId,
    expectedText: item.expectedText,
    recognizedText: item.recognizedText,
    score: item.score,
    missedWords: item.missedWords,
    extraWords: item.extraWords,
    durationMs: item.durationMs,
    createdAt: item.createdAt,
  };
}

export async function listPronunciationAttempts(
  auth: AuthenticatedContext
): Promise<PronunciationAttemptRecord[]> {
  if (isLocalBackend()) {
    return localPronunciationAttempts.listPronunciationAttempts(auth.userId);
  }

  const items = await queryByUser<PronunciationAttemptItem>(
    auth.userId,
    'PRONUNCIATION#'
  );
  return items
    .map(toRecord)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function createPronunciationAttempt(
  auth: AuthenticatedContext,
  input: CreatePronunciationAttemptInput
): Promise<PronunciationAttemptRecord> {
  const validated = validateCreatePronunciationAttemptInput(input);

  if (isLocalBackend()) {
    return localPronunciationAttempts.createPronunciationAttempt(
      auth.userId,
      validated
    );
  }

  const now = Date.now();
  const id = validated.id ?? randomUUID();
  const item: PronunciationAttemptItem = {
    PK: userPk(auth.userId),
    SK: pronunciationAttemptSk(id),
    entityType: 'PRONUNCIATION',
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    sentenceId: validated.sentenceId,
    phraseId: validated.phraseId,
    expectedText: validated.expectedText,
    recognizedText: validated.recognizedText,
    score: validated.score,
    missedWords: validated.missedWords ?? [],
    extraWords: validated.extraWords ?? [],
    durationMs: validated.durationMs,
    createdAt: validated.createdAt ?? now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}
