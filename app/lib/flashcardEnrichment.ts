import { getSavedTranslationLanguage } from './languageSettings';
import {
  getFlashcards,
  normalizeTags,
  patchFlashcardEnrichment,
  type CefrLevel,
  type EnrichmentStatus,
  type Flashcard,
} from './flashcards';
import type { TranslationLanguageCode } from './translationLanguages';

export type { CefrLevel, EnrichmentStatus } from './flashcards';

export const ENRICH_DEBOUNCE_MS = 800;

export type EnrichmentField = 'translation' | 'example' | 'metadata';

export interface CardEnrichmentResult {
  translation?: string;
  example?: string;
  explanation?: string;
  partOfSpeech?: string;
  level?: CefrLevel;
  tags?: string[];
  synonyms?: string[];
  ipa?: string;
}

export interface EnrichCardRequest {
  word: string;
  translationLanguage?: TranslationLanguageCode;
  transcript?: string;
  originalExample?: string;
  fields?: EnrichmentField[];
}

export interface BulkEnrichmentProgress {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  running: boolean;
}

const CEFR_LEVELS = new Set<CefrLevel>(['A1', 'A2', 'B1', 'B2', 'C1']);

function normalizeLevel(value: unknown): CefrLevel | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.trim().toUpperCase() as CefrLevel;
  return CEFR_LEVELS.has(upper) ? upper : undefined;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function parseCardEnrichment(raw: string): CardEnrichmentResult | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const translation =
      typeof parsed.translation === 'string' ? parsed.translation.trim() : '';
    if (!translation) return null;

    return {
      translation,
      example:
        typeof parsed.example === 'string' ? parsed.example.trim() : undefined,
      explanation:
        typeof parsed.explanation === 'string'
          ? parsed.explanation.trim()
          : undefined,
      partOfSpeech:
        typeof parsed.partOfSpeech === 'string'
          ? parsed.partOfSpeech.trim()
          : undefined,
      level: normalizeLevel(parsed.level),
      tags: normalizeStringArray(parsed.tags),
      synonyms: normalizeStringArray(parsed.synonyms),
      ipa: typeof parsed.ipa === 'string' ? parsed.ipa.trim() : undefined,
    };
  } catch {
    return null;
  }
}

export async function enrichCard(
  request: EnrichCardRequest
): Promise<CardEnrichmentResult> {
  const word = request.word.trim();
  if (!word) {
    throw new Error('Word is required');
  }

  const response = await fetch('/api/enrich-flashcard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      transcript: request.transcript,
      originalExample: request.originalExample,
      fields: request.fields,
      translationLanguage:
        request.translationLanguage ?? getSavedTranslationLanguage(),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to enrich flashcard');
  }

  return data.enrichment as CardEnrichmentResult;
}

export function cardNeedsEnrichment(card: Flashcard): boolean {
  if (!card.translation.trim()) return true;
  if (card.enrichmentStatus === 'failed') return true;
  if (card.enrichmentStatus === 'pending') return true;
  return false;
}

export function getCardsNeedingEnrichment(
  cards: Flashcard[],
  limit = 20
): Flashcard[] {
  return cards.filter(cardNeedsEnrichment).slice(0, limit);
}

export function countCardsNeedingEnrichment(cards: Flashcard[]): number {
  return cards.filter(cardNeedsEnrichment).length;
}

export async function enrichAndSaveCard(
  cardId: string,
  options: {
    transcript?: string;
    fields?: EnrichmentField[];
    forceTranslation?: boolean;
    forceExample?: boolean;
  } = {}
): Promise<Flashcard | null> {
  const card = getFlashcards().find((item) => item.id === cardId);
  if (!card) return null;

  try {
    const enrichment = await enrichCard({
      word: card.word,
      transcript: options.transcript,
      originalExample: card.originalExample ?? card.example,
      fields: options.fields,
      translationLanguage: card.translationLanguage,
    });

    return patchFlashcardEnrichment(cardId, enrichment, 'completed', {
      forceTranslation: options.forceTranslation,
      forceExample: options.forceExample,
    });
  } catch {
    patchFlashcardEnrichment(cardId, {}, 'failed');
    return null;
  }
}

export async function runBulkEnrichment(
  cardIds: string[],
  options: {
    transcript?: string;
    onProgress?: (progress: BulkEnrichmentProgress) => void;
    delayMs?: number;
  } = {}
): Promise<BulkEnrichmentProgress> {
  const delayMs = options.delayMs ?? 300;
  const progress: BulkEnrichmentProgress = {
    total: cardIds.length,
    pending: cardIds.length,
    completed: 0,
    failed: 0,
    running: true,
  };

  const notify = () => options.onProgress?.({ ...progress });

  notify();

  for (const cardId of cardIds) {
    const result = await enrichAndSaveCard(cardId, {
      transcript: options.transcript,
    });

    progress.pending = Math.max(0, progress.pending - 1);
    if (result) {
      progress.completed += 1;
    } else {
      progress.failed += 1;
    }
    notify();

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  progress.running = false;
  notify();
  return progress;
}

export function schedulePostSaveEnrichment(
  cardId: string,
  options: { transcript?: string } = {}
): void {
  void enrichAndSaveCard(cardId, options);
}
