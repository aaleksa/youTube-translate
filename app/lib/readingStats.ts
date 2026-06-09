import {
  getCueEndSeconds,
  type TranscriptCue,
} from './transcriptCue';

const DEFAULT_READING_WPM = 200;

export type ReadingStatsTranscriptLine = TranscriptCue;

export interface ReadingStats {
  wordCount: number;
  durationSeconds: number;
  speakingWpm: number | null;
  estimatedReadingSeconds: number;
}

export function getTranscriptDurationSeconds(
  transcript: ReadingStatsTranscriptLine[]
): number {
  if (transcript.length === 0) return 0;

  const lastIndex = transcript.length - 1;
  return getCueEndSeconds(lastIndex, transcript);
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
