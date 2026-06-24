import type { CreateQuizResultInput } from '../../../v2-core/types';
import {
  addQuizSessionResult,
  mergeQuizSessionResults,
} from '../quizSessionResults';
import { isBackendV2Enabled } from './config';
import * as quizResultsApi from './quizResultsApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

let bootstrapPromise: Promise<void> | null = null;

export function resetQuizResultsSyncBootstrap(): void {
  bootstrapPromise = null;
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

export async function syncQuizSessionResult(
  input: CreateQuizResultInput
): Promise<void> {
  if (!canSync()) return;

  await withPendingSync(async () => {
    try {
      const created = await quizResultsApi.createQuizResult(input);
      addQuizSessionResult(created);
    } catch (error) {
      console.warn('[quiz-results] Failed to save session on server:', error);
    }
  });
}

export async function bootstrapQuizResultsSync(_userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const serverResults = await quizResultsApi.listQuizResults();
      mergeQuizSessionResults(serverResults);
    } catch (error) {
      console.warn('[quiz-results] Failed to load from server:', error);
    }
  })();

  return bootstrapPromise;
}
