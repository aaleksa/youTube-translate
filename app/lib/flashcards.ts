const STORAGE_KEY = 'yoytube-flashcards';

const DEFAULT_EASE = 2.5;

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
}

export interface FlashcardDraft {
  word: string;
  translation: string;
  example: string;
  videoId: string;
  videoUrl: string;
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
    nextReview: card.nextReview,
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
    createdAt: Date.now(),
    knownCount: 0,
    unknownCount: 0,
    repetitions: 0,
    ease: DEFAULT_EASE,
    interval: 0,
  };
}

export function recordFlashcardReview(
  id: string,
  known: boolean
): Flashcard | null {
  const cards = getFlashcards();
  const index = cards.findIndex((card) => card.id === id);
  if (index < 0) return null;

  const card = cards[index];
  const updated: Flashcard = {
    ...card,
    knownCount: card.knownCount + (known ? 1 : 0),
    unknownCount: card.unknownCount + (known ? 1 : 0),
    lastReviewedAt: Date.now(),
  };

  cards[index] = updated;
  saveFlashcards(cards);
  return updated;
}

export function shuffleFlashcards(cards: Flashcard[]): Flashcard[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getFlashcardVideoUrl(card: Flashcard): string {
  if (!card.timestamp || card.timestamp <= 0) return card.videoUrl;
  const separator = card.videoUrl.includes('?') ? '&' : '?';
  return `${card.videoUrl}${separator}t=${Math.floor(card.timestamp)}`;
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
