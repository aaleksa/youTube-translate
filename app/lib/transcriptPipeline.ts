import { processTranscript } from './normalizeCaptions';
import type { TranscriptCue } from './transcriptCue';
import type { PhraseChunk, RawCaption, Sentence } from './transcriptTypes';
import { timedUnitsToCues } from './transcriptTypes';

export interface ProcessedTranscriptFields {
  rawCaptions: RawCaption[];
  sentences: Sentence[];
  phrases: PhraseChunk[];
  text: string;
}

export function getDisplayTranscript(
  sentences: Sentence[] | undefined,
  rawTranscript: TranscriptCue[]
): TranscriptCue[] {
  if (sentences?.length) {
    return timedUnitsToCues(sentences);
  }

  return rawTranscript;
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
  return {
    ...data,
    rawCaptions: processed.rawCaptions,
    sentences: processed.sentences,
    phrases: processed.phrases,
    text: processed.sentenceText || data.text,
  };
}
