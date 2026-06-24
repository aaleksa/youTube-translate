import { ApiError } from '../errors';
import type { UpsertDailyStudyLogInput } from '../types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(value: unknown): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value.trim())) {
    throw new ApiError('date must be YYYY-MM-DD', 400, 'INVALID_DAILY_STUDY_LOG');
  }
  return value.trim();
}

function validateCount(value: unknown, field: string): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || !Number.isInteger(numeric)) {
    throw new ApiError(
      `${field} must be a non-negative integer`,
      400,
      'INVALID_DAILY_STUDY_LOG'
    );
  }
  return numeric;
}

export function validateUpsertDailyStudyLogInput(
  input: UpsertDailyStudyLogInput
): UpsertDailyStudyLogInput {
  if (!input || typeof input !== 'object') {
    throw new ApiError('Request body is required', 400, 'INVALID_DAILY_STUDY_LOG');
  }

  const date = validateDate(input.date);
  const cardsReviewed = validateCount(input.cardsReviewed, 'cardsReviewed');
  const correctReviews =
    input.correctReviews === undefined
      ? undefined
      : validateCount(input.correctReviews, 'correctReviews');
  const incorrectReviews =
    input.incorrectReviews === undefined
      ? undefined
      : validateCount(input.incorrectReviews, 'incorrectReviews');

  if (cardsReviewed === 0) {
    throw new ApiError(
      'cardsReviewed must be greater than 0',
      400,
      'INVALID_DAILY_STUDY_LOG'
    );
  }

  return {
    date,
    cardsReviewed,
    ...(correctReviews !== undefined ? { correctReviews } : {}),
    ...(incorrectReviews !== undefined ? { incorrectReviews } : {}),
  };
}

export function mergeDailyStudyCounts(
  left: Pick<
    UpsertDailyStudyLogInput,
    'cardsReviewed' | 'correctReviews' | 'incorrectReviews'
  >,
  right: Pick<
    UpsertDailyStudyLogInput,
    'cardsReviewed' | 'correctReviews' | 'incorrectReviews'
  >
): Pick<
  UpsertDailyStudyLogInput,
  'cardsReviewed' | 'correctReviews' | 'incorrectReviews'
> {
  return {
    cardsReviewed: Math.max(left.cardsReviewed, right.cardsReviewed),
    correctReviews: Math.max(left.correctReviews ?? 0, right.correctReviews ?? 0),
    incorrectReviews: Math.max(
      left.incorrectReviews ?? 0,
      right.incorrectReviews ?? 0
    ),
  };
}
