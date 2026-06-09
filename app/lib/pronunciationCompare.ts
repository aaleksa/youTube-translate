export interface WordMatch {
  expected: string;
  status: 'correct' | 'missing';
  spoken?: string;
}

export interface PronunciationCompareResult {
  score: number;
  spokenText: string;
  words: WordMatch[];
  extraWords: string[];
}

export function normalizeForPronunciation(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeForPronunciation(text: string): string[] {
  const normalized = normalizeForPronunciation(text);
  return normalized ? normalized.split(' ') : [];
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function wordsSimilar(expected: string, spoken: string): boolean {
  if (expected === spoken) return true;
  if (!expected || !spoken) return false;

  const maxDistance =
    expected.length <= 3 || spoken.length <= 3
      ? 1
      : Math.max(1, Math.floor(Math.min(expected.length, spoken.length) / 4));

  return levenshtein(expected, spoken) <= maxDistance;
}

export function comparePronunciation(
  expectedText: string,
  spokenText: string
): PronunciationCompareResult {
  const expectedWords = tokenizeForPronunciation(expectedText);
  const spokenWords = tokenizeForPronunciation(spokenText);

  if (expectedWords.length === 0) {
    return {
      score: 0,
      spokenText: spokenText.trim(),
      words: [],
      extraWords: spokenWords,
    };
  }

  const words: WordMatch[] = [];
  const extraWords: string[] = [];
  let spokenIndex = 0;
  let matchedCount = 0;

  for (const expectedWord of expectedWords) {
    let matched = false;

    for (
      let scan = spokenIndex;
      scan < Math.min(spokenIndex + 3, spokenWords.length);
      scan++
    ) {
      if (!wordsSimilar(expectedWord, spokenWords[scan])) continue;

      if (scan > spokenIndex) {
        extraWords.push(...spokenWords.slice(spokenIndex, scan));
      }

      words.push({
        expected: expectedWord,
        status: 'correct',
        spoken: spokenWords[scan],
      });
      spokenIndex = scan + 1;
      matchedCount += 1;
      matched = true;
      break;
    }

    if (!matched) {
      words.push({ expected: expectedWord, status: 'missing' });
    }
  }

  if (spokenIndex < spokenWords.length) {
    extraWords.push(...spokenWords.slice(spokenIndex));
  }

  const score = Math.round((matchedCount / expectedWords.length) * 100);

  return {
    score,
    spokenText: spokenText.trim(),
    words,
    extraWords,
  };
}
