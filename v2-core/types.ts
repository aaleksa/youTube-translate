export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  emailVerified?: boolean;
}

/** Canonical user record stored in the users table. */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface SignUpInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface ConfirmSignUpInput {
  email: string;
  code: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ConfirmForgotPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthenticatedContext {
  userId: string;
  email: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface FlashcardRecord {
  id: string;
  userId: string;
  word: string;
  translation: string;
  example?: string;
  tags?: string[];
  videoId?: string;
  deckIds?: string[];
  repetitions?: number;
  ease?: number;
  interval?: number;
  nextReview?: number;
  knownCount?: number;
  unknownCount?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface DeckRecord {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

export interface UserProgressRecord {
  userId: string;
  cardsTotal: number;
  cardsMastered: number;
  cardsDueToday: number;
  streakDays: number;
  lastStudiedAt?: number;
  updatedAt: number;
}

export interface VideoHistoryRecord {
  userId: string;
  videoId: string;
  title: string;
  url: string;
  channel: string;
  createdAt: number;
}

export interface RecordVideoHistoryInput {
  videoId: string;
  title: string;
  url: string;
  channel: string;
}

export interface PlaybackPositionRecord {
  userId: string;
  videoId: string;
  lastPosition: number;
  updatedAt: number;
}

export interface SavePlaybackPositionInput {
  videoId: string;
  lastPosition: number;
}
