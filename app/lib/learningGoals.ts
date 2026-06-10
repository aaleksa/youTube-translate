const STORAGE_KEY = 'yoytube-learning-goals';
const DEFAULT_DAILY_GOAL = 30;

export interface LearningGoals {
  dailyCardGoal: number;
}

function defaultGoals(): LearningGoals {
  return { dailyCardGoal: DEFAULT_DAILY_GOAL };
}

export function getLearningGoals(): LearningGoals {
  if (typeof window === 'undefined') return defaultGoals();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGoals();

    const parsed = JSON.parse(raw) as Partial<LearningGoals>;
    const goal = Number(parsed.dailyCardGoal);
    return {
      dailyCardGoal:
        Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_DAILY_GOAL,
    };
  } catch {
    return defaultGoals();
  }
}

export function saveDailyCardGoal(goal: number): LearningGoals {
  const next = {
    dailyCardGoal:
      Number.isFinite(goal) && goal > 0 ? Math.round(goal) : DEFAULT_DAILY_GOAL,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
