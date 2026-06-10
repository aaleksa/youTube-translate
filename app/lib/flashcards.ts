import {
  applyKnownReview,
  applyUnknownReview,
  getDefaultNextReview,
  getDueFlashcards,
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
  tags: string[];
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  deckIds: string[];
  timestamp?: number;
  /** Sentence from subtitles when the card was first saved */
  originalExample?: string;
  createdAt: number;
  updatedAt?: number;
  knownCount: number;
  unknownCount: number;
  lastReviewedAt?: number;
  repetitions: number;
  ease: number;
  interval: number;
  nextReview?: number;
}

export interface FlashcardUpdate {
  id: string;
  word: string;
  translation: string;
  example: string;
  tags: string[];
  deckIds: string[];
}

export type UpdateFlashcardError = 'not_found' | 'empty_word' | 'duplicate_word';

export type UpdateFlashcardResult =
  | { ok: true; card: Flashcard }
  | { ok: false; error: UpdateFlashcardError };

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
  tags?: string[];
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  deckIds?: string[];
  timestamp?: number;
}

export interface VideoDeckSummary {
  videoId: string;
  title: string;
  cardsCount: number;
  dueCount: number;
}

export type FlashcardView = 'all' | 'due' | 'video' | 'deck';

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

export function hasFlashcard(word: string, excludeId?: string): boolean {
  const key = normalizeFlashcardWord(word);
  if (!key) return false;
  return getFlashcards().some(
    (card) =>
      normalizeFlashcardWord(card.word) === key && card.id !== excludeId
  );
}

export function normalizeTags(tags: string[]): string[] {
  return [
    ...new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  ];
}

export function getFlashcardWordSet(): Set<string> {
  return new Set(
    getFlashcards().map((card) => normalizeFlashcardWord(card.word))
  );
}

function migrateFlashcard(card: Partial<Flashcard> & { deckId?: string }): Flashcard | null {
  if (!card.id || !card.word) return null;

  const videoId = card.videoId?.trim() || undefined;
  const deckIds =
    card.deckIds ??
    (card.deckId ? [card.deckId] : []);

  const example = card.example ?? '';

  return {
    id: card.id,
    word: card.word,
    translation: card.translation ?? '',
    example,
    tags: normalizeTags(card.tags ?? []),
    videoId,
    videoUrl: card.videoUrl ?? (videoId ? getVideoUrl(videoId) : undefined),
    videoTitle: card.videoTitle,
    deckIds: [...new Set(deckIds.filter(Boolean))],
    timestamp: card.timestamp,
    originalExample: card.originalExample ?? example,
    createdAt: card.createdAt ?? Date.now(),
    updatedAt: card.updatedAt,
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

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function createFlashcard(draft: FlashcardDraft, index = 0): Flashcard {
  const example = draft.example.trim();

  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    word: draft.word.trim(),
    translation: draft.translation.trim(),
    example,
    tags: normalizeTags(draft.tags ?? []),
    videoId: draft.videoId,
    videoUrl:
      draft.videoUrl || (draft.videoId ? getVideoUrl(draft.videoId) : undefined),
    videoTitle: draft.videoTitle,
    deckIds: draft.deckIds ? [...new Set(draft.deckIds)] : [],
    timestamp: draft.timestamp,
    originalExample: example || undefined,
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
  const videoUrl =
    card.videoUrl || (card.videoId ? getVideoUrl(card.videoId) : '');
  if (!videoUrl) return '';

  const timestamp = resolveFlashcardTimestamp(card, transcript);
  if (!timestamp || timestamp <= 0) return videoUrl;
  const separator = videoUrl.includes('?') ? '&' : '?';
  return `${videoUrl}${separator}t=${Math.floor(timestamp)}`;
}

export function filterFlashcards(
  cards: Flashcard[],
  options: {
    view: FlashcardView;
    videoId?: string;
    deckId?: string;
  }
): Flashcard[] {
  let result = cards;

  if (options.view === 'due') {
    result = getDueFlashcards(result);
  }

  if (options.view === 'video' && options.videoId) {
    result = result.filter((card) => card.videoId === options.videoId);
  }

  if (options.view === 'deck' && options.deckId) {
    result = result.filter((card) => card.deckIds.includes(options.deckId!));
  }

  return result;
}

export function getStudyQueue(
  cards: Flashcard[],
  options: {
    view: FlashcardView;
    videoId?: string;
    deckId?: string;
  }
): Flashcard[] {
  const pool =
    options.view === 'all'
      ? cards
      : filterFlashcards(cards, options);
  return getDueFlashcards(pool);
}

export function getVideoDeckSummaries(
  cards: Flashcard[],
  titleByVideoId: Record<string, string> = {}
): VideoDeckSummary[] {
  const groups = new Map<string, Flashcard[]>();

  for (const card of cards) {
    if (!card.videoId) continue;
    const group = groups.get(card.videoId) ?? [];
    group.push(card);
    groups.set(card.videoId, group);
  }

  return [...groups.entries()]
    .map(([videoId, groupCards]) => ({
      videoId,
      title: titleByVideoId[videoId] || groupCards[0]?.videoTitle || videoId,
      cardsCount: groupCards.length,
      dueCount: getDueFlashcards(groupCards).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function removeDeckFromCards(deckId: string): Flashcard[] {
  const updated = getFlashcards().map((card) => ({
    ...card,
    deckIds: card.deckIds.filter((id) => id !== deckId),
  }));
  saveFlashcards(updated);
  return updated;
}

export function toggleCardDeckMembership(
  cardId: string,
  deckId: string
): Flashcard | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === cardId);
  if (index < 0) return null;

  const card = cards[index];
  const deckIds = card.deckIds.includes(deckId)
    ? card.deckIds.filter((id) => id !== deckId)
    : [...card.deckIds, deckId];

  const updated = { ...card, deckIds };
  cards[index] = updated;
  saveFlashcards(cards);
  return updated;
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

export function updateFlashcard(update: FlashcardUpdate): UpdateFlashcardResult {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === update.id);
  if (index < 0) return { ok: false, error: 'not_found' };

  const trimmedWord = update.word.trim();
  if (!trimmedWord) return { ok: false, error: 'empty_word' };

  if (hasFlashcard(trimmedWord, update.id)) {
    return { ok: false, error: 'duplicate_word' };
  }

  const existing = cards[index];
  const updated: Flashcard = {
    ...existing,
    word: trimmedWord,
    translation: update.translation.trim(),
    example: update.example.trim(),
    tags: normalizeTags(update.tags),
    deckIds: [...new Set(update.deckIds.filter(Boolean))],
    updatedAt: Date.now(),
  };

  cards[index] = updated;
  saveFlashcards(cards);
  return { ok: true, card: updated };
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
