import type { Sentence } from './transcriptTypes';

const STORAGE_KEY = 'yoytube-sentences';

export interface StoredSentence {
  id: string;
  videoId: string;
  text: string;
  startTime: number;
  endTime: number;
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function estimateSentenceEnd(startTime: number, text: string): number {
  const estimated = Math.max(2, Math.min(12, text.trim().length / 10));
  return startTime + estimated;
}

export function getSentences(): StoredSentence[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredSentence>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (sentence) =>
          sentence.id &&
          sentence.videoId &&
          sentence.text &&
          typeof sentence.startTime === 'number' &&
          typeof sentence.endTime === 'number'
      )
      .map((sentence) => ({
        id: sentence.id!,
        videoId: sentence.videoId!,
        text: sentence.text!.trim(),
        startTime: sentence.startTime!,
        endTime: Math.max(sentence.endTime!, sentence.startTime! + 0.5),
      }));
  } catch {
    return [];
  }
}

function saveSentences(sentences: StoredSentence[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences));
}

export function getSentenceById(id: string): StoredSentence | undefined {
  return getSentences().find((sentence) => sentence.id === id);
}

export function findOrCreateSentence(params: {
  videoId: string;
  text: string;
  startTime: number;
  endTime: number;
  pipelineSentenceId?: string;
}): StoredSentence {
  const text = params.text.trim();
  const normalized = normalizeText(text);
  const sentences = getSentences();

  const existing = sentences.find(
    (sentence) =>
      sentence.videoId === params.videoId &&
      normalizeText(sentence.text) === normalized
  );

  if (existing) {
    const needsTimeUpdate =
      params.endTime - params.startTime >
      existing.endTime - existing.startTime + 0.5;
    if (needsTimeUpdate) {
      const updated: StoredSentence = {
        ...existing,
        startTime: params.startTime,
        endTime: params.endTime,
      };
      saveSentences(
        sentences.map((sentence) =>
          sentence.id === existing.id ? updated : sentence
        )
      );
      return updated;
    }
    return existing;
  }

  const sentence: StoredSentence = {
    id:
      params.pipelineSentenceId ??
      `sentence_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    videoId: params.videoId,
    text,
    startTime: params.startTime,
    endTime: Math.max(params.endTime, params.startTime + 0.5),
  };

  saveSentences([sentence, ...sentences]);
  return sentence;
}

export function storedSentenceFromPipeline(
  videoId: string,
  sentence: Sentence
): StoredSentence {
  return findOrCreateSentence({
    videoId,
    text: sentence.text,
    startTime: sentence.start,
    endTime: sentence.end,
    pipelineSentenceId: sentence.id,
  });
}

export function findSentenceInTranscript(
  example: string,
  word: string,
  sentences: Sentence[]
): Sentence | undefined {
  if (!sentences.length) return undefined;

  const exampleNorm = example.trim().toLowerCase();
  const wordNorm = word.trim().toLowerCase();
  let bestMatch: { score: number; sentence: Sentence } | undefined;

  for (const sentence of sentences) {
    const lineNorm = sentence.text.toLowerCase();

    if (exampleNorm && lineNorm.includes(exampleNorm)) {
      const score = exampleNorm.length + 1000;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, sentence };
      }
      continue;
    }

    if (exampleNorm && exampleNorm.includes(lineNorm) && lineNorm.length > 8) {
      const score = lineNorm.length + 500;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, sentence };
      }
      continue;
    }

    if (wordNorm && lineNorm.includes(wordNorm)) {
      const score = wordNorm.length;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { score, sentence };
      }
    }
  }

  return bestMatch?.sentence;
}
