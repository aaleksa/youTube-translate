import type { Deck } from './decks';
import { getDueFlashcards, type Flashcard } from './flashcards';
import { getQuizAttempts } from './flashcardQuiz';
import {
  getLevelTargets,
  getLearningGoals,
  type LearningLevel,
} from './learningGoals';
import {
  getPhrasalVerbProgress,
  getVideoProgressList,
  getWeakWords,
  isCardMastered,
  isPhrasalVerbCard,
} from './learningAnalytics';
import { getTodayStudyEntry } from './dailyStudyLog';
import { getPronunciationAttempts } from './pronunciationAttempts';
import type { TranslationKey } from './i18n';
import { getTranscriptHistory } from './transcriptHistory';

export interface ShadowingPlanSentence {
  text: string;
  videoId?: string;
  videoTitle?: string;
}

export interface RecommendedVideo {
  videoId: string;
  title: string;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
}

export interface VideoReviewSummary {
  videoId: string;
  title: string;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
}

export interface DailyPlanItem {
  id: string;
  icon: string;
  messageKey: TranslationKey;
  params: Record<string, string | number>;
  emphasis?: 'high' | 'normal';
}

export interface WeeklyPlanTask {
  icon: string;
  messageKey: TranslationKey;
  params?: Record<string, string | number>;
}

export interface WeeklyPlanDay {
  dayKey: TranslationKey;
  tasks: WeeklyPlanTask[];
}

export interface CoachSuggestion {
  id: string;
  icon: string;
  messageKey: TranslationKey;
  params?: Record<string, string | number>;
}

export interface PlanProgressBuckets {
  review: { current: number; target: number };
  quiz: { current: number; target: number };
  shadowing: { current: number; target: number };
  newWords: { current: number; target: number };
}

export interface LearningPlan {
  date: string;
  dueCardIds: string[];
  weakWordIds: string[];
  weakWords: Array<{ id: string; word: string }>;
  recommendedVideoIds: string[];
  shadowingSentences: ShadowingPlanSentence[];
  newCardsGoal: number;
  reviewGoal: number;
  dailyItems: DailyPlanItem[];
  weeklyDays: WeeklyPlanDay[];
  recommendedVideos: RecommendedVideo[];
  videoReview?: VideoReviewSummary;
  suggestions: CoachSuggestion[];
  advice: Array<{
    messageKey: TranslationKey;
    params?: Record<string, string | number>;
  }>;
  progress: PlanProgressBuckets;
  vocabularyGoal: number;
  vocabularySaved: number;
  learningLevel: LearningLevel;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isToday(timestamp: number): boolean {
  return new Date(timestamp).toISOString().slice(0, 10) === todayIso();
}

function buildTitleMap(
  cards: Flashcard[],
  activeVideoId?: string,
  activeVideoTitle?: string
): Record<string, string> {
  const map: Record<string, string> = {};
  if (activeVideoId && activeVideoTitle) {
    map[activeVideoId] = activeVideoTitle;
  }
  for (const entry of getTranscriptHistory()) {
    map[entry.videoId] = entry.title;
  }
  for (const card of cards) {
    if (card.videoId && card.videoTitle) {
      map[card.videoId] = card.videoTitle;
    }
  }
  return map;
}

function getRecommendedVideos(
  cards: Flashcard[],
  titleByVideoId: Record<string, string>,
  activeVideoId?: string
): RecommendedVideo[] {
  return getVideoProgressList(cards, titleByVideoId)
    .map((item) => ({
      videoId: item.videoId,
      title: item.title,
      totalWords: item.totalWords,
      masteredWords: item.masteredWords,
      learningWords: item.totalWords - item.masteredWords,
    }))
    .filter((item) => item.learningWords > 0 && item.videoId !== activeVideoId)
    .sort((a, b) => b.learningWords - a.learningWords)
    .slice(0, 3);
}

function getShadowingSentences(
  cards: Flashcard[],
  weakWords: Flashcard[],
  limit: number
): ShadowingPlanSentence[] {
  const pool = [...weakWords, ...cards.filter((card) => card.example.trim())];
  const seen = new Set<string>();
  const result: ShadowingPlanSentence[] = [];

  for (const card of pool) {
    const text = card.example.trim();
    if (!text || text.length < 12) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      text,
      videoId: card.videoId,
      videoTitle: card.videoTitle,
    });
    if (result.length >= limit) break;
  }

  return result;
}

function getWeeklyPlan(level: LearningLevel): WeeklyPlanDay[] {
  const targets = getLevelTargets(level);

  return [
    {
      dayKey: 'coach.week.monday',
      tasks: [
        { icon: '🔁', messageKey: 'coach.week.reviews', params: { count: targets.review } },
        { icon: '✨', messageKey: 'coach.week.newWords', params: { count: targets.newWords } },
      ],
    },
    {
      dayKey: 'coach.week.tuesday',
      tasks: [
        { icon: '🔁', messageKey: 'coach.week.reviews', params: { count: targets.review } },
        { icon: '🎥', messageKey: 'coach.week.video' },
      ],
    },
    {
      dayKey: 'coach.week.wednesday',
      tasks: [{ icon: '❓', messageKey: 'coach.week.quiz' }],
    },
    {
      dayKey: 'coach.week.thursday',
      tasks: [
        {
          icon: '🎤',
          messageKey: 'coach.week.shadowing',
          params: { count: targets.shadowing },
        },
      ],
    },
    {
      dayKey: 'coach.week.friday',
      tasks: [{ icon: '🧠', messageKey: 'coach.week.phrasal' }],
    },
    {
      dayKey: 'coach.week.weekend',
      tasks: [{ icon: '💪', messageKey: 'coach.week.weakWords' }],
    },
  ];
}

function getSmartSuggestions(
  cards: Flashcard[],
  decks: Deck[],
  dueCards: Flashcard[],
  weakWords: Flashcard[]
): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  const phrasal = getPhrasalVerbProgress(cards);
  const weakPhrasal = weakWords.filter(isPhrasalVerbCard).length;
  const phrasalDue = dueCards.filter(isPhrasalVerbCard).length;

  if (weakPhrasal >= 3) {
    suggestions.push({
      id: 'phrasal-struggle',
      icon: '🧠',
      messageKey: 'coach.suggest.phrasalStruggle',
      params: { count: weakPhrasal },
    });
  }

  if (phrasal.saved > 0 && phrasalDue > 0) {
    suggestions.push({
      id: 'phrasal-due',
      icon: '📚',
      messageKey: 'coach.suggest.phrasalDue',
      params: { count: phrasalDue },
    });
  }

  const phrasalDeck = decks.find((deck) =>
    /phrasal/i.test(deck.name)
  );
  if (phrasalDeck) {
    const deckDue = dueCards.filter((card) =>
      card.deckIds.includes(phrasalDeck.id)
    ).length;
    if (deckDue > 0) {
      suggestions.push({
        id: 'phrasal-deck',
        icon: '📚',
        messageKey: 'coach.suggest.phrasalDeck',
        params: { name: phrasalDeck.name, count: deckDue },
      });
    }
  }

  if (weakWords.length >= 5) {
    suggestions.push({
      id: 'weak-focus',
      icon: '💪',
      messageKey: 'coach.suggest.weakFocus',
      params: { count: Math.min(5, weakWords.length) },
    });
  }

  return suggestions.slice(0, 3);
}

function getCoachAdvice(
  cards: Flashcard[],
  weakWords: Flashcard[],
  recommendedVideos: RecommendedVideo[]
): LearningPlan['advice'] {
  const advice: LearningPlan['advice'] = [];
  const phrasalWeak = weakWords.filter(isPhrasalVerbCard).length;

  if (cards.length === 0) {
    advice.push({ messageKey: 'coach.advice.startSaving' });
    return advice;
  }

  if (phrasalWeak >= 2) {
    advice.push({
      messageKey: 'coach.advice.phrasalFocus',
      params: { count: phrasalWeak },
    });
  }

  if (recommendedVideos.length > 0) {
    advice.push({
      messageKey: 'coach.advice.videoNext',
      params: { title: recommendedVideos[0].title },
    });
  }

  const masteredRatio =
    cards.length > 0
      ? Math.round(
          (cards.filter((card) => card.repetitions >= 7).length / cards.length) *
            100
        )
      : 0;

  if (masteredRatio >= 40) {
    advice.push({
      messageKey: 'coach.advice.goodProgress',
      params: { percent: masteredRatio },
    });
  } else if (weakWords.length >= 3) {
    advice.push({
      messageKey: 'coach.advice.reviewWeak',
      params: { count: weakWords.length },
    });
  }

  return advice.slice(0, 2);
}

export function generateLearningPlan(options: {
  cards: Flashcard[];
  decks: Deck[];
  activeVideoId?: string;
  activeVideoTitle?: string;
}): LearningPlan {
  const { cards, decks, activeVideoId, activeVideoTitle } = options;
  const goals = getLearningGoals();
  const targets = getLevelTargets(goals.learningLevel);
  const titleByVideoId = buildTitleMap(cards, activeVideoId, activeVideoTitle);

  const dueCards = getDueFlashcards(cards);
  const weakWords = getWeakWords(cards, 8);
  const recommendedVideos = getRecommendedVideos(
    cards,
    titleByVideoId,
    activeVideoId
  );
  const shadowingSentences = getShadowingSentences(
    cards,
    weakWords,
    targets.shadowing
  );

  const phrasalWeak = weakWords.filter(isPhrasalVerbCard);
  const dailyItems: DailyPlanItem[] = [];

  if (dueCards.length > 0) {
    dailyItems.push({
      id: 'review-due',
      icon: '🔥',
      messageKey: 'coach.plan.reviewDue',
      params: { count: dueCards.length },
      emphasis: 'high',
    });
  }

  if (activeVideoId && titleByVideoId[activeVideoId]) {
    const videoCards = cards.filter((card) => card.videoId === activeVideoId);
    const learning = videoCards.filter((card) => !isCardMastered(card)).length;
    if (videoCards.length > 0 && learning > 0) {
      dailyItems.push({
        id: 'rewatch-active',
        icon: '🎥',
        messageKey: 'coach.plan.rewatchVideo',
        params: { title: titleByVideoId[activeVideoId] },
      });
    }
  }

  if (weakWords.length > 0) {
    dailyItems.push({
      id: 'weak-words',
      icon: '📚',
      messageKey: 'coach.plan.practiceWeak',
      params: { count: Math.min(5, weakWords.length) },
      emphasis: weakWords.length >= 3 ? 'high' : 'normal',
    });
  }

  if (shadowingSentences.length > 0) {
    dailyItems.push({
      id: 'shadowing',
      icon: '🎤',
      messageKey: 'coach.plan.shadowing',
      params: {
        count: shadowingSentences.length,
        minutes: Math.max(3, shadowingSentences.length * 2),
      },
    });
  }

  if (phrasalWeak.length > 0 || getPhrasalVerbProgress(cards).saved < 5) {
    dailyItems.push({
      id: 'phrasal',
      icon: '🧠',
      messageKey: 'coach.plan.learnPhrasal',
      params: { count: Math.max(3, Math.min(5, phrasalWeak.length || 5)) },
    });
  }

  if (dueCards.length >= 5 || weakWords.length >= 3) {
    dailyItems.push({
      id: 'quiz',
      icon: '❓',
      messageKey: 'coach.plan.quiz',
      params: { count: Math.min(10, Math.max(5, weakWords.length)) },
    });
  }

  const todayEntry = getTodayStudyEntry();
  const quizToday = getQuizAttempts().filter((attempt) =>
    isToday(attempt.createdAt)
  ).length;
  const shadowingToday = getPronunciationAttempts().filter((attempt) =>
    isToday(attempt.createdAt)
  ).length;

  let videoReview: VideoReviewSummary | undefined;
  if (activeVideoId) {
    const videoCards = cards.filter((card) => card.videoId === activeVideoId);
    if (videoCards.length > 0) {
      const masteredWords = videoCards.filter((card) => card.repetitions >= 7).length;
      const learningWords = videoCards.length - masteredWords;
      videoReview = {
        videoId: activeVideoId,
        title: titleByVideoId[activeVideoId] ?? activeVideoTitle ?? activeVideoId,
        totalWords: videoCards.length,
        masteredWords,
        learningWords,
      };
    }
  }

  return {
    date: todayIso(),
    dueCardIds: dueCards.map((card) => card.id),
    weakWordIds: weakWords.map((card) => card.id),
    weakWords: weakWords.slice(0, 5).map((card) => ({
      id: card.id,
      word: card.word,
    })),
    recommendedVideoIds: recommendedVideos.map((video) => video.videoId),
    shadowingSentences,
    newCardsGoal: targets.newWords,
    reviewGoal: Math.min(targets.review, Math.max(dueCards.length, targets.review)),
    dailyItems,
    weeklyDays: getWeeklyPlan(goals.learningLevel),
    recommendedVideos,
    videoReview:
      videoReview && videoReview.learningWords > 0 ? videoReview : undefined,
    suggestions: getSmartSuggestions(cards, decks, dueCards, weakWords),
    advice: getCoachAdvice(cards, weakWords, recommendedVideos),
    progress: {
      review: {
        current: todayEntry.cardsReviewed,
        target: Math.max(dueCards.length, targets.review),
      },
      quiz: { current: quizToday, target: targets.quiz },
      shadowing: { current: shadowingToday, target: targets.shadowing },
      newWords: { current: 0, target: targets.newWords },
    },
    vocabularyGoal: goals.vocabularyGoal,
    vocabularySaved: cards.length,
    learningLevel: goals.learningLevel,
  };
}

export function progressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
