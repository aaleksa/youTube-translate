export interface UsefulPhraseItem {
  phrase: string;
  meaning: string;
  example: string;
}

export function parseUsefulPhrasesResponse(raw: string): UsefulPhraseItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      phrases?: Array<{
        phrase?: string;
        expression?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
      usefulPhrases?: Array<{
        phrase?: string;
        expression?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
    };

    const items = parsed.phrases ?? parsed.usefulPhrases;
    if (!Array.isArray(items)) return [];

    const unique = new Map<string, UsefulPhraseItem>();

    for (const item of items) {
      const phrase = (item.phrase ?? item.expression)?.trim();
      const meaning = (item.meaning ?? item.translation)?.trim();
      const example = item.example?.trim();

      if (!phrase || !meaning) continue;

      const key = phrase.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          phrase,
          meaning,
          example: example || phrase,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}
