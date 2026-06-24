import type { PronunciationAttemptRecord } from '../../../v2-core/types';
import type { ShadowingAttempt } from '../pronunciationTypes';
import {
  getPronunciationAttempts,
  restorePronunciationAttempts,
} from '../pronunciationAttempts';
import { isBackendV2Enabled } from './config';
import * as pronunciationAttemptsApi from './pronunciationAttemptsApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

let bootstrapPromise: Promise<void> | null = null;

export function resetPronunciationAttemptsSyncBootstrap(): void {
  bootstrapPromise = null;
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

function toLocalAttempt(record: PronunciationAttemptRecord): ShadowingAttempt {
  return {
    id: record.id,
    videoId: record.videoId,
    sentenceId: record.sentenceId,
    phraseId: record.phraseId,
    expectedText: record.expectedText,
    recognizedText: record.recognizedText,
    score: record.score,
    missedWords: record.missedWords,
    extraWords: record.extraWords,
    durationMs: record.durationMs,
    createdAt: record.createdAt,
  };
}

function mergePronunciationAttempts(
  serverRecords: PronunciationAttemptRecord[],
  localAttempts: ShadowingAttempt[]
): ShadowingAttempt[] {
  const byId = new Map(localAttempts.map((attempt) => [attempt.id, attempt]));

  for (const record of serverRecords) {
    byId.set(record.id, toLocalAttempt(record));
  }

  return [...byId.values()].sort(
    (left, right) => right.createdAt - left.createdAt
  );
}

export async function syncPronunciationAttempt(
  attempt: ShadowingAttempt
): Promise<void> {
  if (!canSync()) return;

  await withPendingSync(async () => {
    try {
      const created = await pronunciationAttemptsApi.createPronunciationAttempt({
        id: attempt.id,
        videoId: attempt.videoId,
        sentenceId: attempt.sentenceId,
        phraseId: attempt.phraseId,
        expectedText: attempt.expectedText,
        recognizedText: attempt.recognizedText,
        score: attempt.score,
        missedWords: attempt.missedWords,
        extraWords: attempt.extraWords,
        durationMs: attempt.durationMs,
        createdAt: attempt.createdAt,
      });

      if (created.id !== attempt.id) {
        const attempts = getPronunciationAttempts();
        const index = attempts.findIndex((item) => item.id === attempt.id);
        if (index >= 0) {
          attempts[index] = toLocalAttempt(created);
          restorePronunciationAttempts(attempts);
        }
      }
    } catch (error) {
      console.warn('[pronunciation-attempts] Failed to push to server:', error);
    }
  });
}

export async function bootstrapPronunciationAttemptsSync(
  _userId: string
): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const serverRecords = await pronunciationAttemptsApi.listPronunciationAttempts();
      const merged = mergePronunciationAttempts(
        serverRecords,
        getPronunciationAttempts()
      );
      restorePronunciationAttempts(merged);
    } catch (error) {
      console.warn('[pronunciation-attempts] Failed to load from server:', error);
    }
  })();

  return bootstrapPromise;
}
