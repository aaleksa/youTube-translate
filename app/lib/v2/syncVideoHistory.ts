import type { VideoHistoryRecord } from '../../../v2-core/types';
import { notifyVideoHistoryChanged } from '../dataRefresh';
import {
  getTranscriptHistoryForUser,
  replaceTranscriptHistoryForUser,
  type TranscriptHistoryEntry,
} from '../transcriptHistory';
import { isBackendV2Enabled } from './config';
import { getAccessToken } from './tokenStorage';
import * as videoHistoryApi from './videoHistoryApi';

export interface SyncVideoHistoryInput {
  videoId: string;
  title: string;
  url: string;
  channel: string;
}

let bootstrapPromise: Promise<void> | null = null;

export function resetVideoHistorySyncBootstrap(): void {
  bootstrapPromise = null;
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

export async function syncVideoHistoryToServer(
  input: SyncVideoHistoryInput
): Promise<void> {
  if (!canSync()) {
    return;
  }

  try {
    await videoHistoryApi.recordVideoHistory({
      videoId: input.videoId,
      title: input.title,
      url: input.url,
      channel: input.channel,
    });
  } catch (error) {
    console.warn('[video-history] Failed to sync to server:', error);
  }
}

function serverToLocalEntry(record: VideoHistoryRecord): TranscriptHistoryEntry {
  return {
    videoId: record.videoId,
    url: record.url,
    title: record.title,
    text: '',
    transcript: [],
    savedAt: record.createdAt,
  };
}

function mergeVideoHistoryFromServer(
  serverRecords: VideoHistoryRecord[],
  localEntries: TranscriptHistoryEntry[]
): TranscriptHistoryEntry[] {
  const localByVideoId = new Map(
    localEntries.map((entry) => [entry.videoId, entry])
  );

  return serverRecords
    .map((record) => {
      const local = localByVideoId.get(record.videoId);
      if (!local) {
        return serverToLocalEntry(record);
      }

      return {
        ...local,
        title: record.title || local.title,
        url: record.url || local.url,
        savedAt: Math.max(local.savedAt, record.createdAt),
      };
    })
    .sort((left, right) => right.savedAt - left.savedAt);
}

export async function bootstrapVideoHistorySync(userId: string): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    let serverRecords: VideoHistoryRecord[] = [];

    try {
      serverRecords = await videoHistoryApi.listVideoHistory();
    } catch (error) {
      console.warn('[video-history] Failed to load from server:', error);
      return;
    }

    const localEntries = getTranscriptHistoryForUser(userId);
    const merged = mergeVideoHistoryFromServer(serverRecords, localEntries);

    replaceTranscriptHistoryForUser(userId, merged);
    notifyVideoHistoryChanged();
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
