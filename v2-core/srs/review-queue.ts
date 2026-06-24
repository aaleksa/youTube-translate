import type { FlashcardRecord } from '../types';
import { isReviewDue } from './spaced-repetition';

function getWeaknessScore(card: FlashcardRecord): number {
  const known = card.knownCount ?? 0;
  const unknown = card.unknownCount ?? 0;

  if (unknown > known) {
    return 10 + (unknown - known);
  }

  return 0;
}

export function filterDueFlashcards(
  cards: FlashcardRecord[],
  now = Date.now()
): FlashcardRecord[] {
  return cards.filter((card) => isReviewDue(card.nextReview, now));
}

export function sortReviewQueue(cards: FlashcardRecord[]): FlashcardRecord[] {
  return [...cards].sort((left, right) => {
    const weakDiff = getWeaknessScore(right) - getWeaknessScore(left);
    if (weakDiff !== 0) return weakDiff;

    const leftDue = left.nextReview ?? 0;
    const rightDue = right.nextReview ?? 0;
    if (leftDue !== rightDue) return leftDue - rightDue;

    return left.createdAt - right.createdAt;
  });
}

export function buildTodayReviewQueue(
  cards: FlashcardRecord[],
  now = Date.now()
): FlashcardRecord[] {
  return sortReviewQueue(filterDueFlashcards(cards, now));
}
