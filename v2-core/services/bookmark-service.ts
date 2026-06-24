import { ConflictError, NotFoundError } from '../errors';
import type {
  AuthenticatedContext,
  BookmarkRecord,
  CreateBookmarkInput,
} from '../types';
import { isLocalBackend } from '../storage/config';
import * as localBookmarks from '../storage/local-bookmark-store';
import {
  BOOKMARK_DUPLICATE_TOLERANCE_SECONDS,
  normalizeBookmarkVideoIdFilter,
  validateCreateBookmarkInput,
} from '../validation/bookmark-input';
import { normalizeBookmarkId } from '../validation/bookmark-id';
import { bookmarkSk, userPk } from '../dynamodb/keys';
import {
  deleteItem,
  getItem,
  putItem,
  queryByUser,
  type DynamoItem,
} from '../dynamodb/repository';
import { randomUUID } from 'node:crypto';

interface BookmarkItem extends DynamoItem {
  entityType: 'BOOKMARK';
  id: string;
  videoId: string;
  timestamp: number;
  note: string;
}

function toRecord(item: BookmarkItem): BookmarkRecord {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    timestamp: item.timestamp,
    note: item.note,
    createdAt: item.createdAt,
  };
}

function hasBookmarkNearTime(
  items: BookmarkItem[],
  videoId: string,
  timestamp: number,
  tolerance = BOOKMARK_DUPLICATE_TOLERANCE_SECONDS
): boolean {
  return items.some(
    (bookmark) =>
      bookmark.videoId === videoId &&
      Math.abs(bookmark.timestamp - timestamp) <= tolerance
  );
}

function normalizeVideoIdFilter(videoId: string | null): string | undefined {
  return normalizeBookmarkVideoIdFilter(videoId);
}

export async function listBookmarks(
  auth: AuthenticatedContext,
  videoId?: string
): Promise<BookmarkRecord[]> {
  const filter = normalizeVideoIdFilter(videoId ?? null);

  if (isLocalBackend()) {
    return localBookmarks.listBookmarks(auth.userId, filter);
  }

  const items = await queryByUser<BookmarkItem>(auth.userId, 'BOOKMARK#');
  const records = items.map(toRecord);

  if (!filter) {
    return records.sort(
      (left, right) =>
        left.videoId.localeCompare(right.videoId) ||
        left.timestamp - right.timestamp ||
        left.createdAt - right.createdAt
    );
  }

  return records
    .filter((bookmark) => bookmark.videoId === filter)
    .sort(
      (left, right) =>
        left.timestamp - right.timestamp || left.createdAt - right.createdAt
    );
}

export async function createBookmark(
  auth: AuthenticatedContext,
  input: CreateBookmarkInput
): Promise<BookmarkRecord> {
  const validated = validateCreateBookmarkInput(input);

  if (isLocalBackend()) {
    return localBookmarks.createBookmark(auth.userId, validated);
  }

  const existing = await queryByUser<BookmarkItem>(auth.userId, 'BOOKMARK#');
  if (
    hasBookmarkNearTime(existing, validated.videoId, validated.timestamp)
  ) {
    throw new ConflictError('A bookmark already exists at this timestamp');
  }

  const now = Date.now();
  const id = randomUUID();
  const item: BookmarkItem = {
    PK: userPk(auth.userId),
    SK: bookmarkSk(id),
    entityType: 'BOOKMARK',
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    timestamp: validated.timestamp,
    note: validated.note,
    createdAt: now,
  };

  await putItem(item);
  return toRecord(item);
}

export async function deleteBookmark(
  auth: AuthenticatedContext,
  bookmarkId: string
): Promise<{ success: true }> {
  const normalizedId = normalizeBookmarkId(bookmarkId);

  if (isLocalBackend()) {
    return localBookmarks.deleteBookmark(auth.userId, normalizedId);
  }

  const pk = userPk(auth.userId);
  const sk = bookmarkSk(normalizedId);
  const existing = await getItem<BookmarkItem>(pk, sk);

  // Ownership: PK is scoped to auth.userId — another user's bookmark is not found (404).
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError('Bookmark not found');
  }

  await deleteItem(pk, sk);
  return { success: true };
}
