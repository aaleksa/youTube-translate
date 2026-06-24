import { randomUUID } from 'node:crypto';
import { ApiError, ConflictError, NotFoundError } from '../errors';
import type { BookmarkRecord, CreateBookmarkInput } from '../types';
import {
  BOOKMARK_DUPLICATE_TOLERANCE_SECONDS,
  validateCreateBookmarkInput,
} from '../validation/bookmark-input';
import { normalizeBookmarkId } from '../validation/bookmark-id';
import { getLocalDatabase } from './local-db';

interface BookmarkRow {
  id: string;
  userId: string;
  videoId: string;
  timestamp: number;
  note: string;
  createdAt: number;
}

function toRecord(row: BookmarkRow): BookmarkRecord {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    timestamp: row.timestamp,
    note: row.note,
    createdAt: row.createdAt,
  };
}

function getRow(userId: string, bookmarkId: string): BookmarkRow | null {
  const db = getLocalDatabase();
  return (
    (db
      .prepare(`SELECT * FROM bookmarks WHERE id = ? AND userId = ?`)
      .get(bookmarkId, userId) as BookmarkRow | undefined) ?? null
  );
}

function hasBookmarkNearTime(
  userId: string,
  videoId: string,
  timestamp: number,
  tolerance = BOOKMARK_DUPLICATE_TOLERANCE_SECONDS
): boolean {
  const db = getLocalDatabase();
  const row = db
    .prepare(
      `SELECT id FROM bookmarks
       WHERE userId = ? AND videoId = ?
         AND abs(timestamp - ?) <= ?`
    )
    .get(userId, videoId, timestamp, tolerance) as { id: string } | undefined;

  return Boolean(row);
}

export function listBookmarks(
  userId: string,
  videoId?: string
): BookmarkRecord[] {
  const db = getLocalDatabase();
  const rows = videoId
    ? (db
        .prepare(
          `SELECT * FROM bookmarks
           WHERE userId = ? AND videoId = ?
           ORDER BY timestamp ASC, createdAt ASC`
        )
        .all(userId, videoId) as BookmarkRow[])
    : (db
        .prepare(
          `SELECT * FROM bookmarks
           WHERE userId = ?
           ORDER BY videoId ASC, timestamp ASC, createdAt ASC`
        )
        .all(userId) as BookmarkRow[]);

  return rows.map(toRecord);
}

export function createBookmark(
  userId: string,
  input: CreateBookmarkInput
): BookmarkRecord {
  const validated = validateCreateBookmarkInput(input);

  if (
    hasBookmarkNearTime(
      userId,
      validated.videoId,
      validated.timestamp
    )
  ) {
    throw new ConflictError('A bookmark already exists at this timestamp');
  }

  const now = Date.now();
  const id = randomUUID();
  const db = getLocalDatabase();

  db.prepare(
    `INSERT INTO bookmarks (
      id, userId, videoId, timestamp, note, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    validated.videoId,
    validated.timestamp,
    validated.note,
    now
  );

  const row = getRow(userId, id);
  if (!row) {
    throw new ApiError('Failed to create bookmark', 500, 'BOOKMARK_CREATE_FAILED');
  }

  return toRecord(row);
}

export function deleteBookmark(
  userId: string,
  bookmarkId: string
): { success: true } {
  const normalizedId = normalizeBookmarkId(bookmarkId);
  const existing = getRow(userId, normalizedId);
  if (!existing) {
    throw new NotFoundError('Bookmark not found');
  }

  const db = getLocalDatabase();
  db.prepare(`DELETE FROM bookmarks WHERE id = ? AND userId = ?`).run(
    normalizedId,
    userId
  );

  return { success: true };
}
