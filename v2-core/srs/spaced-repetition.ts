export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const MAX_INTERVAL_DAYS = 120;
export const AGAIN_DELAY_MS = 10 * 60 * 1000;

/** User-facing review levels from TASK-BE-023 */
export type ReviewLevel = 'easy' | 'medium' | 'hard';

/** Includes `again` for failed recall (Smart Review UI parity) */
export type ReviewRating = ReviewLevel | 'again';

export interface SrsReviewState {
  repetitions: number;
  ease: number;
  interval: number;
  nextReview?: number;
}

export interface ReviewModifiers {
  intervalMultiplier: number;
  easeDelta: number;
}

export interface SrsReviewOutcome {
  repetitions: number;
  ease: number;
  intervalDays: number;
  nextReview: number;
  rating: ReviewRating;
  successful: boolean;
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

export function getDefaultNextReview(from = new Date()): number {
  return startOfDay(from);
}

export function normalizeReviewRating(value: string): ReviewRating | null {
  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'easy' ||
    normalized === 'medium' ||
    normalized === 'hard' ||
    normalized === 'again'
  ) {
    return normalized;
  }

  // Legacy / UI aliases
  if (normalized === 'good') return 'medium';

  return null;
}

export function isReviewDue(
  nextReview: number | undefined,
  now = Date.now()
): boolean {
  if (nextReview === undefined) return true;
  return now >= nextReview;
}

function clampInterval(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(days)));
}

function defaultModifiers(): ReviewModifiers {
  return { intervalMultiplier: 1, easeDelta: 0 };
}

/**
 * SM-2-inspired scheduler with Easy / Medium / Hard levels.
 * `medium` matches the existing UI "Good" rating.
 */
export function applySpacedRepetition(
  state: SrsReviewState,
  rating: ReviewRating,
  modifiers: ReviewModifiers = defaultModifiers(),
  reviewedAt = Date.now()
): SrsReviewOutcome {
  const mult = Math.max(0.5, modifiers.intervalMultiplier);
  let ease = Math.max(MIN_EASE, state.ease + modifiers.easeDelta);
  let repetitions = state.repetitions;
  let intervalDays = state.interval;
  let nextReview: number;

  if (rating === 'again') {
    return {
      repetitions: 0,
      ease: Math.max(MIN_EASE, ease - 0.2),
      intervalDays: 0,
      nextReview: reviewedAt + AGAIN_DELAY_MS,
      rating,
      successful: false,
    };
  }

  if (rating === 'hard') {
    ease = Math.max(MIN_EASE, ease - 0.15);
    repetitions = Math.max(1, repetitions);
    intervalDays =
      repetitions <= 1
        ? 1
        : clampInterval(Math.max(1, state.interval * 1.2 * mult));
    nextReview = addDays(intervalDays, new Date(reviewedAt));
  } else if (rating === 'medium') {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = clampInterval(3 * mult);
    } else {
      intervalDays = clampInterval(Math.max(state.interval, 1) * ease * mult);
    }
    nextReview = addDays(intervalDays, new Date(reviewedAt));
  } else {
    ease = ease + 0.15;
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = clampInterval(3 * mult);
    } else {
      intervalDays = clampInterval(
        Math.max(state.interval, 1) * ease * 1.3 * mult
      );
    }
    nextReview = addDays(intervalDays, new Date(reviewedAt));
  }

  return {
    repetitions,
    ease,
    intervalDays,
    nextReview,
    rating,
    successful: true,
  };
}

export function calculateNextReview(
  state: SrsReviewState,
  rating: ReviewRating,
  modifiers?: ReviewModifiers,
  reviewedAt?: number
): number {
  return applySpacedRepetition(state, rating, modifiers, reviewedAt).nextReview;
}
