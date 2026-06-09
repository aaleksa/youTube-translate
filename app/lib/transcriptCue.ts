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

  const startSeconds = getCueStartSeconds(item);
  const durationValue = parseTimestampToSeconds(item.duration);

  if (item.duration?.trim() && durationValue > startSeconds) {
    return durationValue;
  }

  if (index < transcript.length - 1) {
    const nextStart = getCueStartSeconds(transcript[index + 1]);
    if (nextStart > startSeconds) {
      return nextStart;
    }
  }

  const estimated = Math.max(2, Math.min(8, item.text.length / 12));
  return startSeconds + estimated;
}
