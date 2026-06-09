import { parseTimestampToSeconds } from './timestamp';

const DEFAULT_READING_WPM = 200;

export interface ReadingStatsTranscriptLine {
  text: string;
  start?: string;
  duration?: string;
}

export interface ReadingStats {
  wordCount: number;
  durationSeconds: number;
  speakingWpm: number | null;
  estimatedReadingSeconds: number;
}

function getCueEndSeconds(
  item: ReadingStatsTranscriptLine,
  index: number,
  transcript: ReadingStatsTranscriptLine[]
): number {
  const startSeconds = parseTimestampToSeconds(item.start);
  const durationValue = parseTimestampToSeconds(item.duration);

  if (item.duration?.trim() && durationValue > startSeconds) {
    return durationValue;
  }

  if (index < transcript.length - 1) {
    const nextStart = parseTimestampToSeconds(transcript[index + 1].start);
    if (nextStart > startSeconds) {
      return nextStart;
    }
  }

  const estimated = Math.max(2, Math.min(8, item.text.length / 12));
  return startSeconds + estimated;
}

export function getTranscriptDurationSeconds(
  transcript: ReadingStatsTranscriptLine[]
): number {
  if (transcript.length === 0) return 0;

  const lastIndex = transcript.length - 1;
  return getCueEndSeconds(transcript[lastIndex], lastIndex, transcript);
}

export function countTranscriptWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function calculateReadingStats(
  fullText: string,
  transcript: ReadingStatsTranscriptLine[],
  readingWpm = DEFAULT_READING_WPM
): ReadingStats {
  const wordCount = countTranscriptWords(fullText);
  const durationSeconds = getTranscriptDurationSeconds(transcript);
  const speakingWpm =
    durationSeconds > 0
      ? Math.round(wordCount / (durationSeconds / 60))
      : null;
  const estimatedReadingSeconds =
    readingWpm > 0 ? Math.round((wordCount / readingWpm) * 60) : 0;

  return {
    wordCount,
    durationSeconds,
    speakingWpm,
    estimatedReadingSeconds,
  };
}

export function formatDurationCompact(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
