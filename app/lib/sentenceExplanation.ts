export interface DifficultWord {
  word: string;
  explanation: string;
}

export interface SentenceExplanationResult {
  meaning: string;
  difficultWords: DifficultWord[];
}

export function parseSentenceExplanationResponse(
  raw: string
): SentenceExplanationResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      meaning?: string;
      difficultWords?: Array<{
        word?: string;
        explanation?: string;
        note?: string;
      }>;
    };

    const meaning = parsed.meaning?.trim();
    if (!meaning) return null;

    const difficultWords: DifficultWord[] = [];

    if (Array.isArray(parsed.difficultWords)) {
      for (const item of parsed.difficultWords) {
        const word = item.word?.trim();
        const explanation = (item.explanation ?? item.note)?.trim();
        if (!word || !explanation) continue;
        difficultWords.push({ word, explanation });
      }
    }

    return { meaning, difficultWords };
  } catch {
    return null;
  }
}
