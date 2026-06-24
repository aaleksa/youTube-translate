import type { PlaybackPositionRecord } from '../../../v2-core/types';
import { isBackendV2Enabled } from './config';
import {
  getPlaybackPosition,
  listPlaybackPositions,
  savePlaybackPosition,
} from './playbackPositionApi';
import { getAccessToken } from './tokenStorage';
import { userScopedStorageKey } from './userStorage';
import { withPendingSync } from './syncStatus';

const SAVE_INTERVAL_MS = 3000;
const MIN_POSITION_SECONDS = 1;
const CACHE_BASE_KEY = 'yoytube-playback-position-cache';

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedAt = 0;
let lastSavedVideoId: string | null = null;
let lastSavedPosition = 0;
let pendingVideoId: string | null = null;
let pendingPosition = 0;
let bootstrapPromise: Promise<void> | null = null;

type PlaybackCache = Record<string, { lastPosition: number; updatedAt: number }>;

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

function cacheStorageKey(): string {
  return userScopedStorageKey(CACHE_BASE_KEY);
}

function readCache(): PlaybackCache {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(cacheStorageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlaybackCache;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(record: PlaybackPositionRecord): void {
  if (typeof window === 'undefined' || record.lastPosition < MIN_POSITION_SECONDS) {
    return;
  }

  const cache = readCache();
  const existing = cache[record.videoId];
  if (existing && existing.updatedAt >= record.updatedAt) {
    return;
  }

  cache[record.videoId] = {
    lastPosition: record.lastPosition,
    updatedAt: record.updatedAt,
  };
  localStorage.setItem(cacheStorageKey(), JSON.stringify(cache));
}

function getCachedPosition(videoId: string): number {
  const cached = readCache()[videoId];
  if (!cached || cached.lastPosition < MIN_POSITION_SECONDS) {
    return 0;
  }
  return cached.lastPosition;
}

function clearPendingTimer(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

export function resetPlaybackPositionSyncBootstrap(): void {
  bootstrapPromise = null;
}

async function flushPlaybackPosition(
  videoId: string,
  lastPosition: number
): Promise<void> {
  if (!canSync() || lastPosition < MIN_POSITION_SECONDS) {
    return;
  }

  if (
    lastSavedVideoId === videoId &&
    Math.abs(lastSavedPosition - lastPosition) < 0.5 &&
    Date.now() - lastSavedAt < SAVE_INTERVAL_MS
  ) {
    return;
  }

  await withPendingSync(async () => {
    try {
      const saved = await savePlaybackPosition({ videoId, lastPosition });
      writeCache(saved);
      lastSavedVideoId = videoId;
      lastSavedPosition = lastPosition;
      lastSavedAt = Date.now();
    } catch (error) {
      console.warn('[playback-position] Failed to sync to server:', error);
    }
  });
}

export function schedulePlaybackPositionSave(
  videoId: string,
  lastPosition: number
): void {
  if (!canSync() || !videoId || lastPosition < MIN_POSITION_SECONDS) {
    return;
  }

  pendingVideoId = videoId;
  pendingPosition = lastPosition;

  const elapsed = Date.now() - lastSavedAt;
  if (elapsed >= SAVE_INTERVAL_MS) {
    clearPendingTimer();
    void flushPlaybackPosition(videoId, lastPosition);
    return;
  }

  clearPendingTimer();
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (!pendingVideoId) return;
    void flushPlaybackPosition(pendingVideoId, pendingPosition);
  }, SAVE_INTERVAL_MS - elapsed);
}

export async function savePlaybackPositionNow(
  videoId: string,
  lastPosition: number
): Promise<void> {
  clearPendingTimer();
  pendingVideoId = null;
  pendingPosition = 0;
  await flushPlaybackPosition(videoId, lastPosition);
}

export async function flushPendingPlaybackPosition(): Promise<void> {
  clearPendingTimer();
  const videoId = pendingVideoId;
  const position = pendingPosition;
  pendingVideoId = null;
  pendingPosition = 0;
  if (!videoId) return;
  await flushPlaybackPosition(videoId, position);
}

export async function loadPlaybackPosition(videoId: string): Promise<number> {
  if (!videoId) {
    return 0;
  }

  const cached = getCachedPosition(videoId);
  if (!canSync()) {
    return cached;
  }

  try {
    const record = await getPlaybackPosition(videoId);
    if (record.lastPosition >= MIN_POSITION_SECONDS) {
      writeCache(record);
      return Math.max(cached, record.lastPosition);
    }
  } catch (error) {
    console.warn('[playback-position] Failed to load from server:', error);
  }

  return cached;
}

export async function bootstrapPlaybackPositionsSync(
  _userId: string
): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const records = await listPlaybackPositions();
      for (const record of records) {
        writeCache(record);
      }
    } catch (error) {
      console.warn('[playback-position] Failed to bootstrap from server:', error);
    }
  })();

  return bootstrapPromise;
}

export function resetPlaybackPositionSyncState(): void {
  clearPendingTimer();
  pendingVideoId = null;
  pendingPosition = 0;
  lastSavedVideoId = null;
  lastSavedPosition = 0;
  lastSavedAt = 0;
}
