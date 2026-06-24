import { userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-learning-goals';
const DEFAULT_DAILY_GOAL = 30;
const DEFAULT_VOCABULARY_GOAL = 1000;

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningGoals {
  dailyCardGoal: number;
  vocabularyGoal: number;
  learningLevel: LearningLevel;
}

function defaultGoals(): LearningGoals {
  return {
    dailyCardGoal: DEFAULT_DAILY_GOAL,
    vocabularyGoal: DEFAULT_VOCABULARY_GOAL,
    learningLevel: 'intermediate',
  };
}

const LEVELS = new Set<LearningLevel>(['beginner', 'intermediate', 'advanced']);

function learningGoalsStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

export function getLearningGoals(): LearningGoals {
  if (typeof window === 'undefined') return defaultGoals();

  try {
    const raw = localStorage.getItem(learningGoalsStorageKey());
    if (!raw) return defaultGoals();

    const parsed = JSON.parse(raw) as Partial<LearningGoals>;
    const goal = Number(parsed.dailyCardGoal);
    const vocabularyGoal = Number(parsed.vocabularyGoal);
    const level = parsed.learningLevel;
    return {
      dailyCardGoal:
        Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_DAILY_GOAL,
      vocabularyGoal:
        Number.isFinite(vocabularyGoal) && vocabularyGoal > 0
          ? Math.round(vocabularyGoal)
          : DEFAULT_VOCABULARY_GOAL,
      learningLevel:
        level && LEVELS.has(level) ? level : defaultGoals().learningLevel,
    };
  } catch {
    return defaultGoals();
  }
}

function saveGoals(goals: LearningGoals): LearningGoals {
  localStorage.setItem(learningGoalsStorageKey(), JSON.stringify(goals));
  return goals;
}

export function saveDailyCardGoal(goal: number): LearningGoals {
  const current = getLearningGoals();
  return saveGoals({
    ...current,
    dailyCardGoal:
      Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_DAILY_GOAL,
  });
}

export function saveVocabularyGoal(goal: number): LearningGoals {
  const current = getLearningGoals();
  return saveGoals({
    ...current,
    vocabularyGoal:
      Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_VOCABULARY_GOAL,
  });
}

export function saveLearningLevel(level: LearningLevel): LearningGoals {
  const current = getLearningGoals();
  return saveGoals({
    ...current,
    learningLevel: LEVELS.has(level) ? level : current.learningLevel,
  });
}

export function getLevelTargets(level: LearningLevel): {
  review: number;
  newWords: number;
  shadowing: number;
  quiz: number;
} {
  switch (level) {
    case 'beginner':
      return { review: 5, newWords: 2, shadowing: 2, quiz: 5 };
    case 'advanced':
      return { review: 30, newWords: 10, shadowing: 5, quiz: 15 };
    default:
      return { review: 15, newWords: 5, shadowing: 3, quiz: 10 };
  }
}
