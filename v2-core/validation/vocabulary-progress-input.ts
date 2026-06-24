import { ApiError } from '../errors';
import type { UpsertVocabularyProgressInput } from '../types';
import { normalizeFlashcardWord } from './flashcard-input';

const MAX_WORD_LENGTH = 200;
const MAX_REVIEW_COUNT = 1_000_000;

export function normalizeVocabularyProgressWord(word: string): string {
  return normalizeFlashcardWord(word);
}

export function validateUpsertVocabularyProgressInput(
  input: UpsertVocabularyProgressInput
): {
  word: string;
  reviewCount: number;
  mastered: boolean;
  lastReviewDate?: number | null;
} {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_VOCABULARY_PROGRESS');
  }

  const rawWord = String(input.word ?? '').trim().replace(/\s+/g, ' ');
  if (!rawWord) {
    throw new ApiError('word is required', 400, 'INVALID_VOCABULARY_PROGRESS');
  }

  if (rawWord.length > MAX_WORD_LENGTH) {
    throw new ApiError(
      `word must be at most ${MAX_WORD_LENGTH} characters`,
      400,
      'INVALID_VOCABULARY_PROGRESS'
    );
  }

  const word = normalizeVocabularyProgressWord(rawWord);

  const reviewCount = input.reviewCount;
  if (
    typeof reviewCount !== 'number' ||
    !Number.isInteger(reviewCount) ||
    reviewCount < 0 ||
    reviewCount > MAX_REVIEW_COUNT
  ) {
    throw new ApiError(
      'reviewCount must be a non-negative integer',
      400,
      'INVALID_VOCABULARY_PROGRESS'
    );
  }

  if (typeof input.mastered !== 'boolean') {
    throw new ApiError('mastered must be a boolean', 400, 'INVALID_VOCABULARY_PROGRESS');
  }

  if (input.lastReviewDate !== undefined && input.lastReviewDate !== null) {
    if (
      typeof input.lastReviewDate !== 'number' ||
      !Number.isFinite(input.lastReviewDate) ||
      input.lastReviewDate < 0
    ) {
      throw new ApiError(
        'lastReviewDate must be a non-negative number or null',
        400,
        'INVALID_VOCABULARY_PROGRESS'
      );
    }
  }

  return {
    word,
    reviewCount,
    mastered: input.mastered,
    lastReviewDate: input.lastReviewDate,
  };
}
