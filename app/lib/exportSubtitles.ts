import { cleanTranscriptText } from './transcriptText';
import { parseTimestampToSeconds } from './timestamp';

export interface SubtitleTranscriptItem {
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

function splitTimestamp(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: Math.floor(safe % 60),
    milliseconds: Math.round((safe % 1) * 1000),
  };
}

export function secondsToSrtTimestamp(totalSeconds: number): string {
  const { hours, minutes, seconds, milliseconds } = splitTimestamp(totalSeconds);
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)},${pad3(milliseconds)}`;
}

export function secondsToVttTimestamp(totalSeconds: number): string {
  const { hours, minutes, seconds, milliseconds } = splitTimestamp(totalSeconds);
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`;
}

function getEndSeconds(
  item: SubtitleTranscriptItem,
  index: number,
  transcript: SubtitleTranscriptItem[]
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

function getCueTimes(
  item: SubtitleTranscriptItem,
  index: number,
  transcript: SubtitleTranscriptItem[]
): { startSeconds: number; endSeconds: number; text: string } | null {
  const text = cleanTranscriptText(item.text).replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const startSeconds = parseTimestampToSeconds(item.start);
  let endSeconds = getEndSeconds(item, index, transcript);

  if (endSeconds <= startSeconds) {
    endSeconds = startSeconds + 2;
  }

  return { startSeconds, endSeconds, text };
}

export function transcriptToSrt(transcript: SubtitleTranscriptItem[]): string {
  const cues = transcript
    .map((item, index) => {
      const cue = getCueTimes(item, index, transcript);
      if (!cue) return null;

      return [
        String(index + 1),
        `${secondsToSrtTimestamp(cue.startSeconds)} --> ${secondsToSrtTimestamp(cue.endSeconds)}`,
        cue.text,
      ].join('\n');
    })
    .filter((cue): cue is string => Boolean(cue));

  return cues.length > 0 ? `${cues.join('\n\n')}\n` : '';
}

export function transcriptToVtt(transcript: SubtitleTranscriptItem[]): string {
  const cues = transcript
    .map((item, index) => {
      const cue = getCueTimes(item, index, transcript);
      if (!cue) return null;

      return `${secondsToVttTimestamp(cue.startSeconds)} --> ${secondsToVttTimestamp(cue.endSeconds)}\n${cue.text}`;
    })
    .filter((cue): cue is string => Boolean(cue));

  return cues.length > 0 ? `WEBVTT\n\n${cues.join('\n\n')}\n` : '';
}

export function downloadSubtitleFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  if (!content) return;

  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(file);
  element.href = url;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}

export function downloadSrtFile(
  transcript: SubtitleTranscriptItem[],
  filename = 'transcript.srt'
): void {
  const content = transcriptToSrt(transcript);
  const name = filename.endsWith('.srt') ? filename : `${filename}.srt`;
  downloadSubtitleFile(content, name, 'text/plain;charset=utf-8');
}

export function downloadVttFile(
  transcript: SubtitleTranscriptItem[],
  filename = 'transcript.vtt'
): void {
  const content = transcriptToVtt(transcript);
  const name = filename.endsWith('.vtt') ? filename : `${filename}.vtt`;
  downloadSubtitleFile(content, name, 'text/vtt;charset=utf-8');
}
