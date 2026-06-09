import type { TranslationKey } from './i18n/messages';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface VideoDifficultyResult {
  level: CefrLevel;
  explanation: string;
}

export function isCefrLevel(value: string): value is CefrLevel {
  return CEFR_LEVELS.includes(value as CefrLevel);
}

export function parseDifficultyResponse(raw: string): VideoDifficultyResult | null {
  try {
    const parsed = JSON.parse(raw) as {
      level?: string;
      explanation?: string;
    };

    const level = parsed.level?.trim().toUpperCase();
    const explanation = parsed.explanation?.trim();

    if (!level || !isCefrLevel(level) || !explanation) return null;

    return { level, explanation };
  } catch {
    const levelMatch = raw.match(/\b(A1|A2|B1|B2|C1|C2)\b/i);
    if (!levelMatch) return null;

    const level = levelMatch[1].toUpperCase() as CefrLevel;
    const explanation = raw
      .replace(levelMatch[0], '')
      .replace(/[{}"[\]]/g, '')
      .trim();

    if (!explanation) return null;

    return { level, explanation };
  }
}

export function getCefrLevelStyle(level: CefrLevel): string {
  switch (level) {
    case 'A1':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'A2':
      return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
    case 'B1':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'B2':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
    case 'C1':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'C2':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
  }
}

export const CEFR_LEVEL_LABEL_KEYS: Record<CefrLevel, TranslationKey> = {
  A1: 'cefr.A1',
  A2: 'cefr.A2',
  B1: 'cefr.B1',
  B2: 'cefr.B2',
  C1: 'cefr.C1',
  C2: 'cefr.C2',
};
