export interface CollocationItem {
  collocation: string;
  meaning: string;
  example: string;
}

export function parseCollocationsResponse(raw: string): CollocationItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      collocations?: Array<{
        collocation?: string;
        phrase?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
    };

    if (!Array.isArray(parsed.collocations)) return [];

    const unique = new Map<string, CollocationItem>();

    for (const item of parsed.collocations) {
      const collocation = (item.collocation ?? item.phrase)?.trim();
      const meaning = (item.meaning ?? item.translation)?.trim();
      const example = item.example?.trim();

      if (!collocation || !meaning) continue;

      const key = collocation.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          collocation,
          meaning,
          example: example || collocation,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}
