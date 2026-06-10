import {
  applyKnownReview,
  applyUnknownReview,
  getDefaultNextReview,
  getDueFlashcards,
  type FlashcardReviewResult,
} from './flashcardSrs';
import {
  estimateSentenceEnd,
  findOrCreateSentence,
  findSentenceInTranscript,
  getSentenceById,
  storedSentenceFromPipeline,
  type StoredSentence,
} from './sentenceStore';
import type { Sentence } from './transcriptTypes';
import { parseTimestampToSeconds } from './timestamp';
import { getSavedTranslationLanguage } from './languageSettings';
import type { TranslationLanguageCode } from './translationLanguages';

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
  translations?: Partial<Record<TranslationLanguageCode, string>>;
  /** Language used for the primary translation field when the card was saved */
  translationLanguage?: TranslationLanguageCode;
  example: string;
  tags: string[];
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  deckIds: string[];
  sentenceId?: string;
  timestamp?: number;
  /** Sentence from subtitles when the card was first saved */
  originalExample?: string;
  createdAt: number;
  updatedAt?: number;
  knownCount: number;
  unknownCount: number;
  quizCorrectCount: number;
  quizWrongCount: number;
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
  sentenceId?: string;
  timestamp?: number;
}

export interface FlashcardSentenceContext {
  transcriptSentences?: Sentence[];
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
  const translation = (card.translation ?? '').trim();
  const translationLanguage = card.translationLanguage;
  const translations: Partial<Record<TranslationLanguageCode, string>> = {
    ...card.translations,
  };

  if (translation && Object.keys(translations).length === 0) {
    translations[translationLanguage ?? 'uk'] = translation;
  }

  let sentenceId = card.sentenceId;

  if (!sentenceId && videoId && example) {
    const startTime = card.timestamp ?? 0;
    const stored = findOrCreateSentence({
      videoId,
      text: example,
      startTime,
      endTime: estimateSentenceEnd(startTime, example),
    });
    sentenceId = stored.id;
  }

  return {
    id: card.id,
    word: card.word,
    translation,
    translations,
    translationLanguage,
    example,
    tags: normalizeTags(card.tags ?? []),
    videoId,
    videoUrl: card.videoUrl ?? (videoId ? getVideoUrl(videoId) : undefined),
    videoTitle: card.videoTitle,
    deckIds: [...new Set(deckIds.filter(Boolean))],
    sentenceId,
    timestamp: card.timestamp,
    originalExample: card.originalExample ?? example,
    createdAt: card.createdAt ?? Date.now(),
    updatedAt: card.updatedAt,
    knownCount: card.knownCount ?? 0,
    unknownCount: card.unknownCount ?? 0,
    quizCorrectCount: card.quizCorrectCount ?? 0,
    quizWrongCount: card.quizWrongCount ?? 0,
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
    const migrated = parsed
      .map((card) => migrateFlashcard(card))
      .filter((card): card is Flashcard => card !== null);

    const migratedById = new Map(migrated.map((card) => [card.id, card]));
    const needsPersist = parsed.some((card) => {
      if (!card.id) return false;
      const next = migratedById.get(card.id);
      return Boolean(
        next &&
          (card.sentenceId !== next.sentenceId ||
            card.translations !== next.translations)
      );
    });
    if (needsPersist) {
      saveFlashcards(migrated);
    }

    return migrated;
  } catch {
    return [];
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function resolveSentenceForDraft(
  draft: FlashcardDraft,
  context?: FlashcardSentenceContext
): string | undefined {
  if (draft.sentenceId) return draft.sentenceId;
  if (!draft.videoId) return undefined;

  const example = draft.example.trim() || draft.word.trim();
  if (!example) return undefined;

  const pipelineMatch = context?.transcriptSentences?.length
    ? findSentenceInTranscript(
        draft.example,
        draft.word,
        context.transcriptSentences
      )
    : undefined;

  if (pipelineMatch) {
    return storedSentenceFromPipeline(draft.videoId, pipelineMatch).id;
  }

  const startTime = draft.timestamp ?? 0;

  return findOrCreateSentence({
    videoId: draft.videoId,
    text: example,
    startTime,
    endTime: estimateSentenceEnd(startTime, example),
  }).id;
}

export function resolveFlashcardSentence(
  card: Flashcard
): StoredSentence | undefined {
  if (card.sentenceId) {
    const stored = getSentenceById(card.sentenceId);
    if (stored) return stored;
  }

  if (!card.videoId) return undefined;

  const text = card.example.trim() || card.word.trim();
  if (!text) return undefined;

  const startTime = card.timestamp ?? 0;
  return {
    id: card.sentenceId ?? `fallback_${card.id}`,
    videoId: card.videoId,
    text,
    startTime,
    endTime: estimateSentenceEnd(startTime, text),
  };
}

function createFlashcard(
  draft: FlashcardDraft,
  index = 0,
  context?: FlashcardSentenceContext,
  translationLanguage: TranslationLanguageCode = 'uk'
): Flashcard {
  const example = draft.example.trim();
  const sentenceId = resolveSentenceForDraft(draft, context);
  const translation = draft.translation.trim();

  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    word: draft.word.trim(),
    translation,
    translations: {
      [translationLanguage]: translation,
    },
    translationLanguage,
    example,
    tags: normalizeTags(draft.tags ?? []),
    videoId: draft.videoId,
    videoUrl:
      draft.videoUrl || (draft.videoId ? getVideoUrl(draft.videoId) : undefined),
    videoTitle: draft.videoTitle,
    deckIds: draft.deckIds ? [...new Set(draft.deckIds)] : [],
    sentenceId,
    timestamp: draft.timestamp,
    originalExample: example || undefined,
    createdAt: Date.now(),
    knownCount: 0,
    unknownCount: 0,
    quizCorrectCount: 0,
    quizWrongCount: 0,
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
  const sentence = resolveFlashcardSentence(card);
  if (sentence) return sentence.startTime;
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

export function addFlashcard(
  draft: FlashcardDraft,
  context?: FlashcardSentenceContext,
  translationLanguage: TranslationLanguageCode = getSavedTranslationLanguage()
): Flashcard | null {
  if (hasFlashcard(draft.word)) return null;

  const card = createFlashcard(draft, 0, context, translationLanguage);
  const updated = [card, ...getFlashcards()];
  saveFlashcards(updated);
  return card;
}

export function addFlashcards(
  drafts: FlashcardDraft[],
  context?: FlashcardSentenceContext,
  translationLanguage: TranslationLanguageCode = getSavedTranslationLanguage()
): {
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

    const card = createFlashcard(draft, index, context, translationLanguage);
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

export function recordQuizAnswer(cardId: string, isCorrect: boolean): Flashcard | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === cardId);
  if (index < 0) return null;

  const card = cards[index];
  const updated: Flashcard = {
    ...card,
    quizCorrectCount: card.quizCorrectCount + (isCorrect ? 1 : 0),
    quizWrongCount: card.quizWrongCount + (isCorrect ? 0 : 1),
  };

  cards[index] = updated;
  saveFlashcards(cards);
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
  const translationLanguage = getSavedTranslationLanguage();
  const translation = update.translation.trim();
  const updated: Flashcard = {
    ...existing,
    word: trimmedWord,
    translation,
    translations: {
      ...existing.translations,
      [translationLanguage]: translation,
    },
    translationLanguage,
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
