import type { BookmarkRecord, CreateBookmarkInput } from '../../../v2-core/types';
import { BOOKMARK_DUPLICATE_TOLERANCE_SECONDS } from '../../../v2-core/validation/bookmark-input';
import { notifyBookmarksChanged } from '../dataRefresh';
import type { Bookmark } from '../bookmarks';
import { isBackendV2Enabled } from './config';
import * as bookmarksApi from './bookmarksApi';
import { getAccessToken } from './tokenStorage';

const SERVER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let bootstrapPromise: Promise<void> | null = null;

export function resetBookmarksSyncBootstrap(): void {
  bootstrapPromise = null;
}

function canSync(): boolean {
  return isBackendV2Enabled() && Boolean(getAccessToken());
}

export function isServerSyncedBookmarkId(id: string): boolean {
  return SERVER_ID_PATTERN.test(id);
}

function toV2Payload(
  bookmark: Bookmark
): Pick<CreateBookmarkInput, 'videoId' | 'timestamp' | 'note'> {
  return {
    videoId: bookmark.videoId,
    timestamp: bookmark.seconds,
    note: bookmark.label,
  };
}

function toLocalBookmark(server: BookmarkRecord, local?: Bookmark): Bookmark {
  return {
    id: server.id,
    videoId: server.videoId,
    seconds: server.timestamp,
    label: server.note || local?.label || '',
    createdAt: server.createdAt,
  };
}

function findLocalMatch(
  server: BookmarkRecord,
  locals: Bookmark[]
): Bookmark | undefined {
  return locals.find(
    (bookmark) =>
      bookmark.videoId === server.videoId &&
      Math.abs(bookmark.seconds - server.timestamp) <=
        BOOKMARK_DUPLICATE_TOLERANCE_SECONDS
  );
}

async function replaceLocalBookmarkId(
  oldId: string,
  server: BookmarkRecord,
  local: Bookmark
): Promise<void> {
  const { getBookmarks, replaceBookmarks } = await import('../bookmarks');
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex((bookmark) => bookmark.id === oldId);
  if (index < 0) return;

  bookmarks[index] = toLocalBookmark(server, local);
  replaceBookmarks(bookmarks);
  notifyBookmarksChanged();
}

export async function syncBookmarkCreate(bookmark: Bookmark): Promise<void> {
  if (!canSync()) return;

  try {
    const created = await bookmarksApi.createBookmark(toV2Payload(bookmark));
    if (created.id !== bookmark.id) {
      await replaceLocalBookmarkId(bookmark.id, created, bookmark);
    }
  } catch (error) {
    console.warn('[bookmarks] Failed to create on server:', error);
  }
}

export async function syncBookmarkDelete(id: string): Promise<void> {
  if (!canSync() || !isServerSyncedBookmarkId(id)) return;

  try {
    await bookmarksApi.deleteBookmark(id);
  } catch (error) {
    console.warn('[bookmarks] Failed to delete on server:', error);
  }
}

export async function bootstrapBookmarksSync(): Promise<void> {
  if (!canSync()) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const { getBookmarks, replaceBookmarks } = await import('../bookmarks');

    let serverBookmarks: BookmarkRecord[] = [];
    try {
      serverBookmarks = await bookmarksApi.listBookmarks();
    } catch (error) {
      console.warn('[bookmarks] Failed to load from server:', error);
      return;
    }

    const localBookmarks = getBookmarks();
    const localById = new Map(localBookmarks.map((bookmark) => [bookmark.id, bookmark]));
    const processedLocalIds = new Set<string>();
    const merged: Bookmark[] = [];

    for (const serverBookmark of serverBookmarks) {
      const local =
        localById.get(serverBookmark.id) ??
        findLocalMatch(serverBookmark, localBookmarks);

      merged.push(toLocalBookmark(serverBookmark, local));
      if (local) processedLocalIds.add(local.id);
    }

    for (const localBookmark of localBookmarks) {
      if (processedLocalIds.has(localBookmark.id)) continue;

      try {
        const created = await bookmarksApi.createBookmark(toV2Payload(localBookmark));
        merged.push(toLocalBookmark(created, localBookmark));
      } catch (error) {
        console.warn('[bookmarks] Failed to upload local bookmark:', error);
        merged.push(localBookmark);
      }
    }

    replaceBookmarks(merged);
    notifyBookmarksChanged();
  })().finally(() => {
    bootstrapPromise = null;
  });

  return bootstrapPromise;
}
