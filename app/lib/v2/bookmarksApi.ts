import type { BookmarkRecord, CreateBookmarkInput } from '../../../v2-core/types';
import { apiDelete, apiGet, apiPost } from './apiClient';

function buildVideoQuery(videoId?: string): string {
  if (!videoId) return '';
  return `?videoId=${encodeURIComponent(videoId)}`;
}

export async function listBookmarks(videoId?: string): Promise<BookmarkRecord[]> {
  return apiGet<BookmarkRecord[]>(`/bookmarks${buildVideoQuery(videoId)}`);
}

export async function createBookmark(
  input: CreateBookmarkInput
): Promise<BookmarkRecord> {
  return apiPost<BookmarkRecord>('/bookmarks', input);
}

export async function deleteBookmark(id: string): Promise<void> {
  await apiDelete(`/bookmarks/${encodeURIComponent(id)}`);
}
