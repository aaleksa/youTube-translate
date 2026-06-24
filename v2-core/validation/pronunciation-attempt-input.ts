import { ApiError } from '../errors';
import type { CreatePronunciationAttemptInput } from '../types';

const MAX_VIDEO_ID_LENGTH = 20;
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function validateVideoId(videoId: string): string {
  if (!videoId) {
    throw new ApiError('videoId is required', 400, 'INVALID_PRONUNCIATION_ATTEMPT');
  }

  if (videoId.length > MAX_VIDEO_ID_LENGTH) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH} characters`,
      400,
      'INVALID_PRONUNCIATION_ATTEMPT'
    );
  }

  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new ApiError(
      'videoId has an invalid format',
      400,
      'INVALID_PRONUNCIATION_ATTEMPT'
    );
  }

  return videoId;
}

function validateStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new ApiError(`${field} must be an array`, 400, 'INVALID_PRONUNCIATION_ATTEMPT');
  }

  return value.map((item) => {
    if (typeof item !== 'string') {
      throw new ApiError(
        `${field} items must be strings`,
        400,
        'INVALID_PRONUNCIATION_ATTEMPT'
      );
    }
    return item;
  });
}

export function validateCreatePronunciationAttemptInput(
  input: CreatePronunciationAttemptInput
): CreatePronunciationAttemptInput {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_PRONUNCIATION_ATTEMPT');
  }

  const videoId = validateVideoId(String(input.videoId ?? '').trim());
  const expectedText = String(input.expectedText ?? '').trim();
  const recognizedText = String(input.recognizedText ?? '').trim();

  if (!expectedText) {
    throw new ApiError('expectedText is required', 400, 'INVALID_PRONUNCIATION_ATTEMPT');
  }

  const score = input.score;
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    throw new ApiError(
      'score must be a number between 0 and 100',
      400,
      'INVALID_PRONUNCIATION_ATTEMPT'
    );
  }

  const durationMs = input.durationMs;
  if (
    typeof durationMs !== 'number' ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    throw new ApiError(
      'durationMs must be a non-negative number',
      400,
      'INVALID_PRONUNCIATION_ATTEMPT'
    );
  }

  const sentenceId =
    typeof input.sentenceId === 'string' && input.sentenceId.trim()
      ? input.sentenceId.trim()
      : undefined;
  const phraseId =
    typeof input.phraseId === 'string' && input.phraseId.trim()
      ? input.phraseId.trim()
      : undefined;
  const id =
    typeof input.id === 'string' && input.id.trim() ? input.id.trim() : undefined;
  const createdAt =
    typeof input.createdAt === 'number' && Number.isFinite(input.createdAt)
      ? input.createdAt
      : undefined;

  return {
    ...(id ? { id } : {}),
    videoId,
    ...(sentenceId ? { sentenceId } : {}),
    ...(phraseId ? { phraseId } : {}),
    expectedText,
    recognizedText,
    score: Math.round(score),
    missedWords: validateStringArray(input.missedWords, 'missedWords'),
    extraWords: validateStringArray(input.extraWords, 'extraWords'),
    durationMs: Math.round(durationMs),
    ...(createdAt !== undefined ? { createdAt } : {}),
  };
}
