import { cleanTranscriptText } from './transcriptText';
import { parseTimestampToSeconds } from './timestamp';

export interface SrtTranscriptItem {
  text: string;
  start?: string;
  duration?: string;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function pad3(value: number): string {
  return value.toString().padStart(3, '0');
}

export function secondsToSrtTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);
  const milliseconds = Math.round((safe % 1) * 1000);

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)},${pad3(milliseconds)}`;
}

function getEndSeconds(
  item: SrtTranscriptItem,
  index: number,
  transcript: SrtTranscriptItem[]
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

function formatSrtCue(
  index: number,
  item: SrtTranscriptItem,
  transcript: SrtTranscriptItem[]
): string | null {
  const text = cleanTranscriptText(item.text).replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const startSeconds = parseTimestampToSeconds(item.start);
  let endSeconds = getEndSeconds(item, index, transcript);

  if (endSeconds <= startSeconds) {
    endSeconds = startSeconds + 2;
  }

  return [
    String(index + 1),
    `${secondsToSrtTimestamp(startSeconds)} --> ${secondsToSrtTimestamp(endSeconds)}`,
    text,
  ].join('\n');
}

export function transcriptToSrt(transcript: SrtTranscriptItem[]): string {
  const cues = transcript
    .map((item, index) => formatSrtCue(index, item, transcript))
    .filter((cue): cue is string => Boolean(cue));

  return cues.length > 0 ? `${cues.join('\n\n')}\n` : '';
}

export function downloadSrtFile(
  transcript: SrtTranscriptItem[],
  filename = 'transcript.srt'
): void {
  const content = transcriptToSrt(transcript);
  if (!content) return;

  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(file);
  element.href = url;
  element.download = filename.endsWith('.srt') ? filename : `${filename}.srt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}
