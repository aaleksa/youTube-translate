export const SENTENCE_LEAD_IN_SECONDS = 0.3;
export const SENTENCE_TAIL_PAD_SECONDS = 0.3;

export interface SegmentPlaybackOptions {
  leadIn?: number;
  tailPad?: number;
  repeats?: number;
  pauseBetweenRepeatsMs?: number;
}

export const DEFAULT_SEGMENT_OPTIONS: Required<SegmentPlaybackOptions> = {
  leadIn: SENTENCE_LEAD_IN_SECONDS,
  tailPad: SENTENCE_TAIL_PAD_SECONDS,
  repeats: 1,
  pauseBetweenRepeatsMs: 400,
};
