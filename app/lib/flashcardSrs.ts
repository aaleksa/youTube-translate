import type { Flashcard } from './flashcards';

export const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120] as const;

export type CardState = 'new' | 'learning' | 'review' | 'mastered';

export interface FlashcardReviewResult {
  card: Flashcard;
  known: boolean;
  intervalDays: number;
}

export function startOfDay(date = new Date()): number {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
}

export function addDays(days: number, from = new Date()): number {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

export function getDefaultNextReview(): number {
  return startOfDay();
}

export function getCardState(card: Flashcard): CardState {
  if (card.repetitions === 0) return 'new';
  if (card.repetitions >= 7) return 'mastered';
  if (card.repetitions >= 3) return 'review';
  return 'learning';
}

export function isCardDue(card: Flashcard, now = new Date()): boolean {
  if (card.nextReview === undefined) return true;
  return startOfDay(now) >= card.nextReview;
}

export function getDueFlashcards(
  cards: Flashcard[],
  now = new Date()
): Flashcard[] {
  return sortReviewQueue(cards.filter((card) => isCardDue(card, now)));
}

export function sortReviewQueue(cards: Flashcard[]): Flashcard[] {
  return [...cards].sort((a, b) => {
    const aDue = a.nextReview ?? 0;
    const bDue = b.nextReview ?? 0;
    if (aDue !== bDue) return aDue - bDue;
    return a.createdAt - b.createdAt;
  });
}

export function countDueOnDay(
  cards: Flashcard[],
  dayOffset: number,
  from = new Date()
): number {
  const target = addDays(dayOffset, from);
  return cards.filter((card) => card.nextReview === target).length;
}

export function applyKnownReview(card: Flashcard): FlashcardReviewResult {
  const repetitions = card.repetitions + 1;
  const intervalDays =
    SRS_INTERVALS_DAYS[
      Math.min(repetitions - 1, SRS_INTERVALS_DAYS.length - 1)
    ];

  const updated: Flashcard = {
    ...card,
    repetitions,
    interval: intervalDays,
    knownCount: card.knownCount + 1,
    lastReviewedAt: Date.now(),
    nextReview: addDays(intervalDays),
  };

  return { card: updated, known: true, intervalDays };
}

export function applyUnknownReview(card: Flashcard): FlashcardReviewResult {
  const intervalDays = 1;
  const updated: Flashcard = {
    ...card,
    repetitions: 0,
    interval: intervalDays,
    unknownCount: card.unknownCount + 1,
    lastReviewedAt: Date.now(),
    nextReview: addDays(intervalDays),
  };

  return { card: updated, known: false, intervalDays };
}

export function getVocabularyProgress(cards: Flashcard[]) {
  const states = { new: 0, learning: 0, review: 0, mastered: 0 };

  for (const card of cards) {
    states[getCardState(card)] += 1;
  }

  return {
    total: cards.length,
    dueToday: getDueFlashcards(cards).length,
    dueTomorrow: countDueOnDay(cards, 1),
    ...states,
  };
}
