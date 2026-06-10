import { getCueEndSeconds, type TranscriptCue } from './transcriptCue';
import { parseTimestampToSeconds } from './timestamp';
import type {
  PhraseChunk,
  RawCaption,
  Sentence,
  TranscriptPipelineResult,
} from './transcriptTypes';

const ROLLING_GAP_SECONDS = 2.5;
const SENTENCE_GAP_SECONDS = 4;
const SHADOWING_MIN_WORDS = 3;
const SHADOWING_MAX_WORDS = 8;

function normalizeCompare(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.!?,;:]+$/g, '').trim();
}

function endsSentence(text: string): boolean {
  return /[.!?]["']?\s*$/.test(text.trim());
}

function isStaleOverlapPrefix(complete: RawCaption, fragment: RawCaption): boolean {
  if (!endsSentence(complete.text)) return false;

  const completeNorm = normalizeCompare(complete.text);
  const fragmentNorm = normalizeCompare(fragment.text);
  if (!fragmentNorm || fragmentNorm === completeNorm) return true;
  if (completeNorm.startsWith(fragmentNorm) || fragmentNorm.startsWith(completeNorm)) {
    return true;
  }

  const tailWord = completeNorm.split(' ').pop() ?? '';
  return tailWord.length > 2 && fragmentNorm.startsWith(tailWord);
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

function mergeCaptionGroup(group: RawCaption[]): RawCaption {
  const longest = group.reduce((best, current) =>
    current.text.length > best.text.length ? current : best
  );

  return {
    index: group[0].index,
    text: longest.text.trim(),
    start: Math.min(...group.map((item) => item.start)),
    end: Math.max(...group.map((item) => item.end)),
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

    const closeInTime = current.start - prev.start <= ROLLING_GAP_SECONDS;
    const rolling = isRollingContinuation(prev, current);

    if (closeInTime && rolling) {
      group.push(current);
      continue;
    }

    merged.push(prev);
    if (isStaleOverlapPrefix(prev, current)) {
      group = [];
      continue;
    }
    group = [current];
  }

  if (group.length > 0) {
    merged.push(mergeCaptionGroup(group));
  }

  return merged
    .filter((item) => item.text.trim())
    .filter((item, index, items) => {
      const previous = items[index - 1];
      if (previous && isStaleOverlapPrefix(previous, item)) {
        return false;
      }

      const norm = normalizeCompare(item.text);
      return !items.some((other, otherIndex) => {
        if (otherIndex === index) return false;
        const otherNorm = normalizeCompare(other.text);
        return otherNorm.length > norm.length && otherNorm.includes(norm);
      });
    });
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

function estimatePhraseTiming(
  sentence: Sentence,
  startWord: number,
  endWord: number,
  totalWords: number
): { start: number; end: number } {
  if (totalWords <= 0) {
    return { start: sentence.start, end: sentence.end };
  }

  const duration = Math.max(sentence.end - sentence.start, 0.5);
  const startRatio = startWord / totalWords;
  const endRatio = endWord / totalWords;

  return {
    start: sentence.start + duration * startRatio,
    end: sentence.start + duration * endRatio,
  };
}

export function sentencesToPhrases(
  sentences: Sentence[],
  minWords = SHADOWING_MIN_WORDS,
  maxWords = SHADOWING_MAX_WORDS
): PhraseChunk[] {
  const phrases: PhraseChunk[] = [];

  for (const sentence of sentences) {
    const words = sentence.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    if (words.length <= maxWords) {
      phrases.push({
        id: `phrase_${phrases.length + 1}`,
        text: sentence.text,
        start: sentence.start,
        end: sentence.end,
        sentenceId: sentence.id,
        captionIndexes: sentence.captionIndexes,
      });
      continue;
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
        const timing = estimatePhraseTiming(sentence, 0, words.length, words.length);
        previous.end = timing.end;
        break;
      }

      const sliceEnd = index + chunkSize;
      const text = words.slice(index, sliceEnd).join(' ');
      const timing = estimatePhraseTiming(sentence, index, sliceEnd, words.length);

      phrases.push({
        id: `phrase_${phrases.length + 1}`,
        text,
        start: timing.start,
        end: timing.end,
        sentenceId: sentence.id,
        captionIndexes: sentence.captionIndexes,
      });

      index = sliceEnd;
    }
  }

  return phrases;
}

export function processTranscript(
  cues: TranscriptCue[]
): TranscriptPipelineResult {
  const rawCaptions = transcriptCuesToRawCaptions(cues);
  const merged = dedupeRollingCaptions(rawCaptions);
  const sentences = finalizeTimedUnitEnds(
    mergedCaptionsToSentences(merged, rawCaptions)
  );
  const phrases = finalizeTimedUnitEnds(sentencesToPhrases(sentences));
  const sentenceText = sentences.map((sentence) => sentence.text).join(' ');

  return {
    rawCaptions,
    sentences,
    phrases,
    sentenceText,
  };
}
