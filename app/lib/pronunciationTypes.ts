import type { PronunciationCompareResult } from './pronunciationCompare';

/** Level 4+ — Azure / dedicated pronunciation APIs */
export interface PronunciationResult {
  accuracy: number;
  fluency?: number;
  completeness: number;
  score: number;
  missedWords: string[];
  extraWords: string[];
}

export interface ShadowingAttempt {
  id: string;
  videoId: string;
  sentenceId?: string;
  phraseId?: string;
  expectedText: string;
  recognizedText: string;
  score: number;
  missedWords: string[];
  extraWords: string[];
  durationMs: number;
  createdAt: number;
}

export function toPronunciationResult(
  comparison: PronunciationCompareResult
): PronunciationResult {
  return {
    accuracy: comparison.score,
    completeness: comparison.score,
    score: comparison.score,
    missedWords: comparison.missedWords,
    extraWords: comparison.extraWords,
  };
}

export function createShadowingAttempt(input: {
  videoId: string;
  sentenceId?: string;
  phraseId?: string;
  expectedText: string;
  comparison: PronunciationCompareResult;
  durationMs: number;
}): ShadowingAttempt {
  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    videoId: input.videoId,
    sentenceId: input.sentenceId,
    phraseId: input.phraseId,
    expectedText: input.expectedText,
    recognizedText: input.comparison.spokenText,
    score: input.comparison.score,
    missedWords: input.comparison.missedWords,
    extraWords: input.comparison.extraWords,
    durationMs: input.durationMs,
    createdAt: Date.now(),
  };
}
