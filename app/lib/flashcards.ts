import {
  applyKnownReview,
  applyUnknownReview,
  getDefaultNextReview,
  type FlashcardReviewResult,
} from './flashcardSrs';
import { parseTimestampToSeconds } from './timestamp';

const STORAGE_KEY = 'yoytube-flashcards';

const DEFAULT_EASE = 2.5;

export type { CardState, FlashcardReviewResult } from './flashcardSrs';
export {
  countDueOnDay,
  getCardState,
  getDueFlashcards,
  getVocabularyProgress,
  SRS_INTERVALS_DAYS,
} from './flashcardSrs';

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  example: string;
  videoId: string;
  videoUrl: string;
  timestamp?: number;
  createdAt: number;
  knownCount: number;
  unknownCount: number;
  lastReviewedAt?: number;
  /** SRS foundation — not used until TASK-027 */
  repetitions: number;
  ease: number;
  interval: number;
  nextReview?: number;
}

export interface StudySessionSummary {
  total: number;
  known: number;
  unknown: number;
  dueTomorrow: number;
}

export interface FlashcardDraft {
  word: string;
  translation: string;
  example: string;
  videoId: string;
  videoUrl: string;
  timestamp?: number;
}

export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function normalizeFlashcardWord(word: string): string {
  return word.trim().toLowerCase();
}

export function findFlashcardByWord(word: string): Flashcard | undefined {
  const key = normalizeFlashcardWord(word);
  if (!key) return undefined;
  return getFlashcards().find(
    (card) => normalizeFlashcardWord(card.word) === key
  );
}

export function hasFlashcard(word: string): boolean {
  return Boolean(findFlashcardByWord(word));
}

export function getFlashcardWordSet(): Set<string> {
  return new Set(
    getFlashcards().map((card) => normalizeFlashcardWord(card.word))
  );
}

function migrateFlashcard(card: Partial<Flashcard>): Flashcard | null {
  if (!card.id || !card.word) return null;

  return {
    id: card.id,
    word: card.word,
    translation: card.translation ?? '',
    example: card.example ?? '',
    videoId: card.videoId ?? '',
    videoUrl: card.videoUrl ?? getVideoUrl(card.videoId ?? ''),
    timestamp: card.timestamp,
    createdAt: card.createdAt ?? Date.now(),
    knownCount: card.knownCount ?? 0,
    unknownCount: card.unknownCount ?? 0,
    lastReviewedAt: card.lastReviewedAt,
    repetitions: card.repetitions ?? 0,
    ease: card.ease ?? DEFAULT_EASE,
    interval: card.interval ?? 0,
    nextReview: card.nextReview ?? getDefaultNextReview(),
  };
}

export function getFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<Flashcard>[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((card) => migrateFlashcard(card))
      .filter((card): card is Flashcard => card !== null);
  } catch {
    return [];
  }
}

function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function createFlashcard(draft: FlashcardDraft, index = 0): Flashcard {
  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    word: draft.word.trim(),
    translation: draft.translation.trim(),
    example: draft.example.trim(),
    videoId: draft.videoId,
    videoUrl: draft.videoUrl || getVideoUrl(draft.videoId),
    timestamp: draft.timestamp,
    createdAt: Date.now(),
    knownCount: 0,
    unknownCount: 0,
    repetitions: 0,
    ease: DEFAULT_EASE,
    interval: 0,
    nextReview: getDefaultNextReview(),
  };
}

export function recordFlashcardReview(
  id: string,
  known: boolean
): FlashcardReviewResult | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === id);
  if (index < 0) return null;

  const result = known
    ? applyKnownReview(cards[index])
    : applyUnknownReview(cards[index]);

  cards[index] = result.card;
  saveFlashcards(cards);
  return result;
}

export function shuffleFlashcards(cards: Flashcard[]): Flashcard[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function findTimestampForExample(
  example: string,
  word: string,
  transcript: Array<{ text: string; start?: string }>
): number | undefined {
  if (!transcript.length) return undefined;

  const exampleNorm = example.trim().toLowerCase();
  const wordNorm = word.trim().toLowerCase();
  let bestMatch: { score: number; seconds: number } | undefined;

  for (const line of transcript) {
    const lineNorm = line.text.toLowerCase();
    const seconds = parseTimestampToSeconds(line.start);
    if (!line.start || seconds < 0) continue;

    if (exampleNorm && lineNorm.includes(exampleNorm)) {
      const score = exampleNorm.length + 1000;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, seconds };
      }
      continue;
    }

    if (exampleNorm && exampleNorm.includes(lineNorm) && lineNorm.length > 8) {
      const score = lineNorm.length + 500;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, seconds };
      }
      continue;
    }

    if (wordNorm && lineNorm.includes(wordNorm)) {
      const score = wordNorm.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, seconds };
      }
    }
  }

  return bestMatch?.seconds;
}

export function resolveFlashcardTimestamp(
  card: Flashcard,
  transcript?: Array<{ text: string; start?: string }>
): number | undefined {
  if (card.timestamp && card.timestamp > 0) return card.timestamp;
  if (!transcript?.length) return undefined;
  return findTimestampForExample(card.example, card.word, transcript);
}

export function getFlashcardVideoUrl(
  card: Flashcard,
  transcript?: Array<{ text: string; start?: string }>
): string {
  const timestamp = resolveFlashcardTimestamp(card, transcript);
  if (!timestamp || timestamp <= 0) return card.videoUrl;
  const separator = card.videoUrl.includes('?') ? '&' : '?';
  return `${card.videoUrl}${separator}t=${Math.floor(timestamp)}`;
}

export function addFlashcard(draft: FlashcardDraft): Flashcard | null {
  if (hasFlashcard(draft.word)) return null;

  const card = createFlashcard(draft);
  const updated = [card, ...getFlashcards()];
  saveFlashcards(updated);
  return card;
}

export function addFlashcards(drafts: FlashcardDraft[]): {
  added: Flashcard[];
  skipped: string[];
} {
  const existing = getFlashcardWordSet();
  const added: Flashcard[] = [];
  const skipped: string[] = [];

  for (const [index, draft] of drafts.entries()) {
    const key = normalizeFlashcardWord(draft.word);
    if (!key || existing.has(key)) {
      skipped.push(draft.word.trim());
      continue;
    }

    const card = createFlashcard(draft, index);
    added.push(card);
    existing.add(key);
  }

  if (added.length > 0) {
    saveFlashcards([...added, ...getFlashcards()]);
  }

  return { added, skipped };
}

export function removeFlashcard(id: string): Flashcard[] {
  const updated = getFlashcards().filter((card) => card.id !== id);
  saveFlashcards(updated);
  return updated;
}

export function findExampleLine(
  selected: string,
  transcript: Array<{ text: string }>,
  sentences?: Array<{ text: string }>
): string {
  const trimmed = selected.trim();
  if (!trimmed) return '';

  const pool = sentences?.length ? sentences : transcript;
  const needle = trimmed.toLowerCase();

  const matchingLine = pool.find((item) =>
    item.text.toLowerCase().includes(needle)
  );

  return matchingLine?.text ?? trimmed;
}
