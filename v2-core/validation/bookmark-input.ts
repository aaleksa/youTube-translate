import { ApiError } from '../errors';
import type { CreateBookmarkInput } from '../types';

export const BOOKMARK_DUPLICATE_TOLERANCE_SECONDS = 0.5;

const MAX_VIDEO_ID_LENGTH = 20;
const MAX_NOTE_LENGTH = 500;
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateCreateBookmarkInput(
  input: CreateBookmarkInput
): Required<CreateBookmarkInput> {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_BOOKMARK');
  }

  const videoId = String(input.videoId ?? '').trim();
  if (!videoId) {
    throw new ApiError('videoId is required', 400, 'INVALID_BOOKMARK');
  }

  if (videoId.length > MAX_VIDEO_ID_LENGTH) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH} characters`,
      400,
      'INVALID_BOOKMARK'
    );
  }

  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new ApiError('videoId has an invalid format', 400, 'INVALID_BOOKMARK');
  }

  const timestamp = input.timestamp;
  if (
    typeof timestamp !== 'number' ||
    !Number.isFinite(timestamp) ||
    timestamp < 0
  ) {
    throw new ApiError(
      'timestamp must be a non-negative number',
      400,
      'INVALID_BOOKMARK'
    );
  }

  let note = '';
  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== 'string') {
      throw new ApiError('note must be a string', 400, 'INVALID_BOOKMARK');
    }
    note = input.note.trim();
    if (note.length > MAX_NOTE_LENGTH) {
      throw new ApiError(
        `note must be at most ${MAX_NOTE_LENGTH} characters`,
        400,
        'INVALID_BOOKMARK'
      );
    }
  }

  return { videoId, timestamp, note };
}
