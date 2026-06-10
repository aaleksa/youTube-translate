import { startOfDay } from './flashcardSrs';
import { downloadTextFile, parseCsv, rowsToCsv } from './csvUtils';
import {
  getFlashcards,
  importFlashcardRows,
  type DuplicateStrategy,
  type Flashcard,
  type ImportFlashcardResult,
  type ImportedCardRow,
} from './flashcards';
import { getSavedTranslationLanguage } from './languageSettings';
import { notifyFlashcardsChanged } from './dataRefresh';

export type { DuplicateStrategy, ImportFlashcardResult };

export type ImportField =
  | 'word'
  | 'translation'
  | 'example'
  | 'tags'
  | 'videoId'
  | 'repetitions'
  | 'nextReview'
  | 'knownCount'
  | 'unknownCount';

export type FieldMapping = Partial<Record<ImportField, string>>;

export interface CsvExportOptions {
  includeSrs: boolean;
  includeTags: boolean;
  includeExamples: boolean;
}

const FIELD_ALIASES: Record<ImportField, string[]> = {
  word: ['word', 'english', 'front', 'term', 'vocabulary', 'expression'],
  translation: [
    'translation',
    'ukrainian',
    'back',
    'meaning',
    'translate',
    'definition',
  ],
  example: ['example', 'sentence', 'context', 'sample'],
  tags: ['tags', 'tag', 'labels'],
  videoId: ['videoid', 'video', 'video_id'],
  repetitions: ['repetitions', 'reps', 'srsrepetitions'],
  nextReview: ['nextreview', 'reviewdate', 'due', 'nextreviewdate'],
  knownCount: ['knowncount', 'known', 'correct'],
  unknownCount: ['unknowncount', 'unknown', 'incorrect'],
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function formatNextReview(nextReview?: number): string {
  if (!nextReview) return '';
  return new Date(nextReview).toISOString().slice(0, 10);
}

function parseNextReview(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return startOfDay(new Date(parsed));
}

function parseTags(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split(/[;|]/)
    .flatMap((part) => part.split(','))
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function detectFieldMapping(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as Array<
    [ImportField, string[]]
  >) {
    const match = normalizedHeaders.find((header) =>
      aliases.includes(header.normalized)
    );
    if (match) {
      mapping[field] = match.original;
    }
  }

  return mapping;
}

export function rowsFromCsv(
  headers: string[],
  rows: string[][],
  mapping: FieldMapping
): ImportedCardRow[] {
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  return rows.map((row) => {
    const valueFor = (field: ImportField): string => {
      const column = mapping[field];
      if (!column) return '';
      const index = headerIndex.get(column);
      return index === undefined ? '' : (row[index] ?? '').trim();
    };

    const word = valueFor('word');
    const tagsRaw = valueFor('tags');

    return {
      word,
      translation: valueFor('translation') || undefined,
      example: valueFor('example') || undefined,
      tags: tagsRaw ? parseTags(tagsRaw) : undefined,
      videoId: valueFor('videoId') || undefined,
      repetitions: parseOptionalNumber(valueFor('repetitions')),
      nextReview: parseNextReview(valueFor('nextReview')),
      knownCount: parseOptionalNumber(valueFor('knownCount')),
      unknownCount: parseOptionalNumber(valueFor('unknownCount')),
    };
  });
}

function cardToCsvRow(
  card: Flashcard,
  options: CsvExportOptions
): string[] {
  const row = [card.word, card.translation];

  if (options.includeExamples) {
    row.push(card.example);
  }

  if (options.includeTags) {
    row.push(card.tags.join('; '));
  }

  row.push(card.videoId ?? '');

  if (options.includeSrs) {
    row.push(
      String(card.repetitions),
      formatNextReview(card.nextReview),
      String(card.interval),
      String(card.ease),
      String(card.knownCount),
      String(card.unknownCount)
    );
  }

  return row;
}

export function exportFlashcardsCsv(options: CsvExportOptions): string {
  const headers = ['word', 'translation'];

  if (options.includeExamples) headers.push('example');
  if (options.includeTags) headers.push('tags');
  headers.push('videoId');

  if (options.includeSrs) {
    headers.push(
      'repetitions',
      'nextReview',
      'interval',
      'ease',
      'knownCount',
      'unknownCount'
    );
  }

  const rows = getFlashcards().map((card) => cardToCsvRow(card, options));
  return rowsToCsv(headers, rows);
}

export function exportAnkiCsv(): string {
  const headers = ['Front', 'Back', 'Example', 'Tags'];
  const rows = getFlashcards().map((card) => [
    card.word,
    card.translation,
    card.example,
    card.tags.join(' '),
  ]);
  return rowsToCsv(headers, rows);
}

export function downloadFlashcardsCsv(options: CsvExportOptions): void {
  const csv = exportFlashcardsCsv(options);
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(csv, `yoytube-flashcards-${date}.csv`);
}

export function downloadAnkiCsv(): void {
  const csv = exportAnkiCsv();
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(csv, `yoytube-anki-${date}.csv`);
}

export function importCsvText(
  text: string,
  mapping: FieldMapping,
  strategy: DuplicateStrategy
): ImportFlashcardResult {
  const { headers, rows } = parseCsv(text);
  const importedRows = rowsFromCsv(headers, rows, mapping).filter((row) =>
    row.word.trim()
  );
  const result = importFlashcardRows(
    importedRows,
    strategy,
    getSavedTranslationLanguage()
  );
  notifyFlashcardsChanged();
  return result;
}

export function parseCsvFile(text: string): {
  headers: string[];
  rows: string[][];
  mapping: FieldMapping;
} {
  const { headers, rows } = parseCsv(text);
  return {
    headers,
    rows,
    mapping: detectFieldMapping(headers),
  };
}

export const IMPORT_FIELDS: ImportField[] = [
  'word',
  'translation',
  'example',
  'tags',
  'videoId',
  'repetitions',
  'nextReview',
  'knownCount',
  'unknownCount',
];
