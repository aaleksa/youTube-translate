import { parseTimestampToSeconds } from './timestamp';

export interface TranscriptCue {
  text: string;
  start?: string;
  duration?: string;
}

export function getCueStartSeconds(cue: TranscriptCue): number {
  return parseTimestampToSeconds(cue.start);
}

export function getCueEndSeconds(
  index: number,
  transcript: TranscriptCue[]
): number {
  const item = transcript[index];
  if (!item) return 0;

  return getTimedUnitEndSeconds(item, index, transcript);
}

export function getTimedUnitEndSeconds(
  item: TranscriptCue,
  index?: number,
  transcript?: TranscriptCue[]
): number {
  const startSeconds = getCueStartSeconds(item);
  const durationValue = parseTimestampToSeconds(item.duration);

  if (item.duration?.trim() && durationValue > startSeconds + 0.2) {
    return durationValue;
  }

  if (
    typeof index === 'number' &&
    transcript &&
    index < transcript.length - 1
  ) {
    const nextStart = getCueStartSeconds(transcript[index + 1]);
    if (nextStart > startSeconds) {
      return Math.max(startSeconds + 0.8, nextStart - 0.05);
    }
  }

  const estimated = Math.max(2, Math.min(12, item.text.length / 10));
  return startSeconds + estimated;
}
