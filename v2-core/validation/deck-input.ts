import { ApiError } from '../errors';
import type { CreateDeckInput } from '../types';

const MAX_NAME_LENGTH = 120;

export function validateCreateDeckInput(input: CreateDeckInput): CreateDeckInput {
  const name = input.name?.trim() ?? '';

  if (!name) {
    throw new ApiError('name is required', 400, 'INVALID_DECK');
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new ApiError(
      `name must be at most ${MAX_NAME_LENGTH} characters`,
      400,
      'INVALID_DECK'
    );
  }

  return { name };
}

export function normalizeDeckId(deckId: string): string {
  const normalized = deckId.trim();
  if (!normalized) {
    throw new ApiError('deckId is required', 400, 'INVALID_DECK');
  }
  return normalized;
}
