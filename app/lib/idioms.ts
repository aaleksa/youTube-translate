export interface IdiomItem {
  idiom: string;
  meaning: string;
  example: string;
}

export function parseIdiomsResponse(raw: string): IdiomItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      idioms?: Array<{
        idiom?: string;
        meaning?: string;
        example?: string;
      }>;
    };

    if (!Array.isArray(parsed.idioms)) return [];

    const unique = new Map<string, IdiomItem>();

    for (const item of parsed.idioms) {
      const idiom = item.idiom?.trim();
      const meaning = item.meaning?.trim();
      const example = item.example?.trim();

      if (!idiom || !meaning) continue;

      const key = idiom.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          idiom,
          meaning,
          example: example || idiom,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}
