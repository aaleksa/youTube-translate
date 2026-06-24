import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-bookmarks';
const DUPLICATE_TOLERANCE_SECONDS = 0.5;

function queueBookmarkCreate(bookmark: Bookmark): void {
  void import('./v2/syncBookmarks').then((mod) => mod.syncBookmarkCreate(bookmark));
}

function queueBookmarkDelete(id: string): void {
  void import('./v2/syncBookmarks').then((mod) => mod.syncBookmarkDelete(id));
}

function bookmarksStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export interface Bookmark {
  id: string;
  videoId: string;
  seconds: number;
  label: string;
  createdAt: number;
}

export interface BookmarkDraft {
  videoId: string;
  seconds: number;
  label: string;
}

export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(bookmarksStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bookmark[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getBookmarksForVideo(videoId: string): Bookmark[] {
  return getBookmarks()
    .filter((bookmark) => bookmark.videoId === videoId)
    .sort((a, b) => a.seconds - b.seconds || a.createdAt - b.createdAt);
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(bookmarksStorageKey(), JSON.stringify(bookmarks));
}

export function replaceBookmarks(bookmarks: Bookmark[]): void {
  saveBookmarks(bookmarks);
}

function createBookmark(draft: BookmarkDraft): Bookmark {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    videoId: draft.videoId,
    seconds: draft.seconds,
    label: draft.label.trim(),
    createdAt: Date.now(),
  };
}

export function hasBookmarkNearTime(
  videoId: string,
  seconds: number,
  tolerance = DUPLICATE_TOLERANCE_SECONDS
): boolean {
  return getBookmarksForVideo(videoId).some(
    (bookmark) => Math.abs(bookmark.seconds - seconds) <= tolerance
  );
}

export function addBookmark(draft: BookmarkDraft): Bookmark | null {
  if (hasBookmarkNearTime(draft.videoId, draft.seconds)) {
    return null;
  }

  const bookmark = createBookmark(draft);
  saveBookmarks([bookmark, ...getBookmarks()]);
  queueBookmarkCreate(bookmark);
  return bookmark;
}

export function removeBookmark(id: string): Bookmark[] {
  const updated = getBookmarks().filter((bookmark) => bookmark.id !== id);
  saveBookmarks(updated);
  queueBookmarkDelete(id);
  return updated;
}

export function clearBookmarksForVideo(videoId: string): void {
  const removed = getBookmarksForVideo(videoId);
  saveBookmarks(getBookmarks().filter((bookmark) => bookmark.videoId !== videoId));
  for (const bookmark of removed) {
    queueBookmarkDelete(bookmark.id);
  }
}
