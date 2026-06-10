import type { Flashcard } from './flashcards';
import { getBestScoreForPhrase } from './pronunciationAttempts';

export const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120] as const;

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const AGAIN_DELAY_MS = 10 * 60 * 1000;

export type CardState = 'new' | 'learning' | 'review' | 'mastered';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewModifiers {
  intervalMultiplier: number;
  easeDelta: number;
}

export interface FlashcardReviewResult {
  card: Flashcard;
  known: boolean;
  intervalDays: number;
  rating: ReviewRating;
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
  return now.getTime() >= card.nextReview;
}

export function getWeaknessScore(card: Flashcard): number {
  let score = 0;

  if (card.unknownCount > card.knownCount) {
    score += 10 + (card.unknownCount - card.knownCount);
  }

  const quizTotal = card.quizCorrectCount + card.quizWrongCount;
  if (quizTotal >= 2) {
    const wrongRatio = card.quizWrongCount / quizTotal;
    if (wrongRatio > 0.4) score += Math.round(wrongRatio * 8);
  }

  if (card.videoId && card.example.trim()) {
    const pronunciationScore = getBestScoreForPhrase(
      card.videoId,
      card.sentenceId,
      card.example
    );
    if (pronunciationScore !== null && pronunciationScore < 60) {
      score += Math.round((60 - pronunciationScore) / 10);
    }
  }

  return score;
}

export function getReviewModifiers(card: Flashcard): ReviewModifiers {
  let intervalMultiplier = 1;
  let easeDelta = 0;

  if (card.unknownCount > card.knownCount) {
    intervalMultiplier *= 0.7;
    easeDelta -= 0.05;
  }

  const quizTotal = card.quizCorrectCount + card.quizWrongCount;
  if (quizTotal >= 3) {
    const accuracy = card.quizCorrectCount / quizTotal;
    if (accuracy < 0.6) {
      intervalMultiplier *= 0.75;
      easeDelta -= 0.05;
    }
  }

  if (card.videoId && card.example.trim()) {
    const score = getBestScoreForPhrase(
      card.videoId,
      card.sentenceId,
      card.example
    );
    if (score !== null && score < 60) {
      intervalMultiplier *= 0.8;
      easeDelta -= 0.05;
    }
  }

  return {
    intervalMultiplier: Math.max(0.5, intervalMultiplier),
    easeDelta,
  };
}

export function getDueFlashcards(
  cards: Flashcard[],
  now = new Date()
): Flashcard[] {
  return sortReviewQueue(cards.filter((card) => isCardDue(card, now)));
}

export function sortReviewQueue(cards: Flashcard[]): Flashcard[] {
  return [...cards].sort((a, b) => {
    const weakDiff = getWeaknessScore(b) - getWeaknessScore(a);
    if (weakDiff !== 0) return weakDiff;

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

function clampInterval(days: number): number {
  return Math.min(120, Math.max(1, Math.round(days)));
}

export function applySmartReview(
  card: Flashcard,
  rating: ReviewRating,
  modifiers: ReviewModifiers = getReviewModifiers(card)
): FlashcardReviewResult {
  const mult = modifiers.intervalMultiplier;
  let ease = Math.max(MIN_EASE, card.ease + modifiers.easeDelta);
  let repetitions = card.repetitions;
  let intervalDays = card.interval;
  let nextReview: number;

  if (rating === 'again') {
    return {
      card: {
        ...card,
        repetitions: 0,
        interval: 1,
        ease: Math.max(MIN_EASE, ease - 0.2),
        unknownCount: card.unknownCount + 1,
        lastReviewedAt: Date.now(),
        nextReview: Date.now() + AGAIN_DELAY_MS,
      },
      known: false,
      intervalDays: 0,
      rating,
    };
  }

  if (rating === 'hard') {
    ease = Math.max(MIN_EASE, ease - 0.15);
    repetitions = Math.max(1, repetitions);
    intervalDays =
      repetitions <= 1
        ? 1
        : clampInterval(Math.max(1, card.interval * 1.2 * mult));
    nextReview = addDays(intervalDays);
  } else if (rating === 'good') {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = clampInterval(3 * mult);
    } else {
      intervalDays = clampInterval(Math.max(card.interval, 1) * ease * mult);
    }
    nextReview = addDays(intervalDays);
  } else {
    ease = ease + 0.15;
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = clampInterval(3 * mult);
    } else {
      intervalDays = clampInterval(
        Math.max(card.interval, 1) * ease * 1.3 * mult
      );
    }
    nextReview = addDays(intervalDays);
  }

  return {
    card: {
      ...card,
      repetitions,
      interval: intervalDays,
      ease,
      knownCount: card.knownCount + 1,
      lastReviewedAt: Date.now(),
      nextReview,
    },
    known: true,
    intervalDays,
    rating,
  };
}

/** @deprecated Use applySmartReview with rating 'good' */
export function applyKnownReview(card: Flashcard): FlashcardReviewResult {
  return applySmartReview(card, 'good');
}

/** @deprecated Use applySmartReview with rating 'again' */
export function applyUnknownReview(card: Flashcard): FlashcardReviewResult {
  return applySmartReview(card, 'again');
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
