export interface WordMatch {
  expected: string;
  status: 'correct' | 'missing' | 'optional';
  spoken?: string;
}

export interface PronunciationCompareResult {
  score: number;
  spokenText: string;
  words: WordMatch[];
  missedWords: string[];
  extraWords: string[];
}

/** Contractions expanded before compare — STT often says "I am" for "I'm". */
const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  "you're": 'you are',
  "he's": 'he is',
  "she's": 'she is',
  "it's": 'it is',
  "we're": 'we are',
  "they're": 'they are',
  "i've": 'i have',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i'd": 'i would',
  "you'd": 'you would',
  "he'd": 'he would',
  "she'd": 'she would',
  "we'd": 'we would',
  "they'd": 'they would',
  "i'll": 'i will',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "we'll": 'we will',
  "they'll": 'they will',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "couldn't": 'could not',
  "can't": 'cannot',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "haven't": 'have not',
  "hasn't": 'has not',
  "hadn't": 'had not',
  "let's": 'let us',
  "that's": 'that is',
  "what's": 'what is',
  "who's": 'who is',
  "there's": 'there is',
  "here's": 'here is',
};

const CONTRACTION_ENTRIES = Object.entries(CONTRACTIONS).sort(
  (a, b) => b[0].length - a[0].length
);

/** Function words — missing them barely affects the score. */
const OPTIONAL_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'to',
  'of',
  'in',
  'on',
  'at',
  'or',
  'but',
  'so',
  'as',
  'for',
  'with',
  'by',
  'from',
]);

const OPTIONAL_WEIGHT = 0.15;
const CONTENT_WEIGHT = 1;
const OPTIONAL_MISS_CREDIT = 0.95;
const TOKEN_LOOKAHEAD = 6;

export function normalizeForPronunciation(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function expandContractions(text: string): string {
  let normalized = normalizeForPronunciation(text);
  for (const [key, value] of CONTRACTION_ENTRIES) {
    const pattern = new RegExp(`\\b${key.replace(/'/g, "['']?")}\\b`, 'g');
    normalized = normalized.replace(pattern, value);
  }
  return normalized;
}

export function tokenizeForPronunciation(text: string): string[] {
  const expanded = expandContractions(text);
  return expanded ? expanded.split(' ') : [];
}

function stripTrailingPunct(word: string): string {
  return word.replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
}

interface DisplayUnit {
  display: string;
  tokens: string[];
  isOptional: boolean;
}

function expandWordTokens(word: string): string[] {
  const norm = normalizeForPronunciation(word);
  const expanded = CONTRACTIONS[norm] ?? norm;
  return expanded ? expanded.split(' ').filter(Boolean) : [];
}

function buildDisplayUnits(text: string): DisplayUnit[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const display = stripTrailingPunct(raw) || raw;
      const tokens = expandWordTokens(raw);
      const isOptional =
        tokens.length === 1 && OPTIONAL_WORDS.has(tokens[0] ?? '');
      return { display, tokens, isOptional };
    });
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

function findToken(
  spokenWords: string[],
  fromIndex: number,
  expectedToken: string
): number {
  const limit = Math.min(fromIndex + TOKEN_LOOKAHEAD, spokenWords.length);
  for (let i = fromIndex; i < limit; i++) {
    if (wordsSimilar(expectedToken, spokenWords[i])) return i;
  }
  return -1;
}

function findTokenAllowingOptionalSkips(
  spokenWords: string[],
  fromIndex: number,
  expectedToken: string
): number {
  const limit = Math.min(fromIndex + TOKEN_LOOKAHEAD, spokenWords.length);
  for (let i = fromIndex; i < limit; i++) {
    if (wordsSimilar(expectedToken, spokenWords[i])) return i;
    if (!OPTIONAL_WORDS.has(spokenWords[i])) break;
  }
  return -1;
}

function sequenceSimilarityPercent(
  expectedWords: string[],
  spokenWords: string[]
): number {
  if (expectedWords.length === 0) return 0;
  const a = expectedWords.join(' ');
  const b = spokenWords.join(' ');
  if (!a) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = levenshtein(a, b);
  return Math.round((1 - dist / maxLen) * 100);
}

function unitWeight(unit: DisplayUnit): number {
  return unit.isOptional ? OPTIONAL_WEIGHT : CONTENT_WEIGHT;
}

function matchDisplayUnit(
  unit: DisplayUnit,
  spokenWords: string[],
  spokenIndex: number
): { matched: boolean; nextIndex: number; spokenLabel?: string } {
  if (unit.tokens.length === 0) {
    return { matched: true, nextIndex: spokenIndex };
  }

  let cursor = spokenIndex;
  const matchedSpoken: string[] = [];

  for (const token of unit.tokens) {
    const foundAt = findTokenAllowingOptionalSkips(spokenWords, cursor, token);
    if (foundAt === -1) {
      return { matched: false, nextIndex: spokenIndex };
    }
    matchedSpoken.push(spokenWords[foundAt]);
    cursor = foundAt + 1;
  }

  return {
    matched: true,
    nextIndex: cursor,
    spokenLabel: matchedSpoken.join(' '),
  };
}

function tryMatchOptionalUnit(
  unit: DisplayUnit,
  spokenWords: string[],
  spokenIndex: number
): { matched: boolean; nextIndex: number; spokenLabel?: string } {
  if (unit.tokens.length !== 1) {
    return matchDisplayUnit(unit, spokenWords, spokenIndex);
  }

  const token = unit.tokens[0];
  const foundAt = findToken(spokenWords, spokenIndex, token);
  if (foundAt === -1) {
    return { matched: false, nextIndex: spokenIndex };
  }

  return {
    matched: true,
    nextIndex: foundAt + 1,
    spokenLabel: spokenWords[foundAt],
  };
}

function isIgnorableExtra(word: string): boolean {
  return OPTIONAL_WORDS.has(word);
}

export function comparePronunciation(
  expectedText: string,
  spokenText: string
): PronunciationCompareResult {
  const displayUnits = buildDisplayUnits(expectedText);
  const expectedWords = tokenizeForPronunciation(expectedText);
  const spokenWords = tokenizeForPronunciation(spokenText);

  if (displayUnits.length === 0) {
    return {
      score: 0,
      spokenText: spokenText.trim(),
      words: [],
      missedWords: [],
      extraWords: spokenWords.filter((word) => !isIgnorableExtra(word)),
    };
  }

  const words: WordMatch[] = [];
  const consumed = new Array(spokenWords.length).fill(false);
  let spokenIndex = 0;
  let earnedWeight = 0;
  let totalWeight = 0;

  for (const unit of displayUnits) {
    const weight = unitWeight(unit);
    totalWeight += weight;

    const match = unit.isOptional
      ? tryMatchOptionalUnit(unit, spokenWords, spokenIndex)
      : matchDisplayUnit(unit, spokenWords, spokenIndex);

    if (match.matched) {
      for (let i = spokenIndex; i < match.nextIndex; i++) {
        consumed[i] = true;
      }
      spokenIndex = match.nextIndex;
      earnedWeight += weight;
      words.push({
        expected: unit.display,
        status: 'correct',
        spoken: match.spokenLabel,
      });
      continue;
    }

    if (unit.isOptional) {
      earnedWeight += weight * OPTIONAL_MISS_CREDIT;
      words.push({ expected: unit.display, status: 'optional' });
      continue;
    }

    words.push({ expected: unit.display, status: 'missing' });
  }

  const extraWords = spokenWords.filter(
    (word, index) => !consumed[index] && !isIgnorableExtra(word)
  );

  const alignmentScore =
    totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const similarityScore = sequenceSimilarityPercent(expectedWords, spokenWords);
  const score = Math.min(100, Math.max(alignmentScore, similarityScore));

  const missedWords = words
    .filter((word) => word.status === 'missing')
    .map((word) => word.expected);

  return {
    score,
    spokenText: spokenText.trim(),
    words,
    missedWords,
    extraWords,
  };
}
