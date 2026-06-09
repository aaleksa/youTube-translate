export interface FrequentWordItem {
  word: string;
  count: number;
  meaning: string;
  example: string;
}

const STOP_WORDS = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'all',
  'also',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'get',
  'got',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'just',
  'know',
  'let',
  'like',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  're',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'yeah',
  'yes',
  'oh',
  'um',
  'uh',
  'well',
  'okay',
  'ok',
  'gonna',
  'wanna',
  'gotta',
  'im',
  "i'm",
  "don't",
  "it's",
  "that's",
  "you're",
  "we're",
  "they're",
  "he's",
  "she's",
  "there's",
  "what's",
  "let's",
  "didn't",
  "won't",
  "can't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "haven't",
  "hasn't",
  "hadn't",
]);

const DEFAULT_LIMIT = 30;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^['-]+|['-]+$/g, ''))
    .filter((word) => word.length > 1 && !/^\d+$/.test(word));
}

export function countFrequentWords(
  text: string,
  limit = DEFAULT_LIMIT
): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();

  for (const word of tokenize(text)) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function findExampleSentence(text: string, word: string): string {
  const lines = text.split(/\n+/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );
    if (regex.test(trimmed)) {
      return trimmed.length > 200 ? `${trimmed.slice(0, 197)}...` : trimmed;
    }
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );
    if (regex.test(trimmed)) {
      return trimmed.length > 200 ? `${trimmed.slice(0, 197)}...` : trimmed;
    }
  }

  return word;
}

export function parseFrequentWordsTranslations(
  raw: string
): Map<string, string> {
  const translations = new Map<string, string>();

  try {
    const parsed = JSON.parse(raw) as {
      translations?: Array<{
        word?: string;
        meaning?: string;
        translation?: string;
      }>;
      frequentWords?: Array<{
        word?: string;
        meaning?: string;
        translation?: string;
      }>;
    };

    const items = parsed.translations ?? parsed.frequentWords;
    if (!Array.isArray(items)) return translations;

    for (const item of items) {
      const word = item.word?.trim().toLowerCase();
      const meaning = (item.meaning ?? item.translation)?.trim();
      if (word && meaning && !translations.has(word)) {
        translations.set(word, meaning);
      }
    }
  } catch {
    return translations;
  }

  return translations;
}

export function mergeFrequentWords(
  counts: Array<{ word: string; count: number }>,
  translations: Map<string, string>,
  sourceText: string
): FrequentWordItem[] {
  return counts
    .map(({ word, count }) => {
      const meaning = translations.get(word.toLowerCase());
      if (!meaning) return null;

      return {
        word,
        count,
        meaning,
        example: findExampleSentence(sourceText, word),
      };
    })
    .filter((item): item is FrequentWordItem => item !== null);
}
