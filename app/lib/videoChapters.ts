import {
  formatSecondsToTimestamp,
  parseTimestampToSeconds,
} from './timestamp';
import { formatTranscriptForTimeline } from './videoTimeline';

export interface VideoChapter {
  timestamp: string;
  seconds: number;
  title: string;
}

export interface VideoChaptersResult {
  chapters: VideoChapter[];
}

export { formatTranscriptForTimeline as formatTranscriptForChapters };

export function parseChaptersResponse(raw: string): VideoChaptersResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      chapters?: Array<{
        timestamp?: string;
        title?: string;
      }>;
    };

    if (!Array.isArray(parsed.chapters)) {
      return null;
    }

    const chapters = parsed.chapters
      .map((chapter) => {
        const title = chapter.title?.trim();
        if (!title) return null;

        const seconds = parseTimestampToSeconds(chapter.timestamp);
        const timestamp = formatSecondsToTimestamp(seconds);

        return { timestamp, seconds, title };
      })
      .filter((chapter): chapter is VideoChapter => chapter !== null)
      .sort((a, b) => a.seconds - b.seconds);

    if (chapters.length === 0) {
      return null;
    }

    return { chapters };
  } catch {
    return null;
  }
}
