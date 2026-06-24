import { ApiError } from '../errors';
import type { CreateQuizResultInput } from '../types';

const MAX_VIDEO_ID_LENGTH = 20;
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function validateVideoId(videoId: string): string {
  if (!videoId) {
    throw new ApiError('videoId is required', 400, 'INVALID_QUIZ_RESULT');
  }

  if (videoId.length > MAX_VIDEO_ID_LENGTH) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH} characters`,
      400,
      'INVALID_QUIZ_RESULT'
    );
  }

  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new ApiError('videoId has an invalid format', 400, 'INVALID_QUIZ_RESULT');
  }

  return videoId;
}

export function normalizeQuizResultVideoIdFilter(
  videoId?: string | null
): string | undefined {
  if (videoId === undefined || videoId === null) {
    return undefined;
  }

  const trimmed = videoId.trim();
  if (!trimmed) {
    return undefined;
  }

  return validateVideoId(trimmed);
}

export function validateCreateQuizResultInput(
  input: CreateQuizResultInput
): CreateQuizResultInput {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_QUIZ_RESULT');
  }

  const videoId = validateVideoId(String(input.videoId ?? '').trim());

  const score = input.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
    throw new ApiError(
      'score must be a non-negative integer',
      400,
      'INVALID_QUIZ_RESULT'
    );
  }

  const totalQuestions = input.totalQuestions;
  if (
    typeof totalQuestions !== 'number' ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions < 1
  ) {
    throw new ApiError(
      'totalQuestions must be a positive integer',
      400,
      'INVALID_QUIZ_RESULT'
    );
  }

  if (score > totalQuestions) {
    throw new ApiError(
      'score cannot exceed totalQuestions',
      400,
      'INVALID_QUIZ_RESULT'
    );
  }

  return { videoId, score, totalQuestions };
}
