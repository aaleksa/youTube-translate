export interface PhrasalVerbItem {
  phrasalVerb: string;
  meaning: string;
  example: string;
}

export function parsePhrasalVerbsResponse(raw: string): PhrasalVerbItem[] {
  try {
    const parsed = JSON.parse(raw) as {
      phrasalVerbs?: Array<{
        phrasalVerb?: string;
        verb?: string;
        meaning?: string;
        translation?: string;
        example?: string;
      }>;
    };

    if (!Array.isArray(parsed.phrasalVerbs)) return [];

    const unique = new Map<string, PhrasalVerbItem>();

    for (const item of parsed.phrasalVerbs) {
      const phrasalVerb = (item.phrasalVerb ?? item.verb)?.trim();
      const meaning = (item.meaning ?? item.translation)?.trim();
      const example = item.example?.trim();

      if (!phrasalVerb || !meaning) continue;

      const key = phrasalVerb.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, {
          phrasalVerb,
          meaning,
          example: example || phrasalVerb,
        });
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}
