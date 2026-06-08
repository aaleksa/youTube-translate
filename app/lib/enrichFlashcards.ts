import type { ParsedFlashcardItem } from './parseFlashcardList';
import { parseFlashcardList } from './parseFlashcardList';

const BATCH_SIZE = 12;

export async function enrichWordsForFlashcards(
  words: string[],
  transcript: string
): Promise<ParsedFlashcardItem[]> {
  const uniqueWords = [...new Set(words.map((word) => word.trim()).filter(Boolean))];
  if (uniqueWords.length === 0) return [];

  const enriched: ParsedFlashcardItem[] = [];

  for (let index = 0; index < uniqueWords.length; index += BATCH_SIZE) {
    const batch = uniqueWords.slice(index, index + BATCH_SIZE);

    const response = await fetch('/api/process-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: transcript,
        enrichWords: batch,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to enrich flashcards');
    }

    const parsed = parseFlashcardList(data.result);
    enriched.push(...parsed);
  }

  const byWord = new Map<string, ParsedFlashcardItem>();
  for (const item of enriched) {
    const key = item.word.toLowerCase();
    if (!byWord.has(key)) byWord.set(key, item);
  }

  return uniqueWords
    .map((word) => byWord.get(word.toLowerCase()))
    .filter((item): item is ParsedFlashcardItem => Boolean(item));
}
