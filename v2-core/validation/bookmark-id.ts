import { ApiError } from '../errors';

export function normalizeBookmarkId(bookmarkId: string): string {
  const id = bookmarkId.trim();

  if (!id) {
    throw new ApiError('Bookmark id is required', 400, 'INVALID_BOOKMARK_ID');
  }

  if (id.length > 64) {
    throw new ApiError('Bookmark id is invalid', 400, 'INVALID_BOOKMARK_ID');
  }

  return id;
}
