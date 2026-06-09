import {
  formatSecondsToTimestamp,
  formatTimestamp,
  parseTimestampToSeconds,
} from './timestamp';

export interface TimelineMoment {
  timestamp: string;
  seconds: number;
  description: string;
}

export interface VideoTimelineResult {
  moments: TimelineMoment[];
}

export function formatTranscriptForTimeline(
  transcript: Array<{ text: string; start?: string }>
): string {
  return transcript
    .map((line) => {
      const text = line.text.trim();
      if (!text) return '';

      const timestamp = formatTimestamp(line.start) || '00:00:00';
      return `[${timestamp}] ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

export function parseTimelineResponse(raw: string): VideoTimelineResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      moments?: Array<{
        timestamp?: string;
        description?: string;
      }>;
    };

    if (!Array.isArray(parsed.moments)) {
      return null;
    }

    const moments = parsed.moments
      .map((moment) => {
        const description = moment.description?.trim();
        if (!description) return null;

        const seconds = parseTimestampToSeconds(moment.timestamp);
        const timestamp = formatSecondsToTimestamp(seconds);

        return { timestamp, seconds, description };
      })
      .filter((moment): moment is TimelineMoment => moment !== null)
      .sort((a, b) => a.seconds - b.seconds);

    if (moments.length === 0) {
      return null;
    }

    return { moments };
  } catch {
    return null;
  }
}
