export interface GrammarHighlightItem {
  pattern: string;
  count: number;
  note: string;
}

export interface GrammarHighlightsResult {
  highlights: GrammarHighlightItem[];
}

export function parseGrammarHighlightsResponse(
  raw: string
): GrammarHighlightsResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      highlights?: Array<{
        pattern?: string;
        name?: string;
        count?: number;
        note?: string;
        explanation?: string;
      }>;
    };

    if (!Array.isArray(parsed.highlights)) return null;

    const highlights: GrammarHighlightItem[] = [];

    for (const item of parsed.highlights) {
      const pattern = (item.pattern ?? item.name)?.trim();
      const count =
        typeof item.count === 'number' && item.count > 0 ? item.count : 1;
      const note = (item.note ?? item.explanation)?.trim();

      if (!pattern || !note) continue;

      highlights.push({ pattern, count, note });
    }

    return highlights.length > 0 ? { highlights } : { highlights: [] };
  } catch {
    return null;
  }
}
