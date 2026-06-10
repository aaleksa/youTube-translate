const OPEN_KEY = 'yoytube-learning-hub-open';
const TAB_KEY = 'yoytube-learning-hub-tab';

export type LearningHubTab = 'coach' | 'flashcards' | 'analytics';

export function getLearningHubOpen(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem(OPEN_KEY);
    if (raw === null) return false;
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveLearningHubOpen(open: boolean): void {
  localStorage.setItem(OPEN_KEY, String(open));
}

export function getLearningHubTab(): LearningHubTab {
  if (typeof window === 'undefined') return 'flashcards';

  try {
    const raw = localStorage.getItem(TAB_KEY);
    if (raw === 'analytics') return 'analytics';
    if (raw === 'coach') return 'coach';
    return 'flashcards';
  } catch {
    return 'flashcards';
  }
}

export function saveLearningHubTab(tab: LearningHubTab): void {
  localStorage.setItem(TAB_KEY, tab);
}
