import {
  type ParsedFlashcardItem,
  parseFlashcardList,
} from './parseFlashcardList';

export function isFrequencyTranslation(translation: string): boolean {
  const trimmed = translation.trim();
  if (!trimmed) return false;

  return (
    /^\d+\s*(раз(?:ів|и)?|times?|x)?\.?$/i.test(trimmed) ||
    /\d+\s*(раз(?:ів|и)?|times?)\b/i.test(trimmed)
  );
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').trim();
}

export function parseFrequencyWordList(text: string): string[] {
  const words: string[] = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const frequencyMatch = trimmed.match(
      /^(.+?)\s+[-–—]\s*\d+\s*(раз(?:ів|и)?|times?)\b/i
    );
    if (frequencyMatch) {
      words.push(stripMarkdown(frequencyMatch[1]));
      continue;
    }

    const countOnlyMatch = trimmed.match(/^(.+?)\s+[-–—]\s*(\d+)\s*$/);
    if (countOnlyMatch) {
      words.push(stripMarkdown(countOnlyMatch[1]));
    }
  }

  return [...new Set(words.map((word) => word.trim()).filter(Boolean))];
}

export function isReadyFlashcardItem(item: ParsedFlashcardItem): boolean {
  return Boolean(
    item.translation.trim() && !isFrequencyTranslation(item.translation)
  );
}

export interface FlashcardCandidates {
  ready: ParsedFlashcardItem[];
  wordsNeedingEnrichment: string[];
  totalDetected: number;
}

export function getFlashcardCandidatesFromResponse(
  text: string
): FlashcardCandidates {
  const parsed = parseFlashcardList(text);
  const frequencyWords = parseFrequencyWordList(text);

  const ready = parsed.filter(isReadyFlashcardItem);

  const readyKeys = new Set(ready.map((item) => item.word.toLowerCase()));

  const incompleteFromParsed = parsed
    .filter((item) => !isReadyFlashcardItem(item))
    .map((item) => item.word.trim());

  const wordsNeedingEnrichment = [
    ...new Set([...frequencyWords, ...incompleteFromParsed]),
  ].filter((word) => !readyKeys.has(word.toLowerCase()));

  return {
    ready,
    wordsNeedingEnrichment,
    totalDetected: ready.length + wordsNeedingEnrichment.length,
  };
}
