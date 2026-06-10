import type { Deck } from './decks';
import { getDecks, restoreDecks } from './decks';
import type { DailyStudyEntry } from './dailyStudyLog';
import { getDailyStudyLog, restoreDailyStudyLog } from './dailyStudyLog';
import { downloadTextFile } from './csvUtils';
import { notifyFlashcardsChanged } from './dataRefresh';
import type { QuizAttempt } from './flashcardQuiz';
import { getQuizAttempts, restoreQuizAttempts } from './flashcardQuiz';
import {
  getFlashcards,
  restoreFlashcards,
  type Flashcard,
} from './flashcards';

export const BACKUP_VERSION = 1;

export interface FlashcardBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: number;
  cards: Flashcard[];
  decks: Deck[];
  dailyStudyLog: DailyStudyEntry[];
  quizAttempts: QuizAttempt[];
}

export function createBackup(): FlashcardBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    cards: getFlashcards(),
    decks: getDecks(),
    dailyStudyLog: getDailyStudyLog(),
    quizAttempts: getQuizAttempts(),
  };
}

export function serializeBackup(backup: FlashcardBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function downloadBackup(): void {
  const backup = createBackup();
  const json = serializeBackup(backup);
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(json, `yoytube-backup-${date}.json`, 'application/json');
}

export function parseBackupJson(text: string): FlashcardBackup {
  const parsed = JSON.parse(text) as Partial<FlashcardBackup>;

  if (!parsed || parsed.version !== BACKUP_VERSION) {
    throw new Error('Unsupported backup version');
  }

  if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.decks)) {
    throw new Error('Invalid backup format');
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: parsed.exportedAt ?? Date.now(),
    cards: parsed.cards,
    decks: parsed.decks,
    dailyStudyLog: Array.isArray(parsed.dailyStudyLog)
      ? parsed.dailyStudyLog
      : [],
    quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
  };
}

export function restoreBackup(backup: FlashcardBackup): void {
  restoreDecks(backup.decks);
  restoreFlashcards(backup.cards);
  restoreDailyStudyLog(backup.dailyStudyLog);
  restoreQuizAttempts(backup.quizAttempts);
  notifyFlashcardsChanged();
}

export function importBackupFromText(text: string): FlashcardBackup {
  const backup = parseBackupJson(text);
  restoreBackup(backup);
  return backup;
}
