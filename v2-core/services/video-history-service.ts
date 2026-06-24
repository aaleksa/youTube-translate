import { ApiError, NotFoundError } from '../errors';
import type {
  AuthenticatedContext,
  RecordVideoHistoryInput,
  VideoHistoryRecord,
} from '../types';
import { userPk, videoHistorySk } from '../dynamodb/keys';
import {
  deleteItem,
  getItem,
  putItem,
  queryByUser,
  type DynamoItem,
} from '../dynamodb/repository';

interface VideoHistoryItem extends DynamoItem {
  entityType: 'VIDEO';
  videoId: string;
  title: string;
  url: string;
  channel: string;
}

function normalizeInput(
  input: RecordVideoHistoryInput
): RecordVideoHistoryInput {
  const videoId = input.videoId?.trim();
  const url = input.url?.trim();
  const title = input.title?.trim() || videoId || '';
  const channel = input.channel?.trim() || '';

  if (!videoId || !url) {
    throw new ApiError('videoId and url are required', 400, 'INVALID_VIDEO_HISTORY');
  }

  return { videoId, url, title, channel };
}

function toRecord(item: VideoHistoryItem): VideoHistoryRecord {
  return {
    userId: item.userId,
    videoId: item.videoId,
    title: item.title,
    url: item.url,
    channel: item.channel,
    createdAt: item.createdAt,
  };
}

export async function listVideoHistory(
  auth: AuthenticatedContext
): Promise<VideoHistoryRecord[]> {
  const items = await queryByUser<VideoHistoryItem>(auth.userId, 'VIDEO#');
  return items
    .map(toRecord)
    .sort((left, right) => right.createdAt - left.createdAt);
}

export async function recordVideoHistory(
  auth: AuthenticatedContext,
  input: RecordVideoHistoryInput
): Promise<VideoHistoryRecord> {
  const normalized = normalizeInput(input);
  const pk = userPk(auth.userId);
  const sk = videoHistorySk(normalized.videoId);
  const now = Date.now();

  const item: VideoHistoryItem = {
    PK: pk,
    SK: sk,
    entityType: 'VIDEO',
    userId: auth.userId,
    videoId: normalized.videoId,
    title: normalized.title,
    url: normalized.url,
    channel: normalized.channel,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(item);
  return toRecord(item);
}

export async function deleteVideoHistory(
  auth: AuthenticatedContext,
  videoId: string
): Promise<{ success: true }> {
  const normalizedVideoId = videoId.trim();
  if (!normalizedVideoId) {
    throw new ApiError('videoId is required', 400, 'INVALID_VIDEO_HISTORY');
  }

  const pk = userPk(auth.userId);
  const sk = videoHistorySk(normalizedVideoId);
  const existing = await getItem<VideoHistoryItem>(pk, sk);

  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Video history entry not found');
  }

  await deleteItem(pk, sk);
  return { success: true };
}
