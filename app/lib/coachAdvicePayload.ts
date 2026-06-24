import type { Flashcard } from './flashcards';
import {
  getQuizAccuracyPercent,
  getSrsSuccessRatePercent,
} from './learningAnalytics';
import { getStudyStreak, getTodayCardsReviewed } from './dailyStudyLog';
import { getDueFlashcards } from './flashcardSrs';
import { getWeakWords } from './learningAnalytics';
import type { LearningPlan } from './learningPlan';
import type { CoachAdviceRequest } from './coachAdviceTypes';
import { getSavedInterfaceLanguage, getSavedTaskLanguage } from './languageSettings';

export function buildCoachAdviceRequest(
  cards: Flashcard[],
  plan: LearningPlan
): CoachAdviceRequest {
  return {
    learningLevel: plan.learningLevel,
    streak: getStudyStreak(),
    quizAccuracyPercent: getQuizAccuracyPercent(cards),
    srsSuccessRatePercent: getSrsSuccessRatePercent(cards),
    weakWords: getWeakWords(cards, 8).map((card) => card.word),
    dueToday: getDueFlashcards(cards).length,
    cardsReviewedToday: getTodayCardsReviewed(),
    dailyCardGoal: plan.progress.review.target,
    vocabularySaved: plan.vocabularySaved,
    vocabularyGoal: plan.vocabularyGoal,
    taskLanguage: getSavedTaskLanguage(),
    interfaceLanguage: getSavedInterfaceLanguage(),
  };
}
