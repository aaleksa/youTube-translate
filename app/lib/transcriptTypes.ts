import type { TranscriptCue } from './transcriptCue';

export interface RawCaption {
  index: number;
  text: string;
  start: number;
  end: number;
}

export interface Sentence {
  id: string;
  text: string;
  start: number;
  end: number;
  captionIndexes: number[];
}

export interface PhraseChunk {
  id: string;
  text: string;
  start: number;
  end: number;
  sentenceId: string;
  captionIndexes: number[];
}

export interface TranscriptPipelineResult {
  rawCaptions: RawCaption[];
  sentences: Sentence[];
  phrases: PhraseChunk[];
  sentenceText: string;
}

export function timedUnitToCue(unit: {
  text: string;
  start: number;
  end: number;
}): TranscriptCue {
  return {
    text: unit.text,
    start: unit.start.toString(),
    duration: unit.end.toString(),
  };
}

export function timedUnitsToCues(
  units: Array<{ text: string; start: number; end: number }>
): TranscriptCue[] {
  return units.map(timedUnitToCue);
}
