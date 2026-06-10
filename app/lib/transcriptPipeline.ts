import { processTranscript } from './normalizeCaptions';
import type { TranscriptCue } from './transcriptCue';
import type {
  PhraseChunk,
  RawCaption,
  Sentence,
  ShadowingUnits,
} from './transcriptTypes';
import { timedUnitsToCues } from './transcriptTypes';

export interface ProcessedTranscriptFields {
  rawCaptions: RawCaption[];
  displayLines: RawCaption[];
  displayTranscript: TranscriptCue[];
  sentences: Sentence[];
  phrases: PhraseChunk[];
  shadowingUnits: ShadowingUnits;
  text: string;
  normalizedText: string;
}

export function mapRawCaptionIndexesToDisplayIndexes(
  displayLines: RawCaption[],
  rawIndexes: number[]
): number[] {
  if (rawIndexes.length === 0) return [];

  const rawSet = new Set(rawIndexes);
  const matches = displayLines
    .map((line, index) =>
      line.captionIndexes.some((captionIndex) => rawSet.has(captionIndex))
        ? index
        : -1
    )
    .filter((index) => index >= 0);

  return matches.length > 0 ? matches : rawIndexes;
}

export function getRawTranscriptText(transcript: TranscriptCue[]): string {
  return transcript
    .map((line) => line.text.trim())
    .filter(Boolean)
    .join(' ');
}

export function enrichTranscriptData<
  T extends {
    transcript: TranscriptCue[];
    text: string;
    sentences?: Sentence[];
    phrases?: PhraseChunk[];
    rawCaptions?: RawCaption[];
  },
>(data: T): T & ProcessedTranscriptFields {
  const processed = processTranscript(data.transcript);
  const rawText = getRawTranscriptText(data.transcript) || data.text;
  return {
    ...data,
    rawCaptions: processed.rawCaptions,
    displayLines: processed.displayLines,
    displayTranscript: timedUnitsToCues(processed.displayLines),
    sentences: processed.sentences,
    phrases: processed.phrases,
    shadowingUnits: processed.shadowingUnits,
    text: rawText,
    normalizedText: processed.sentenceText,
  };
}
