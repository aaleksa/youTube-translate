const STORAGE_KEY = 'yoytube-flashcards';

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  example: string;
  videoId: string;
  videoUrl: string;
  createdAt: number;
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

export function getFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Flashcard[];
    return Array.isArray(parsed) ? parsed : [];
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
  };
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
