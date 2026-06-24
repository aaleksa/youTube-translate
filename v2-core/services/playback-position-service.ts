import { ApiError } from '../errors';
import type {
  AuthenticatedContext,
  PlaybackPositionRecord,
  SavePlaybackPositionInput,
} from '../types';
import { playbackPositionSk, userPk } from '../dynamodb/keys';
import { getItem, putItem, type DynamoItem } from '../dynamodb/repository';

interface PlaybackPositionItem extends DynamoItem {
  entityType: 'PLAYBACK';
  videoId: string;
  lastPosition: number;
}

const MIN_POSITION_SECONDS = 0;

function normalizeVideoId(videoId: string): string {
  const normalized = videoId.trim();
  if (!normalized) {
    throw new ApiError('videoId is required', 400, 'INVALID_PLAYBACK_POSITION');
  }
  return normalized;
}

function normalizePosition(lastPosition: number): number {
  if (!Number.isFinite(lastPosition) || lastPosition < MIN_POSITION_SECONDS) {
    throw new ApiError(
      'lastPosition must be a non-negative number',
      400,
      'INVALID_PLAYBACK_POSITION'
    );
  }
  return lastPosition;
}

function toRecord(item: PlaybackPositionItem): PlaybackPositionRecord {
  return {
    userId: item.userId,
    videoId: item.videoId,
    lastPosition: item.lastPosition,
    updatedAt: item.updatedAt ?? item.createdAt,
  };
}

function emptyRecord(
  auth: AuthenticatedContext,
  videoId: string
): PlaybackPositionRecord {
  return {
    userId: auth.userId,
    videoId,
    lastPosition: 0,
    updatedAt: 0,
  };
}

export async function getPlaybackPosition(
  auth: AuthenticatedContext,
  videoId: string
): Promise<PlaybackPositionRecord> {
  const normalizedVideoId = normalizeVideoId(videoId);
  const existing = await getItem<PlaybackPositionItem>(
    userPk(auth.userId),
    playbackPositionSk(normalizedVideoId)
  );

  if (!existing || existing.userId !== auth.userId) {
    return emptyRecord(auth, normalizedVideoId);
  }

  return toRecord(existing);
}

export async function savePlaybackPosition(
  auth: AuthenticatedContext,
  input: SavePlaybackPositionInput
): Promise<PlaybackPositionRecord> {
  const videoId = normalizeVideoId(input.videoId);
  const lastPosition = normalizePosition(input.lastPosition);
  const now = Date.now();
  const pk = userPk(auth.userId);
  const sk = playbackPositionSk(videoId);
  const existing = await getItem<PlaybackPositionItem>(pk, sk);

  const item: PlaybackPositionItem = {
    PK: pk,
    SK: sk,
    entityType: 'PLAYBACK',
    userId: auth.userId,
    videoId,
    lastPosition,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}
