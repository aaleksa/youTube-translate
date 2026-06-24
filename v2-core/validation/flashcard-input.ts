import { ApiError } from '../errors';
import type { CreateFlashcardInput } from '../types';

const MAX_WORD_LENGTH = 200;
const MAX_TRANSLATION_LENGTH = 500;
const MAX_EXAMPLE_LENGTH = 2000;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS = 20;
const MAX_DECK_IDS = 50;
const MIN_EASE = 1.3;
const MAX_EASE = 5;

function normalizeWord(word: string): string {
  return word.trim().replace(/\s+/g, ' ');
}

function readOptionalString(
  value: unknown,
  field: string,
  maxLength: number
): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(`${field} must be a string`, 400, 'INVALID_FLASHCARD');
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ApiError(
      `${field} must be at most ${maxLength} characters`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  return trimmed;
}

function readOptionalStringArray(
  value: unknown,
  field: string,
  maxItems: number,
  maxItemLength: number
): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ApiError(`${field} must be an array`, 400, 'INVALID_FLASHCARD');
  }

  if (value.length > maxItems) {
    throw new ApiError(
      `${field} must contain at most ${maxItems} items`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') {
      throw new ApiError(`${field} items must be strings`, 400, 'INVALID_FLASHCARD');
    }
    const trimmed = entry.trim();
    if (!trimmed) continue;
    if (trimmed.length > maxItemLength) {
      throw new ApiError(
        `${field} items must be at most ${maxItemLength} characters`,
        400,
        'INVALID_FLASHCARD'
      );
    }
    items.push(trimmed);
  }

  return [...new Set(items)];
}

function readOptionalNonNegativeNumber(
  value: unknown,
  field: string
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ApiError(
      `${field} must be a non-negative number`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  return value;
}

function readOptionalEase(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ApiError('ease must be a number', 400, 'INVALID_FLASHCARD');
  }

  if (value < MIN_EASE || value > MAX_EASE) {
    throw new ApiError(
      `ease must be between ${MIN_EASE} and ${MAX_EASE}`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  return value;
}

export function validateCreateFlashcardInput(
  input: CreateFlashcardInput
): Omit<CreateFlashcardInput, never> {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_FLASHCARD');
  }

  const word = normalizeWord(String(input.word ?? ''));
  const translation = String(input.translation ?? '').trim();

  if (!word) {
    throw new ApiError('word is required', 400, 'INVALID_FLASHCARD');
  }

  if (word.length > MAX_WORD_LENGTH) {
    throw new ApiError(
      `word must be at most ${MAX_WORD_LENGTH} characters`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  if (!translation) {
    throw new ApiError('translation is required', 400, 'INVALID_FLASHCARD');
  }

  if (translation.length > MAX_TRANSLATION_LENGTH) {
    throw new ApiError(
      `translation must be at most ${MAX_TRANSLATION_LENGTH} characters`,
      400,
      'INVALID_FLASHCARD'
    );
  }

  const example = readOptionalString(input.example, 'example', MAX_EXAMPLE_LENGTH);
  const videoId = readOptionalString(input.videoId, 'videoId', 20);

  if (videoId && !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new ApiError('videoId has an invalid format', 400, 'INVALID_FLASHCARD');
  }

  return {
    word,
    translation,
    example,
    tags: readOptionalStringArray(input.tags, 'tags', MAX_TAGS, MAX_TAG_LENGTH),
    videoId,
    deckIds: readOptionalStringArray(
      input.deckIds,
      'deckIds',
      MAX_DECK_IDS,
      64
    ),
    repetitions: readOptionalNonNegativeNumber(input.repetitions, 'repetitions'),
    ease: readOptionalEase(input.ease),
    interval: readOptionalNonNegativeNumber(input.interval, 'interval'),
    nextReview: readOptionalNonNegativeNumber(input.nextReview, 'nextReview'),
    knownCount: readOptionalNonNegativeNumber(input.knownCount, 'knownCount'),
    unknownCount: readOptionalNonNegativeNumber(input.unknownCount, 'unknownCount'),
  };
}

export function normalizeFlashcardWord(word: string): string {
  return normalizeWord(word).toLowerCase();
}
