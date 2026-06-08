import { getFlashcardCandidatesFromResponse } from './flashcardCandidates';
import { enrichWordsForFlashcards } from './enrichFlashcards';
import type { ParsedFlashcardItem } from './parseFlashcardList';
import { parseFlashcardList } from './parseFlashcardList';

function normalizeItem(item: {
  word?: string;
  translation?: string;
  example?: string;
}): ParsedFlashcardItem | null {
  const word = item.word?.trim();
  if (!word) return null;

  return {
    word,
    translation: item.translation?.trim() ?? '',
    example: item.example?.trim() ?? '',
  };
}

export function parsePreparedFlashcardsJson(raw: string): ParsedFlashcardItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      items?: Array<{ word?: string; translation?: string; example?: string }>;
    };

    if (!Array.isArray(parsed.items)) return [];

    const unique = new Map<string, ParsedFlashcardItem>();
    for (const item of parsed.items) {
      const normalized = normalizeItem(item);
      if (!normalized?.word || !normalized.translation) continue;
      unique.set(normalized.word.toLowerCase(), normalized);
    }

    return Array.from(unique.values());
  } catch {
    return parseFlashcardList(raw).filter((item) => item.translation.trim());
  }
}

async function prepareViaAi(
  aiResponse: string,
  transcript: string
): Promise<ParsedFlashcardItem[]> {
  const response = await fetch('/api/process-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: transcript,
      prepareFromResponse: aiResponse,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to prepare flashcards');
  }

  return parsePreparedFlashcardsJson(data.result);
}

async function prepareViaFallback(
  aiResponse: string,
  transcript: string
): Promise<ParsedFlashcardItem[]> {
  const { ready, wordsNeedingEnrichment } =
    getFlashcardCandidatesFromResponse(aiResponse);

  const enriched =
    wordsNeedingEnrichment.length > 0
      ? await enrichWordsForFlashcards(wordsNeedingEnrichment, transcript)
      : [];

  const unique = new Map<string, ParsedFlashcardItem>();

  for (const item of [...ready, ...enriched]) {
    if (!item.translation.trim()) continue;
    unique.set(item.word.toLowerCase(), item);
  }

  return Array.from(unique.values());
}

export async function prepareFlashcardsFromAiResponse(
  aiResponse: string,
  transcript: string
): Promise<ParsedFlashcardItem[]> {
  const trimmedResponse = aiResponse.trim();
  if (!trimmedResponse) return [];

  const fromAi = await prepareViaAi(trimmedResponse, transcript);
  if (fromAi.length > 0) return fromAi;

  return prepareViaFallback(trimmedResponse, transcript);
}
