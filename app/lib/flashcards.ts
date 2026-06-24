import { recordDailyCardReview } from './dailyStudyLog';
import {
  applySmartReview,
  getDefaultNextReview,
  getDueFlashcards,
  getReviewModifiers,
  type FlashcardReviewResult,
  type ReviewRating,
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
import { getActiveUserId, scopedStorageKeyForUser, userScopedStorageKey } from './v2/userStorage';

const STORAGE_BASE_KEY = 'yoytube-flashcards';

function flashcardsStorageKey(): string {
  return userScopedStorageKey(STORAGE_BASE_KEY);
}

function readFlashcardsFromKey(storageKey: string): Flashcard[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(storageKey);
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
            card.translations !== next.translations ||
            card.translationLanguage !== next.translationLanguage)
      );
    });
    if (needsPersist) {
      localStorage.setItem(storageKey, JSON.stringify(migrated));
    }

    return migrated;
  } catch {
    return [];
  }
}

function queueFlashcardsBootstrap(): void {
  const userId = getActiveUserId();
  if (!userId) return;

  void import('./v2/syncFlashcards').then((mod) =>
    mod.bootstrapFlashcardsSync(userId)
  );
}

function queueFlashcardCreate(card: Flashcard): void {
  void import('./v2/syncFlashcards').then((mod) => mod.syncFlashcardCreate(card));
}

function queueFlashcardUpdate(card: Flashcard): void {
  void import('./v2/syncFlashcards').then((mod) => mod.syncFlashcardUpdate(card));
}

function queueFlashcardReviewSync(card: Flashcard): void {
  void import('./v2/syncFlashcards').then((mod) => mod.scheduleFlashcardSync(card));
}

function queueFlashcardUpdates(cards: Flashcard[]): void {
  void import('./v2/syncFlashcards').then((mod) => {
    for (const card of cards) {
      mod.scheduleFlashcardSync(card);
    }
  });
}

function queueFlashcardDelete(id: string): void {
  void import('./v2/syncFlashcards').then((mod) => mod.syncFlashcardDelete(id));
}

const DEFAULT_EASE = 2.5;

export type EnrichmentStatus = 'pending' | 'completed' | 'failed';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type {
  CardState,
  FlashcardReviewResult,
  ReviewRating,
} from './flashcardSrs';
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
  explanation?: string;
  partOfSpeech?: string;
  level?: CefrLevel;
  synonyms?: string[];
  ipa?: string;
  enrichmentStatus?: EnrichmentStatus;
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
  explanation?: string;
  partOfSpeech?: string;
  level?: CefrLevel;
  synonyms?: string[];
  ipa?: string;
}

export interface FlashcardEnrichmentPatch {
  translation?: string;
  example?: string;
  explanation?: string;
  partOfSpeech?: string;
  level?: CefrLevel;
  tags?: string[];
  synonyms?: string[];
  ipa?: string;
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
  originalExample?: string;
  explanation?: string;
  partOfSpeech?: string;
  level?: CefrLevel;
  synonyms?: string[];
  ipa?: string;
  enrichmentStatus?: EnrichmentStatus;
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
  const translationLanguage =
    card.translationLanguage ?? (translation ? 'uk' : undefined);
  const translations: Partial<Record<TranslationLanguageCode, string>> = {
    ...card.translations,
  };

  if (translation && translationLanguage && !translations[translationLanguage]) {
    translations[translationLanguage] = translation;
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
    explanation: card.explanation?.trim() || undefined,
    partOfSpeech: card.partOfSpeech?.trim() || undefined,
    level: card.level,
    synonyms: card.synonyms?.length ? card.synonyms : undefined,
    ipa: card.ipa?.trim() || undefined,
    enrichmentStatus: card.enrichmentStatus,
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

export function getFlashcardsForUser(userId: string): Flashcard[] {
  return readFlashcardsFromKey(scopedStorageKeyForUser(STORAGE_BASE_KEY, userId));
}

export function saveFlashcardsForUser(userId: string, cards: Flashcard[]): void {
  localStorage.setItem(
    scopedStorageKeyForUser(STORAGE_BASE_KEY, userId),
    JSON.stringify(cards)
  );
}

export function getFlashcards(): Flashcard[] {
  return readFlashcardsFromKey(flashcardsStorageKey());
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(flashcardsStorageKey(), JSON.stringify(cards));
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
    originalExample: draft.originalExample?.trim() || example || undefined,
    explanation: draft.explanation?.trim() || undefined,
    partOfSpeech: draft.partOfSpeech?.trim() || undefined,
    level: draft.level,
    synonyms: draft.synonyms?.length ? draft.synonyms : undefined,
    ipa: draft.ipa?.trim() || undefined,
    enrichmentStatus:
      draft.enrichmentStatus ??
      (translation ? 'completed' : 'pending'),
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
  rating: ReviewRating | boolean
): FlashcardReviewResult | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === id);
  if (index < 0) return null;

  const resolvedRating: ReviewRating =
    typeof rating === 'boolean' ? (rating ? 'good' : 'again') : rating;

  const result = applySmartReview(
    cards[index],
    resolvedRating,
    getReviewModifiers(cards[index])
  );

  cards[index] = result.card;
  saveFlashcards(cards);
  queueFlashcardReviewSync(result.card);
  recordDailyCardReview(1, result.known);
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
  queueFlashcardUpdates(updated);
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
  queueFlashcardUpdate(updated);
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
  queueFlashcardCreate(card);
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
    for (const card of added) {
      queueFlashcardCreate(card);
    }
  }

  return { added, skipped };
}

export function removeFlashcard(id: string): Flashcard[] {
  const updated = getFlashcards().filter((card) => card.id !== id);
  saveFlashcards(updated);
  queueFlashcardDelete(id);
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
  queueFlashcardUpdate(updated);
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
    explanation: update.explanation?.trim() || existing.explanation,
    partOfSpeech: update.partOfSpeech?.trim() || existing.partOfSpeech,
    level: update.level ?? existing.level,
    synonyms:
      update.synonyms !== undefined ? update.synonyms : existing.synonyms,
    ipa: update.ipa?.trim() || existing.ipa,
    updatedAt: Date.now(),
  };

  cards[index] = updated;
  saveFlashcards(cards);
  queueFlashcardUpdate(updated);
  return { ok: true, card: updated };
}

export function patchFlashcardEnrichment(
  id: string,
  enrichment: FlashcardEnrichmentPatch,
  status: EnrichmentStatus,
  options: {
    forceTranslation?: boolean;
    forceExample?: boolean;
  } = {}
): Flashcard | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === id);
  if (index < 0) return null;

  const existing = cards[index];
  const translationLanguage =
    existing.translationLanguage ?? getSavedTranslationLanguage();

  const nextTranslation = enrichment.translation?.trim();
  const shouldUpdateTranslation =
    Boolean(nextTranslation) &&
    (options.forceTranslation || !existing.translation.trim());

  const hasOriginalExample = Boolean(
    existing.originalExample?.trim() || existing.example.trim()
  );
  const nextExample = enrichment.example?.trim();
  const shouldUpdateExample =
    Boolean(nextExample) &&
    (options.forceExample ||
      (!hasOriginalExample && !existing.example.trim()));

  const translation = shouldUpdateTranslation
    ? nextTranslation!
    : existing.translation;

  const example = shouldUpdateExample ? nextExample! : existing.example;

  const mergedTags = normalizeTags([
    ...existing.tags,
    ...(enrichment.tags ?? []),
  ]);

  const updated: Flashcard = {
    ...existing,
    translation,
    translations: {
      ...existing.translations,
      ...(shouldUpdateTranslation && translation
        ? { [translationLanguage]: translation }
        : {}),
    },
    translationLanguage,
    example,
    tags: mergedTags,
    explanation: enrichment.explanation?.trim() || existing.explanation,
    partOfSpeech: enrichment.partOfSpeech?.trim() || existing.partOfSpeech,
    level: enrichment.level ?? existing.level,
    synonyms: enrichment.synonyms?.length
      ? enrichment.synonyms
      : existing.synonyms,
    ipa: enrichment.ipa?.trim() || existing.ipa,
    enrichmentStatus: status,
    updatedAt: Date.now(),
  };

  cards[index] = updated;
  saveFlashcards(cards);
  queueFlashcardUpdate(updated);
  return updated;
}

export type DuplicateStrategy = 'skip' | 'replace' | 'merge';

export interface ImportedCardRow {
  word: string;
  translation?: string;
  example?: string;
  tags?: string[];
  videoId?: string;
  repetitions?: number;
  interval?: number;
  ease?: number;
  nextReview?: number;
  knownCount?: number;
  unknownCount?: number;
}

export interface ImportFlashcardResult {
  imported: number;
  skipped: number;
  replaced: number;
  merged: number;
  invalid: number;
}

function cardFromImportedRow(
  row: ImportedCardRow,
  index: number,
  translationLanguage: TranslationLanguageCode,
  preserve?: Flashcard
): Flashcard | null {
  const word = row.word.trim();
  if (!word) return null;

  const translation = row.translation?.trim() ?? '';
  const example = row.example?.trim() ?? '';
  const base = preserve
    ? { ...preserve, updatedAt: Date.now() }
    : createFlashcard(
        {
          word,
          translation,
          example,
          tags: row.tags,
          videoId: row.videoId,
        },
        index,
        undefined,
        translationLanguage
      );

  if (preserve) {
    return {
      ...base,
      word,
      translation: translation || base.translation,
      translations: {
        ...base.translations,
        ...(translation
          ? { [translationLanguage]: translation }
          : {}),
      },
      example: example || base.example,
      tags: normalizeTags(row.tags ?? base.tags),
      videoId: row.videoId ?? base.videoId,
      videoUrl:
        row.videoId && !base.videoUrl
          ? getVideoUrl(row.videoId)
          : base.videoUrl,
    };
  }

  if (row.repetitions !== undefined) base.repetitions = row.repetitions;
  if (row.interval !== undefined) base.interval = row.interval;
  if (row.ease !== undefined) base.ease = row.ease;
  if (row.nextReview !== undefined) base.nextReview = row.nextReview;
  if (row.knownCount !== undefined) base.knownCount = row.knownCount;
  if (row.unknownCount !== undefined) base.unknownCount = row.unknownCount;

  return base;
}

function mergeImportedRow(
  existing: Flashcard,
  row: ImportedCardRow,
  translationLanguage: TranslationLanguageCode
): Flashcard {
  const translation = row.translation?.trim() || existing.translation;
  const example = row.example?.trim() || existing.example;

  return {
    ...existing,
    translation,
    translations: {
      ...existing.translations,
      ...(translation ? { [translationLanguage]: translation } : {}),
    },
    example,
    tags: normalizeTags([...existing.tags, ...(row.tags ?? [])]),
    videoId: row.videoId ?? existing.videoId,
    videoUrl:
      row.videoId && !existing.videoUrl
        ? getVideoUrl(row.videoId)
        : existing.videoUrl,
    updatedAt: Date.now(),
  };
}

export function importFlashcardRows(
  rows: ImportedCardRow[],
  strategy: DuplicateStrategy,
  translationLanguage: TranslationLanguageCode = getSavedTranslationLanguage()
): ImportFlashcardResult {
  const cards = [...getFlashcards()];
  const byWord = new Map(
    cards.map((card) => [normalizeFlashcardWord(card.word), card])
  );
  const result: ImportFlashcardResult = {
    imported: 0,
    skipped: 0,
    replaced: 0,
    merged: 0,
    invalid: 0,
  };

  rows.forEach((row, index) => {
    const word = row.word.trim();
    if (!word) {
      result.invalid += 1;
      return;
    }

    const key = normalizeFlashcardWord(word);
    const existing = byWord.get(key);
    const existingIndex = existing
      ? cards.findIndex((card) => card.id === existing.id)
      : -1;

    if (existing && strategy === 'skip') {
      result.skipped += 1;
      return;
    }

    if (existing && strategy === 'merge') {
      const merged = mergeImportedRow(existing, row, translationLanguage);
      if (existingIndex >= 0) cards[existingIndex] = merged;
      byWord.set(key, merged);
      result.merged += 1;
      return;
    }

    if (existing && strategy === 'replace') {
      const replaced = cardFromImportedRow(
        row,
        index,
        translationLanguage,
        existing
      );
      if (!replaced) {
        result.invalid += 1;
        return;
      }
      if (row.repetitions !== undefined) {
        replaced.repetitions = row.repetitions;
      }
      if (row.interval !== undefined) replaced.interval = row.interval;
      if (row.ease !== undefined) replaced.ease = row.ease;
      if (row.nextReview !== undefined) {
        replaced.nextReview = row.nextReview;
      }
      if (row.knownCount !== undefined) {
        replaced.knownCount = row.knownCount;
      }
      if (row.unknownCount !== undefined) {
        replaced.unknownCount = row.unknownCount;
      }
      if (existingIndex >= 0) cards[existingIndex] = replaced;
      byWord.set(key, replaced);
      result.replaced += 1;
      return;
    }

    const created = cardFromImportedRow(row, index, translationLanguage);
    if (!created) {
      result.invalid += 1;
      return;
    }
    cards.unshift(created);
    byWord.set(key, created);
    result.imported += 1;
  });

  saveFlashcards(cards);
  queueFlashcardsBootstrap();
  return result;
}

export function restoreFlashcards(cards: Flashcard[]): void {
  saveFlashcards(cards);
  queueFlashcardsBootstrap();
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
