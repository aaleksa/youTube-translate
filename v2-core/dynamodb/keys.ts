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
