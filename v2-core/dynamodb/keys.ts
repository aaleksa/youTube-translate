export const ENTITY = {
  USER: 'USER',
  CARD: 'CARD',
  DECK: 'DECK',
  PROFILE: 'PROFILE',
  PROGRESS: 'PROGRESS',
  REVIEW: 'REVIEW',
  VIDEO: 'VIDEO',
  PLAYBACK: 'PLAYBACK',
  BOOKMARK: 'BOOKMARK',
  QUIZ_RESULT: 'QUIZ_RESULT',
  VOCAB_PROGRESS: 'VOCAB_PROGRESS',
  EXPLAIN_SENTENCE: 'EXPLAIN_SENTENCE',
  SELECTION_ANALYSIS: 'SELECTION_ANALYSIS',
} as const;

export function userPk(userId: string): string {
  return `${ENTITY.USER}#${userId}`;
}

export function cardSk(cardId: string): string {
  return `${ENTITY.CARD}#${cardId}`;
}

export function deckSk(deckId: string): string {
  return `${ENTITY.DECK}#${deckId}`;
}

export function profileSk(): string {
  return ENTITY.PROFILE;
}

export function progressSk(): string {
  return ENTITY.PROGRESS;
}

export function reviewSk(reviewId: string): string {
  return `${ENTITY.REVIEW}#${reviewId}`;
}

export function videoHistorySk(videoId: string): string {
  return `${ENTITY.VIDEO}#${videoId}`;
}

export function playbackPositionSk(videoId: string): string {
  return `${ENTITY.PLAYBACK}#${videoId}`;
}

export function bookmarkSk(bookmarkId: string): string {
  return `${ENTITY.BOOKMARK}#${bookmarkId}`;
}

export function quizResultSk(resultId: string): string {
  return `${ENTITY.QUIZ_RESULT}#${resultId}`;
}

export function vocabularyProgressSk(progressId: string): string {
  return `${ENTITY.VOCAB_PROGRESS}#${progressId}`;
}

export function explainSentenceSk(recordId: string): string {
  return `${ENTITY.EXPLAIN_SENTENCE}#${recordId}`;
}

export function selectionAnalysisSk(recordId: string): string {
  return `${ENTITY.SELECTION_ANALYSIS}#${recordId}`;
}
