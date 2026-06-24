import { ApiError } from '../errors';

export function normalizeFlashcardId(cardId: string): string {
  const id = cardId.trim();

  if (!id) {
    throw new ApiError('Flashcard id is required', 400, 'INVALID_FLASHCARD_ID');
  }

  if (id.length > 64) {
    throw new ApiError('Flashcard id is invalid', 400, 'INVALID_FLASHCARD_ID');
  }

  return id;
}
