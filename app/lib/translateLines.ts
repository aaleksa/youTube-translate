const CHUNK_SIZE = 40;

export async function translateAllLines(
  lines: string[],
  targetLanguage: string,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const translations: string[] = [];

  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, i + CHUNK_SIZE);
    const response = await fetch('/api/translate-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: chunk, targetLanguage }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to translate lines');
    }

    translations.push(...data.translations);
    onProgress?.(Math.min(i + chunk.length, lines.length), lines.length);
  }

  return translations;
}
