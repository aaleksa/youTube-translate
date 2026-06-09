export interface KeyVocabularyItem {
  word: string;
  meaning: string;
  example: string;
}

export function parseKeyVocabularyResponse(raw: string): KeyVocabularyItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      vocabulary?: Array<{
        word?: string;
        phrase?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
      keyVocabulary?: Array<{
        word?: string;
        phrase?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
    };

    const items = parsed.vocabulary ?? parsed.keyVocabulary;
    if (!Array.isArray(items)) return [];

    const unique = new Map<string, KeyVocabularyItem>();

    for (const item of items) {
      const word = (item.word ?? item.phrase)?.trim();
      const meaning = (item.meaning ?? item.translation)?.trim();
      const example = item.example?.trim();

      if (!word || !meaning) continue;

      const key = word.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          word,
          meaning,
          example: example || word,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}
