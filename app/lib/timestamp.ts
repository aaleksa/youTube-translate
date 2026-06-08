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
