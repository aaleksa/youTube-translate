import type { TranslationLanguageCode } from './translationLanguages';
import { fetchAiApi } from './aiApiClient';

const CHUNK_SIZE = 40;

export class TranslationCancelledError extends Error {
  constructor() {
    super('Translation cancelled');
    this.name = 'TranslationCancelledError';
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new TranslationCancelledError();
  }
}

export async function translateAllLines(
  lines: string[],
  targetLanguage: TranslationLanguageCode,
  onProgress?: (completed: number, total: number) => void,
  signal?: AbortSignal
): Promise<string[]> {
  const translations: string[] = [];

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    throwIfAborted(signal);

    const chunk = lines.slice(i, i + CHUNK_SIZE);
    const response = await fetchAiApi('/api/translate-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: chunk, targetLanguage }),
      signal,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to translate lines');
    }

    translations.push(...data.translations);
    onProgress?.(Math.min(i + chunk.length, lines.length), lines.length);
  }

  return translations;
}
