import type { Deck } from './decks';
import type { Flashcard } from './flashcards';
import { getCardState, getVocabularyProgress, type CardState } from './flashcardSrs';
import { getStudyStreak, getTodayCardsReviewed } from './dailyStudyLog';
import { getLearningGoals } from './learningGoals';
import type { TranslationKey } from './i18n';

export const PHRASAL_VERB_TAG = 'phrasal verb';

export function isPhrasalVerbCard(card: Flashcard): boolean {
  return card.tags.some(
    (tag) => tag.trim().toLowerCase() === PHRASAL_VERB_TAG
  );
}

export function isCardStudied(card: Flashcard): boolean {
  return (
    card.repetitions > 0 ||
    card.knownCount > 0 ||
    card.unknownCount > 0 ||
    Boolean(card.lastReviewedAt)
  );
}

export function isCardMastered(card: Flashcard): boolean {
  return getCardState(card) === 'mastered';
}

export interface LearningOverview {
  wordsSaved: number;
  phrasalVerbsSaved: number;
  cardsStudied: number;
  masteredWords: number;
  quizCorrect: number;
  quizWrong: number;
  quizAccuracyPercent: number | null;
  stateDistribution: Record<CardState, number>;
}

export function getQuizAccuracyPercent(cards: Flashcard[]): number | null {
  let correct = 0;
  let wrong = 0;

  for (const card of cards) {
    correct += card.quizCorrectCount;
    wrong += card.quizWrongCount;
  }

  const total = correct + wrong;
  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}

export function getLearningOverview(cards: Flashcard[]): LearningOverview {
  const progress = getVocabularyProgress(cards);
  let phrasalVerbsSaved = 0;
  let cardsStudied = 0;
  let masteredWords = 0;
  let quizCorrect = 0;
  let quizWrong = 0;

  for (const card of cards) {
    if (isPhrasalVerbCard(card)) phrasalVerbsSaved += 1;
    if (isCardStudied(card)) cardsStudied += 1;
    if (isCardMastered(card)) masteredWords += 1;
    quizCorrect += card.quizCorrectCount;
    quizWrong += card.quizWrongCount;
  }

  return {
    wordsSaved: cards.length,
    phrasalVerbsSaved,
    cardsStudied,
    masteredWords,
    quizCorrect,
    quizWrong,
    quizAccuracyPercent: getQuizAccuracyPercent(cards),
    stateDistribution: {
      new: progress.new,
      learning: progress.learning,
      review: progress.review,
      mastered: progress.mastered,
    },
  };
}

export interface PhrasalVerbProgress {
  saved: number;
  mastered: number;
}

export function getPhrasalVerbProgress(cards: Flashcard[]): PhrasalVerbProgress {
  const phrasalCards = cards.filter(isPhrasalVerbCard);
  return {
    saved: phrasalCards.length,
    mastered: phrasalCards.filter(isCardMastered).length,
  };
}

export interface VideoProgress {
  videoId: string;
  title: string;
  totalWords: number;
  studiedWords: number;
  masteredWords: number;
}

export function getVideoProgressList(
  cards: Flashcard[],
  titleByVideoId: Record<string, string>
): VideoProgress[] {
  const byVideo = new Map<string, Flashcard[]>();

  for (const card of cards) {
    if (!card.videoId) continue;
    const group = byVideo.get(card.videoId) ?? [];
    group.push(card);
    byVideo.set(card.videoId, group);
  }

  return [...byVideo.entries()]
    .map(([videoId, group]) => ({
      videoId,
      title: titleByVideoId[videoId] ?? videoId,
      totalWords: group.length,
      studiedWords: group.filter(isCardStudied).length,
      masteredWords: group.filter(isCardMastered).length,
    }))
    .sort((a, b) => b.totalWords - a.totalWords);
}

export interface DeckProgress {
  deckId: string;
  name: string;
  totalWords: number;
  studiedWords: number;
  masteredWords: number;
}

export function getDeckProgressList(
  cards: Flashcard[],
  decks: Deck[]
): DeckProgress[] {
  return decks
    .map((deck) => {
      const group = cards.filter((card) => card.deckIds.includes(deck.id));
      return {
        deckId: deck.id,
        name: deck.name,
        totalWords: group.length,
        studiedWords: group.filter(isCardStudied).length,
        masteredWords: group.filter(isCardMastered).length,
      };
    })
    .filter((item) => item.totalWords > 0)
    .sort((a, b) => b.totalWords - a.totalWords);
}

export function getWeakWords(cards: Flashcard[], limit = 12): Flashcard[] {
  return cards
    .filter(
      (card) =>
        card.unknownCount > card.knownCount &&
        card.unknownCount + card.knownCount > 0
    )
    .sort((a, b) => {
      const aGap = a.unknownCount - a.knownCount;
      const bGap = b.unknownCount - b.knownCount;
      if (bGap !== aGap) return bGap - aGap;
      return b.unknownCount - a.unknownCount;
    })
    .slice(0, limit);
}

export interface AchievementDefinition {
  id: string;
  icon: string;
  titleKey: TranslationKey;
  unlocked: boolean;
}

export function getAchievements(cards: Flashcard[]): AchievementDefinition[] {
  const overview = getLearningOverview(cards);
  const phrasal = getPhrasalVerbProgress(cards);
  const streak = getStudyStreak();

  return [
    {
      id: 'first-100-words',
      icon: '🏆',
      titleKey: 'analytics.achievement.first100',
      unlocked: overview.wordsSaved >= 100,
    },
    {
      id: 'first-mastered',
      icon: '⭐',
      titleKey: 'analytics.achievement.firstMastered',
      unlocked: overview.masteredWords >= 1,
    },
    {
      id: 'streak-30',
      icon: '🔥',
      titleKey: 'analytics.achievement.streak30',
      unlocked: streak >= 30,
    },
    {
      id: 'phrasal-50-mastered',
      icon: '🎯',
      titleKey: 'analytics.achievement.phrasal50',
      unlocked: phrasal.mastered >= 50,
    },
    {
      id: 'quiz-80',
      icon: '✅',
      titleKey: 'analytics.achievement.quiz80',
      unlocked:
        overview.quizAccuracyPercent !== null &&
        overview.quizAccuracyPercent >= 80 &&
        overview.quizCorrect + overview.quizWrong >= 20,
    },
  ];
}

export interface DailyGoalProgress {
  reviewedToday: number;
  goal: number;
  streak: number;
}

export function getDailyGoalProgress(): DailyGoalProgress {
  const { dailyCardGoal } = getLearningGoals();
  return {
    reviewedToday: getTodayCardsReviewed(),
    goal: dailyCardGoal,
    streak: getStudyStreak(),
  };
}

export function stateBarPercent(
  count: number,
  total: number
): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}
