import { getCueEndSeconds, type TranscriptCue } from './transcriptCue';
import { parseTimestampToSeconds } from './timestamp';
import type {
  PhraseChunk,
  RawCaption,
  Sentence,
  TranscriptPipelineResult,
} from './transcriptTypes';

const ROLLING_GAP_SECONDS = 4;
const ROLLING_OVERLAP_GAP_SECONDS = 10;
const SENTENCE_GAP_SECONDS = 4;
const SHADOWING_MIN_WORDS = 3;
const SHADOWING_MAX_WORDS = 8;

function normalizeCompare(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
}

function getNormalizedWords(text: string): string[] {
  return normalizeCompare(text)
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.!?,;:]+$/g, '').trim();
}

function endsSentence(text: string): boolean {
  return /[.!?]["']?\s*$/.test(text.trim());
}

function getSuffixPrefixOverlapSize(
  previousText: string,
  nextText: string,
  minWords = 1
): number {
  const prevWords = getNormalizedWords(previousText);
  const nextWords = getNormalizedWords(nextText);
  if (prevWords.length === 0 || nextWords.length === 0) return 0;

  const maxOverlap = Math.min(prevWords.length, nextWords.length, 12);
  for (let size = maxOverlap; size >= minWords; size--) {
    const suffix = prevWords.slice(-size).join(' ');
    const prefix = nextWords.slice(0, size).join(' ');
    if (suffix === prefix) return size;
  }

  return 0;
}

/** YouTube ASR: next cue often repeats the tail words of the previous cue. */
export function hasSuffixPrefixWordOverlap(
  previousText: string,
  nextText: string,
  minWords = 2
): boolean {
  return getSuffixPrefixOverlapSize(previousText, nextText, minWords) > 0;
}

/** Keep only words from `fragment` that are not already at the end of `complete`. */
export function extractTailAfterOverlap(
  completeText: string,
  fragmentText: string
): string | null {
  const fragmentNorm = normalizeCompare(fragmentText);
  if (!fragmentNorm) return null;

  const completeNorm = normalizeCompare(completeText);
  if (fragmentNorm === completeNorm) return null;
  if (completeNorm.startsWith(fragmentNorm)) return null;
  if (completeNorm.includes(fragmentNorm)) return null;

  const displayWords = fragmentText.trim().split(/\s+/).filter(Boolean);
  if (displayWords.length === 0) return null;

  const overlapSize = getSuffixPrefixOverlapSize(completeText, fragmentText, 1);
  if (overlapSize === 0) return fragmentText.trim();

  const tailWords = displayWords.slice(overlapSize);
  if (tailWords.length === 0) return null;
  return tailWords.join(' ');
}

function pruneRollingDisplayLines(lines: RawCaption[]): RawCaption[] {
  const result: RawCaption[] = [];

  for (const line of lines) {
    const previous = result[result.length - 1];
    let text = line.text.trim();
    if (!text) continue;

    if (previous) {
      const tail = extractTailAfterOverlap(previous.text, text);
      if (tail === null) continue;
      text = tail;
      if (!text) continue;
    }

    const norm = normalizeCompare(text);
    if (previous && normalizeCompare(previous.text).includes(norm)) {
      continue;
    }

    result.push({ ...line, text });
  }

  return result.filter((line, index, items) => {
    const norm = normalizeCompare(line.text);
    return !items.some((other, otherIndex) => {
      if (otherIndex <= index) return false;
      const otherNorm = normalizeCompare(other.text);
      return otherNorm.length > norm.length && otherNorm.includes(norm);
    });
  });
}

function transcriptCuesToRawCaptions(cues: TranscriptCue[]): RawCaption[] {
  return cues.map((cue, index) => {
    const start = parseTimestampToSeconds(cue.start);
    const end = getCueEndSeconds(index, cues);
    return {
      index,
      text: cue.text.trim(),
      start,
      end: Math.max(end, start + 0.1),
      captionIndexes: [index],
    };
  });
}

function isDuplicateCaption(prev: RawCaption, next: RawCaption): boolean {
  const prevText = normalizeCompare(prev.text);
  const nextText = normalizeCompare(next.text);
  if (!prevText || !nextText) return !nextText;

  if (prevText === nextText) {
    return Math.abs(next.start - prev.start) < 1.5;
  }

  return false;
}

function isSuffixFragment(shorter: string, longer: string): boolean {
  const shortCore = stripTrailingPunctuation(shorter);
  const longCore = stripTrailingPunctuation(longer);
  if (!shortCore || !longCore || shortCore.length > longCore.length) return false;
  return longCore.endsWith(shortCore) || longCore.includes(shortCore);
}

function isRollingContinuation(prev: RawCaption, next: RawCaption): boolean {
  const prevText = normalizeCompare(prev.text);
  const nextText = normalizeCompare(next.text);
  if (!prevText || !nextText) return false;
  if (prevText === nextText) return true;
  if (nextText.startsWith(prevText) || prevText.startsWith(nextText)) return true;

  if (getSuffixPrefixOverlapSize(prev.text, next.text, 1) > 0) {
    // Tail overlap after a finished sentence is a stale rolling frame, not a merge.
    if (
      endsSentence(prev.text) &&
      !nextText.startsWith(prevText)
    ) {
      return false;
    }
    return true;
  }

  if (endsSentence(prev.text)) {
    if (
      Math.abs(next.start - prev.start) <= 0.5 &&
      (isSuffixFragment(next.text, prev.text) || isSuffixFragment(prev.text, next.text))
    ) {
      return true;
    }

    return false;
  }

  const prevCore = stripTrailingPunctuation(prevText);
  const nextCore = stripTrailingPunctuation(nextText);
  if (prevCore.startsWith(nextCore) || nextCore.startsWith(prevCore)) return true;

  if (isSuffixFragment(nextText, prevText) || isSuffixFragment(prevText, nextText)) {
    return true;
  }

  if (
    nextText.length < prevText.length &&
    prevText.includes(nextCore) &&
    nextCore.length <= 32
  ) {
    return true;
  }

  return false;
}

function isCloseRollingWindow(prev: RawCaption, current: RawCaption): boolean {
  const gapFromStart = current.start - prev.start;
  const gapFromEnd = current.start - prev.end;
  return (
    gapFromStart <= ROLLING_GAP_SECONDS ||
    gapFromEnd <= 1.5 ||
    (gapFromStart <= ROLLING_OVERLAP_GAP_SECONDS &&
      getSuffixPrefixOverlapSize(prev.text, current.text, 1) > 0)
  );
}

function stitchRollingTexts(previous: string, next: string): string {
  const prev = previous.trim();
  const nextText = next.trim();
  if (!prev) return nextText;
  if (!nextText) return prev;

  const prevNorm = normalizeCompare(prev);
  const nextNorm = normalizeCompare(nextText);
  if (nextNorm.startsWith(prevNorm)) return nextText;
  if (prevNorm.startsWith(nextNorm)) return prev;

  const prevWords = getNormalizedWords(prev);
  const nextWords = getNormalizedWords(nextText);
  const displayPrevWords = prev.split(/\s+/).filter(Boolean);
  const displayNextWords = nextText.split(/\s+/).filter(Boolean);
  const maxOverlap = Math.min(prevWords.length, nextWords.length, 12);

  for (let size = maxOverlap; size >= 1; size--) {
    const suffix = prevWords.slice(-size).join(' ');
    const prefix = nextWords.slice(0, size).join(' ');
    if (suffix !== prefix) continue;

    return [...displayPrevWords, ...displayNextWords.slice(size)].join(' ').trim();
  }

  const tail = extractTailAfterOverlap(prev, nextText);
  if (tail && normalizeCompare(tail) !== nextNorm) {
    return `${prev} ${tail}`.trim();
  }

  return prev.length >= nextText.length ? prev : nextText;
}

function mergeCaptionGroupText(group: RawCaption[]): string {
  const ordered = [...group].sort((a, b) => a.start - b.start || a.index - b.index);
  return ordered
    .map((item) => item.text.trim())
    .filter(Boolean)
    .reduce((merged, text) => stitchRollingTexts(merged, text), '');
}

function mergeCaptionGroup(group: RawCaption[]): RawCaption {
  return {
    index: group[0].index,
    text: mergeCaptionGroupText(group),
    start: Math.min(...group.map((item) => item.start)),
    end: Math.max(...group.map((item) => item.end)),
    captionIndexes: [...new Set(group.flatMap((item) => item.captionIndexes))].sort(
      (a, b) => a - b
    ),
  };
}

export function dedupeRollingCaptions(captions: RawCaption[]): RawCaption[] {
  if (captions.length === 0) return [];

  const merged: RawCaption[] = [];
  let group: RawCaption[] = [captions[0]];

  for (let i = 1; i < captions.length; i++) {
    const current = captions[i];

    if (group.length === 0) {
      group = [current];
      continue;
    }

    const prevRaw = group[group.length - 1];
    const prev = mergeCaptionGroup(group);

    if (isDuplicateCaption(prevRaw, current)) {
      group.push(current);
      continue;
    }

    const closeInTime = isCloseRollingWindow(prev, current);
    const rolling = isRollingContinuation(prev, current);

    if (closeInTime && rolling) {
      group.push(current);
      continue;
    }

    merged.push(prev);

    const tail = extractTailAfterOverlap(prev.text, current.text);
    if (tail === null) {
      group = [];
      continue;
    }

    if (normalizeCompare(tail) !== normalizeCompare(current.text)) {
      group = [{ ...current, text: tail }];
      continue;
    }

    group = [current];
  }

  if (group.length > 0) {
    merged.push(mergeCaptionGroup(group));
  }

  return pruneRollingDisplayLines(
    merged.filter((item) => item.text.trim())
  );
}

function finalizeTimedUnitEnds<T extends { start: number; end: number; text: string }>(
  units: T[]
): T[] {
  return units.map((unit, index) => {
    const next = units[index + 1];
    let end = unit.end;

    if (next) {
      end = Math.max(unit.start + 0.8, next.start - 0.05);
    } else {
      const estimated = Math.max(2, Math.min(12, unit.text.length / 10));
      end = Math.max(end, unit.start + estimated);
    }

    return { ...unit, end };
  });
}

export function mergedCaptionsToSentences(
  merged: RawCaption[],
  rawCaptions: RawCaption[]
): Sentence[] {
  if (merged.length === 0) return [];

  const sentences: Sentence[] = [];
  let buffer: RawCaption[] = [];

  const flush = () => {
    if (buffer.length === 0) return;

    const best = buffer.reduce((longest, item) =>
      item.text.length > longest.text.length ? item : longest
    );
    const text = best.text.trim();

    if (!text) {
      buffer = [];
      return;
    }

    const captionIndexes = buffer.flatMap((item) => {
      const matches = rawCaptions
        .map((raw, rawIndex) => ({ raw, rawIndex }))
        .filter(
          ({ raw }) =>
            Math.abs(raw.start - item.start) < 0.2 ||
            normalizeCompare(raw.text) === normalizeCompare(item.text) ||
            normalizeCompare(item.text).includes(normalizeCompare(raw.text))
        )
        .map(({ rawIndex }) => rawIndex);

      return matches.length > 0 ? matches : [item.index];
    });

    sentences.push({
      id: `sentence_${sentences.length + 1}`,
      text,
      start: Math.min(...buffer.map((item) => item.start)),
      end: Math.max(...buffer.map((item) => item.end)),
      captionIndexes: [...new Set(captionIndexes)].sort((a, b) => a - b),
    });
    buffer = [];
  };

  for (let i = 0; i < merged.length; i++) {
    const current = merged[i];
    const previous = buffer[buffer.length - 1];

    if (previous && endsSentence(previous.text)) {
      flush();
    }

    if (
      previous &&
      current.start - previous.end > SENTENCE_GAP_SECONDS &&
      !endsSentence(previous.text)
    ) {
      flush();
    }

    buffer.push(current);

    if (endsSentence(current.text)) {
      flush();
    }
  }

  flush();
  return sentences;
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

function splitTextIntoPhrases(input: {
  text: string;
  start: number;
  end: number;
  sentenceId: string;
  captionIndexes: number[];
  minWords?: number;
  maxWords?: number;
}): PhraseChunk[] {
  const minWords = input.minWords ?? SHADOWING_MIN_WORDS;
  const maxWords = input.maxWords ?? SHADOWING_MAX_WORDS;
  const words = input.text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const phrases: PhraseChunk[] = [];

  if (words.length <= maxWords) {
    phrases.push({
      id: `phrase_${phrases.length + 1}`,
      text: input.text.trim(),
      start: input.start,
      end: input.end,
      sentenceId: input.sentenceId,
      captionIndexes: input.captionIndexes,
    });
    return phrases;
  }

  let index = 0;
  while (index < words.length) {
    const remaining = words.length - index;
    let chunkSize = Math.min(maxWords, remaining);

    if (remaining - chunkSize > 0 && remaining - chunkSize < minWords) {
      chunkSize = remaining;
    }

    if (chunkSize < minWords && index > 0) {
      const previous = phrases[phrases.length - 1];
      previous.text = `${previous.text} ${words.slice(index).join(' ')}`.trim();
      const timing = estimateChunkTiming(
        input,
        0,
        words.length,
        words.length
      );
      previous.end = timing.end;
      break;
    }

    const sliceEnd = index + chunkSize;
    const text = words.slice(index, sliceEnd).join(' ');
    const timing = estimateChunkTiming(input, index, sliceEnd, words.length);

    phrases.push({
      id: `phrase_${phrases.length + 1}`,
      text,
      start: timing.start,
      end: timing.end,
      sentenceId: input.sentenceId,
      captionIndexes: input.captionIndexes,
    });

    index = sliceEnd;
  }

  return phrases;
}

/** Shadowing units — one compact subtitle line each (same as transcript UI). */
export function displayLinesToPhrases(
  displayLines: RawCaption[],
  minWords = SHADOWING_MIN_WORDS,
  maxWords = SHADOWING_MAX_WORDS
): PhraseChunk[] {
  const phrases: PhraseChunk[] = [];

  for (let lineIndex = 0; lineIndex < displayLines.length; lineIndex++) {
    const line = displayLines[lineIndex];
    const chunks = splitTextIntoPhrases({
      text: line.text,
      start: line.start,
      end: line.end,
      sentenceId: `line_${lineIndex + 1}`,
      captionIndexes: line.captionIndexes,
      minWords,
      maxWords,
    });

    for (const chunk of chunks) {
      phrases.push({
        ...chunk,
        id: `phrase_${phrases.length + 1}`,
      });
    }
  }

  return phrases;
}

export function sentencesToPhrases(
  sentences: Sentence[],
  minWords = SHADOWING_MIN_WORDS,
  maxWords = SHADOWING_MAX_WORDS
): PhraseChunk[] {
  const phrases: PhraseChunk[] = [];

  for (const sentence of sentences) {
    const chunks = splitTextIntoPhrases({
      text: sentence.text,
      start: sentence.start,
      end: sentence.end,
      sentenceId: sentence.id,
      captionIndexes: sentence.captionIndexes,
      minWords,
      maxWords,
    });

    for (const chunk of chunks) {
      phrases.push({
        ...chunk,
        id: `phrase_${phrases.length + 1}`,
      });
    }
  }

  return phrases;
}

export function processTranscript(
  cues: TranscriptCue[]
): TranscriptPipelineResult {
  const rawCaptions = transcriptCuesToRawCaptions(cues);
  const merged = dedupeRollingCaptions(rawCaptions);
  const displayLines = finalizeTimedUnitEnds(merged);
  const sentences = finalizeTimedUnitEnds(
    mergedCaptionsToSentences(merged, rawCaptions)
  );
  const phrases = finalizeTimedUnitEnds(displayLinesToPhrases(displayLines));
  const sentenceText = sentences.map((sentence) => sentence.text).join(' ');

  return {
    rawCaptions,
    displayLines,
    sentences,
    phrases,
    sentenceText,
  };
}
