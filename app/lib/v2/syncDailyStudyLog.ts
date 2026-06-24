import type { DailyStudyLogRecord } from '../../../v2-core/types';
import {
  getDailyStudyLog,
  getTodayStudyEntry,
  restoreDailyStudyLog,
  type DailyStudyEntry,
} from '../dailyStudyLog';
import { isBackendV2Enabled } from './config';
import * as dailyStudyLogApi from './dailyStudyLogApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

const SYNC_DEBOUNCE_MS = 2000;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let bootstrapPromise: Promise<void> | null = null;
let applyingRemote = false;

export function resetDailyStudySyncBootstrap(): void {
  bootstrapPromise = null;
}

export function cancelPendingDailyStudySync(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

function mergeDailyStudyEntry(
  local: DailyStudyEntry,
  server: DailyStudyLogRecord
): DailyStudyEntry {
  return {
    date: local.date,
    cardsReviewed: Math.max(local.cardsReviewed, server.cardsReviewed),
    correctReviews: Math.max(
      local.correctReviews ?? 0,
      server.correctReviews ?? 0
    ),
    incorrectReviews: Math.max(
      local.incorrectReviews ?? 0,
      server.incorrectReviews ?? 0
    ),
  };
}

function mergeDailyStudyLogs(
  serverRecords: DailyStudyLogRecord[],
  localEntries: DailyStudyEntry[]
): DailyStudyEntry[] {
  const byDate = new Map(localEntries.map((entry) => [entry.date, entry]));

  for (const serverEntry of serverRecords) {
    const localEntry = byDate.get(serverEntry.date);
    if (!localEntry) {
      byDate.set(serverEntry.date, {
        date: serverEntry.date,
        cardsReviewed: serverEntry.cardsReviewed,
        correctReviews: serverEntry.correctReviews,
        incorrectReviews: serverEntry.incorrectReviews,
      });
      continue;
    }

    byDate.set(serverEntry.date, mergeDailyStudyEntry(localEntry, serverEntry));
  }

  return [...byDate.values()]
    .filter((entry) => entry.cardsReviewed > 0)
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 400);
}

function applyServerDailyStudyLog(records: DailyStudyLogRecord[]): void {
  applyingRemote = true;
  try {
    const merged = mergeDailyStudyLogs(records, getDailyStudyLog());
    restoreDailyStudyLog(merged);
  } finally {
    applyingRemote = false;
  }
}

async function pushTodayStudyEntry(): Promise<void> {
  const today = getTodayStudyEntry();
  if (today.cardsReviewed <= 0) {
    return;
  }

  await withPendingSync(async () => {
    try {
      await dailyStudyLogApi.upsertDailyStudyLog({
        date: today.date,
        cardsReviewed: today.cardsReviewed,
        correctReviews: today.correctReviews,
        incorrectReviews: today.incorrectReviews,
      });
    } catch (error) {
      console.warn('[daily-study-log] Failed to push to server:', error);
    }
  });
}

export function scheduleDailyStudySync(): void {
  if (!canSync() || applyingRemote) {
    return;
  }

  if (pushTimer) {
    clearTimeout(pushTimer);
  }

  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushTodayStudyEntry();
  }, SYNC_DEBOUNCE_MS);
}

export async function bootstrapDailyStudySync(_userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const serverRecords = await dailyStudyLogApi.listDailyStudyLog();
      applyServerDailyStudyLog(serverRecords);
    } catch (error) {
      console.warn('[daily-study-log] Failed to load from server:', error);
    }
  })();

  return bootstrapPromise;
}
