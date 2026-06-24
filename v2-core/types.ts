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

/** Canonical flashcard row (TASK-BE-006). */
export interface Flashcard {
  id: string;
  userId: string;
  word: string;
  translation: string;
  example: string;
  videoId: string | null;
  createdAt: number;
}

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

export interface CreateFlashcardInput {
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
}

export interface FlashcardListParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedFlashcards {
  items: FlashcardRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DeckRecord {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateDeckInput {
  name: string;
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

export interface BookmarkRecord {
  id: string;
  userId: string;
  videoId: string;
  timestamp: number;
  note: string;
  createdAt: number;
}

export interface CreateBookmarkInput {
  videoId: string;
  timestamp: number;
  note?: string;
}

export interface QuizResultRecord {
  id: string;
  userId: string;
  videoId: string;
  score: number;
  totalQuestions: number;
  createdAt: number;
}

export interface CreateQuizResultInput {
  videoId: string;
  score: number;
  totalQuestions: number;
}

export interface VocabularyProgressRecord {
  id: string;
  userId: string;
  word: string;
  reviewCount: number;
  mastered: boolean;
  lastReviewDate: number | null;
}

export interface UpsertVocabularyProgressInput {
  word: string;
  reviewCount: number;
  mastered: boolean;
  lastReviewDate?: number | null;
}

export interface SentenceExplanationRecord {
  id: string;
  userId: string;
  sentence: string;
  explanation: string;
  translation: string;
  createdAt: number;
}

export interface CreateSentenceExplanationInput {
  sentence: string;
  explanation: string;
  translation: string;
}

export interface SelectionAnalysisRecord {
  id: string;
  userId: string;
  selectedText: string;
  analysis: string;
  createdAt: number;
}

export interface CreateSelectionAnalysisInput {
  selectedText: string;
  analysis: string;
}

export type UserSettingsAutoPause = Record<
  'explainSentence' | 'translateSelection' | 'grammarAnalysis' | 'quiz',
  boolean
>;

export interface UserSettingsRecord {
  userId: string;
  interfaceLanguage: string;
  translationLanguage: string;
  theme: string;
  autoPause: UserSettingsAutoPause;
  bilingualMode: boolean;
  dailyCardGoal: number;
  vocabularyGoal: number;
  learningLevel: LearningLevel;
}

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UpdateUserSettingsInput {
  interfaceLanguage?: string;
  translationLanguage?: string;
  theme?: string;
  autoPause?: Partial<UserSettingsAutoPause>;
  bilingualMode?: boolean;
  dailyCardGoal?: number;
  vocabularyGoal?: number;
  learningLevel?: LearningLevel;
}

export interface TodayReviewsResponse {
  date: number;
  total: number;
  items: FlashcardRecord[];
}

export type SubscriptionPlan = 'free' | 'premium' | 'trial';

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'expired'
  | 'trialing';

export interface UserSubscriptionRecord {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: number | null;
  endDate: number | null;
}

export interface AiUsageInfo {
  limit: number | null;
  used: number;
  remaining: number | null;
  periodKey: string;
}

export interface PremiumAccessInfo {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  subscription: UserSubscriptionRecord;
  aiUsage: AiUsageInfo;
}
