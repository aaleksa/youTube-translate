import type { VideoHistoryRecord } from '../../../v2-core/types';
import { notifyVideoHistoryChanged } from '../dataRefresh';
import {
  getTranscriptHistory,
  replaceTranscriptHistory,
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

function mergeVideoHistory(
  serverRecords: VideoHistoryRecord[],
  localEntries: TranscriptHistoryEntry[]
): TranscriptHistoryEntry[] {
  const localByVideoId = new Map(
    localEntries.map((entry) => [entry.videoId, entry])
  );
  const merged: TranscriptHistoryEntry[] = [];

  for (const record of serverRecords) {
    const local = localByVideoId.get(record.videoId);
    if (local) {
      merged.push({
        ...local,
        title: record.title || local.title,
        url: record.url || local.url,
        savedAt: Math.max(local.savedAt, record.createdAt),
      });
      localByVideoId.delete(record.videoId);
      continue;
    }

    merged.push(serverToLocalEntry(record));
  }

  for (const entry of localByVideoId.values()) {
    merged.push(entry);
  }

  return merged.sort((left, right) => right.savedAt - left.savedAt);
}

export async function bootstrapVideoHistorySync(): Promise<void> {
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

    const localEntries = getTranscriptHistory();
    const merged = mergeVideoHistory(serverRecords, localEntries);
    const processedVideoIds = new Set<string>();

    for (const record of serverRecords) {
      processedVideoIds.add(record.videoId);
    }

    for (const entry of localEntries) {
      if (processedVideoIds.has(entry.videoId)) continue;

      try {
        await videoHistoryApi.recordVideoHistory({
          videoId: entry.videoId,
          title: entry.title,
          url: entry.url,
          channel: '',
        });
      } catch (error) {
        console.warn('[video-history] Failed to upload local entry:', error);
      }
    }

    replaceTranscriptHistory(merged);
    notifyVideoHistoryChanged();
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
