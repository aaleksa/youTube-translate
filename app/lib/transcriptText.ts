export function cleanTranscriptText(text: string): string {
  return text
    .replace(/&gt;&gt;/gi, ' ')
    .replace(/>>+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
