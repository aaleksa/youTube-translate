export function formatSecondsToTimestamp(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = Math.floor(safe % 60);

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':');
}

export function formatTimestamp(timestamp?: string): string {
  if (!timestamp) return '';

  const cleaned = timestamp.replace(',', '.');

  if (/^\d{1,2}:\d{2}:\d{2}\.\d+$/.test(cleaned)) {
    return cleaned.split('.')[0];
  }

  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    const totalSeconds = parseFloat(cleaned);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
      .map((part) => part.toString().padStart(2, '0'))
      .join(':');
  }

  return cleaned;
}

export function parseTimestampToSeconds(timestamp?: string): number {
  if (!timestamp) return 0;

  const cleaned = timestamp.replace(',', '.');

  if (/^\d+(\.\d+)?$/.test(cleaned)) {
    return parseFloat(cleaned);
  }

  const parts = cleaned.split(':').map((part) => parseFloat(part));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return 0;
}

export function findActiveLineIndex(
  transcript: Array<{ start?: string }>,
  currentSeconds: number
): number {
  if (transcript.length === 0) return 0;

  let active = 0;
  for (let i = 0; i < transcript.length; i++) {
    const start = parseTimestampToSeconds(transcript[i].start);
    if (start <= currentSeconds + 0.25) {
      active = i;
    } else {
      break;
    }
  }

  return active;
}

export function ensureTranscriptTimestamps<
  T extends { text: string; start?: string; duration?: string },
>(transcript: T[]): T[] {
  let lastSeconds = 0;

  return transcript.map((item, index) => {
    const trimmedStart = item.start?.trim();
    if (trimmedStart) {
      lastSeconds = parseTimestampToSeconds(trimmedStart);
      return { ...item, start: trimmedStart };
    }

    const start = index === 0 ? '0' : lastSeconds.toString();
    return { ...item, start };
  });
}
