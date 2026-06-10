import type {
  PhraseChunk,
  RawCaption,
  Sentence,
  ShadowingUnits,
} from './transcriptTypes';

export const SHADOWING_SENTENCE_SPLIT_THRESHOLD = 13;
export const SHADOWING_CHUNK_MIN_WORDS = 4;
export const SHADOWING_CHUNK_MAX_WORDS = 10;
export const SHADOWING_CHUNK_TARGET_WORDS = 7;

export type ShadowingMode = 'easy' | 'normal' | 'advanced';

function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function estimateChunkTiming(
  unit: { start: number; end: number },
  startWord: number,
  endWord: number,
  totalWords: number
): { start: number; end: number } {
  if (totalWords <= 0) {
    return { start: unit.start, end: unit.end };
  }

  const duration = Math.max(unit.end - unit.start, 0.5);
  const startRatio = startWord / totalWords;
  const endRatio = endWord / totalWords;

  return {
    start: unit.start + duration * startRatio,
    end: unit.start + duration * endRatio,
  };
}

function splitIntoSentenceTexts(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const matches = trimmed.match(/[^.!?]*[.!?]+|[^.!?]+$/g);
  if (!matches) return [trimmed];

  return matches.map((part) => part.trim()).filter(Boolean);
}

/** Split compact display lines into normal sentences (by `.!?`). */
export function displayLinesToSentences(displayLines: RawCaption[]): Sentence[] {
  const sentences: Sentence[] = [];

  for (const line of displayLines) {
    const sentenceTexts = splitIntoSentenceTexts(line.text);
    if (sentenceTexts.length === 0) continue;

    const allWords = splitWords(line.text);
    const totalWords = allWords.length || 1;
    let wordOffset = 0;

    for (const text of sentenceTexts) {
      const sentenceWords = splitWords(text);
      const timing = estimateChunkTiming(
        line,
        wordOffset,
        wordOffset + sentenceWords.length,
        totalWords
      );
      wordOffset += sentenceWords.length;

      sentences.push({
        id: `sentence_${sentences.length + 1}`,
        text,
        start: timing.start,
        end: timing.end,
        captionIndexes: line.captionIndexes,
      });
    }
  }

  return sentences;
}

function getPreferredBreakIndices(words: string[]): number[] {
  const breaks: number[] = [];

  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    if (/[,;:]$/.test(word) || (/[.!?]$/.test(word) && index < words.length - 1)) {
      breaks.push(index + 1);
      continue;
    }

    if (index >= words.length - 1) continue;

    const next = words[index + 1]
      .toLowerCase()
      .replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
    if (
      [
        'and',
        'but',
        'so',
        'or',
        'while',
        'because',
        'when',
        'that',
        'yes',
        'our',
      ].includes(next)
    ) {
      breaks.push(index + 1);
    }
  }

  return [...new Set(breaks)].sort((a, b) => a - b);
}

function packWordsIntoChunks(words: string[]): string[] {
  if (words.length <= SHADOWING_SENTENCE_SPLIT_THRESHOLD) {
    return [words.join(' ')];
  }

  const breaks = getPreferredBreakIndices(words);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const remaining = words.length - start;
    if (remaining <= SHADOWING_CHUNK_MAX_WORDS) {
      chunks.push(words.slice(start).join(' '));
      break;
    }

    const minEnd = start + SHADOWING_CHUNK_MIN_WORDS;
    const maxEnd = Math.min(start + SHADOWING_CHUNK_MAX_WORDS, words.length);
    const targetEnd = Math.min(start + SHADOWING_CHUNK_TARGET_WORDS, words.length);

    let end = maxEnd;
    const candidates = breaks.filter(
      (breakIndex) => breakIndex >= minEnd && breakIndex <= maxEnd
    );
    if (candidates.length > 0) {
      end = candidates.reduce((best, candidate) =>
        Math.abs(candidate - targetEnd) < Math.abs(best - targetEnd)
          ? candidate
          : best
      );
    }

    const leftover = words.length - end;
    if (leftover > 0 && leftover < SHADOWING_CHUNK_MIN_WORDS) {
      end = words.length;
    }

    chunks.push(words.slice(start, end).join(' '));
    start = end;
  }

  return chunks.filter(Boolean);
}

export function sentenceToShadowChunks(sentence: Sentence): PhraseChunk[] {
  const words = splitWords(sentence.text);
  const chunkTexts = packWordsIntoChunks(words);
  let wordOffset = 0;

  return chunkTexts.map((text, index) => {
    const chunkWords = splitWords(text);
    const timing = estimateChunkTiming(
      sentence,
      wordOffset,
      wordOffset + chunkWords.length,
      words.length || 1
    );
    wordOffset += chunkWords.length;

    return {
      id: `${sentence.id}_chunk_${index + 1}`,
      text,
      start: timing.start,
      end: timing.end,
      sentenceId: sentence.id,
      captionIndexes: sentence.captionIndexes,
    };
  });
}

export function buildShadowingUnits(
  displayLines: RawCaption[],
  sentences: Sentence[]
): ShadowingUnits {
  const chunks: PhraseChunk[] = [];
  for (const sentence of sentences) {
    for (const chunk of sentenceToShadowChunks(sentence)) {
      chunks.push({
        ...chunk,
        id: `phrase_${chunks.length + 1}`,
      });
    }
  }

  const sentenceUnits: PhraseChunk[] = sentences.map((sentence, index) => ({
    id: `phrase_${index + 1}`,
    text: sentence.text,
    start: sentence.start,
    end: sentence.end,
    sentenceId: sentence.id,
    captionIndexes: sentence.captionIndexes,
  }));

  const paragraphs: PhraseChunk[] = displayLines.map((line, index) => ({
    id: `paragraph_${index + 1}`,
    text: line.text.trim(),
    start: line.start,
    end: line.end,
    sentenceId: `line_${index + 1}`,
    captionIndexes: line.captionIndexes,
  }));

  return { chunks, sentences: sentenceUnits, paragraphs };
}

export function pickShadowingUnits(
  units: ShadowingUnits | undefined,
  mode: ShadowingMode
): PhraseChunk[] {
  if (!units) return [];
  if (mode === 'advanced') return units.paragraphs;
  if (mode === 'normal') return units.sentences;
  return units.chunks;
}
