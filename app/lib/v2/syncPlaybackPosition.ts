import { isBackendV2Enabled } from './config';
import {
  getPlaybackPosition,
  savePlaybackPosition,
} from './playbackPositionApi';
import { getAccessToken } from './tokenStorage';
import { withPendingSync } from './syncStatus';

const SAVE_INTERVAL_MS = 3000;
const MIN_POSITION_SECONDS = 1;

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let lastSavedAt = 0;
let lastSavedVideoId: string | null = null;
let lastSavedPosition = 0;
let pendingVideoId: string | null = null;
let pendingPosition = 0;

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

function clearPendingTimer(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
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
      await savePlaybackPosition({ videoId, lastPosition });
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

export async function loadPlaybackPosition(
  videoId: string
): Promise<number> {
  if (!canSync() || !videoId) {
    return 0;
  }

  try {
    const record = await getPlaybackPosition(videoId);
    return record.lastPosition >= MIN_POSITION_SECONDS
      ? record.lastPosition
      : 0;
  } catch (error) {
    console.warn('[playback-position] Failed to load from server:', error);
    return 0;
  }
}

export function resetPlaybackPositionSyncState(): void {
  clearPendingTimer();
  pendingVideoId = null;
  pendingPosition = 0;
  lastSavedVideoId = null;
  lastSavedPosition = 0;
  lastSavedAt = 0;
}
