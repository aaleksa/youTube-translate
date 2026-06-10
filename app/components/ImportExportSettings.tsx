'use client';

import { useRef, useState } from 'react';
import { downloadBackup, importBackupFromText } from '../lib/flashcardBackup';
import {
  downloadAnkiCsv,
  downloadFlashcardsCsv,
  IMPORT_FIELDS,
  importCsvText,
  parseCsvFile,
  type DuplicateStrategy,
  type FieldMapping,
  type ImportField,
  type ImportFlashcardResult,
} from '../lib/flashcardImportExport';
import type { TranslationKey } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

const FIELD_LABELS: Record<ImportField, TranslationKey> = {
  word: 'importExport.fieldWord',
  translation: 'importExport.fieldTranslation',
  example: 'importExport.fieldExample',
  tags: 'importExport.fieldTags',
  videoId: 'importExport.fieldVideoId',
  repetitions: 'importExport.fieldRepetitions',
  nextReview: 'importExport.fieldNextReview',
  knownCount: 'importExport.fieldKnownCount',
  unknownCount: 'importExport.fieldUnknownCount',
};

export default function ImportExportSettings() {
  const { t } = useI18n();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [includeSrs, setIncludeSrs] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<DuplicateStrategy>('skip');

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvText, setCsvText] = useState('');
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importResult, setImportResult] = useState<ImportFlashcardResult | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetImportState = () => {
    setCsvHeaders([]);
    setCsvText('');
    setFieldMapping({});
    setImportResult(null);
  };

  const handleCsvFile = async (file: File) => {
    setErrorMessage('');
    setImportResult(null);
    const text = await file.text();
    const parsed = parseCsvFile(text);

    if (!parsed.headers.length) {
      setErrorMessage(t('importExport.errorEmptyCsv'));
      return;
    }

    if (!parsed.mapping.word) {
      setErrorMessage(t('importExport.errorNoWordColumn'));
    }

    setCsvText(text);
    setCsvHeaders(parsed.headers);
    setFieldMapping(parsed.mapping);
  };

  const handleImportCsv = () => {
    if (!csvText.trim() || !fieldMapping.word) {
      setErrorMessage(t('importExport.errorNoWordColumn'));
      return;
    }

    try {
      const result = importCsvText(csvText, fieldMapping, duplicateStrategy);
      setImportResult(result);
      setStatusMessage(
        t('importExport.importSummary', {
          imported: result.imported + result.replaced + result.merged,
          skipped: result.skipped,
        })
      );
      setErrorMessage('');
      setCsvHeaders([]);
      setCsvText('');
      setFieldMapping({});
    } catch {
      setErrorMessage(t('importExport.errorImportFailed'));
    }
  };

  const handleBackupFile = async (file: File) => {
    setErrorMessage('');
    setStatusMessage('');
    try {
      const text = await file.text();
      const backup = importBackupFromText(text);
      setStatusMessage(
        t('importExport.backupRestored', { count: backup.cards.length })
      );
    } catch {
      setErrorMessage(t('importExport.errorBackupFailed'));
    }
  };

  const updateMapping = (field: ImportField, column: string) => {
    setFieldMapping((current) => {
      const next = { ...current };
      if (!column) {
        delete next[field];
      } else {
        next[field] = column;
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {t('importExport.exportTitle')}
        </h3>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSrs}
              onChange={(e) => setIncludeSrs(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            {t('importExport.includeSrs')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTags}
              onChange={(e) => setIncludeTags(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            {t('importExport.includeTags')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeExamples}
              onChange={(e) => setIncludeExamples(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            {t('importExport.includeExamples')}
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              downloadFlashcardsCsv({
                includeSrs,
                includeTags,
                includeExamples,
              })
            }
            className="w-full px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {t('importExport.exportCsv')}
          </button>
          <button
            type="button"
            onClick={() => downloadAnkiCsv()}
            className="w-full px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {t('importExport.exportAnki')}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {t('importExport.importTitle')}
        </h3>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleCsvFile(file);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => csvInputRef.current?.click()}
          className="w-full px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          {t('importExport.chooseCsv')}
        </button>

        {csvHeaders.length > 0 && (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('importExport.mappingHint')}
            </p>
            {IMPORT_FIELDS.map((field) => (
              <div key={field} className="flex items-center gap-2">
                <label className="w-24 shrink-0 text-xs text-gray-600 dark:text-gray-400">
                  {t(FIELD_LABELS[field])}
                </label>
                <select
                  value={fieldMapping[field] ?? ''}
                  onChange={(e) => updateMapping(field, e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                >
                  <option value="">{t('importExport.columnSkip')}</option>
                  {csvHeaders.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('importExport.duplicates')}
              </p>
              <select
                value={duplicateStrategy}
                onChange={(e) =>
                  setDuplicateStrategy(e.target.value as DuplicateStrategy)
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              >
                <option value="skip">{t('importExport.duplicateSkip')}</option>
                <option value="replace">
                  {t('importExport.duplicateReplace')}
                </option>
                <option value="merge">{t('importExport.duplicateMerge')}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleImportCsv}
              className="w-full px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              {t('importExport.importCsv')}
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {t('importExport.backupTitle')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('importExport.backupHint')}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => downloadBackup()}
            className="w-full px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
          >
            {t('importExport.exportBackup')}
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleBackupFile(file);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => backupInputRef.current?.click()}
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
          >
            {t('importExport.importBackup')}
          </button>
        </div>
      </div>

      {importResult && (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          {t('importExport.importDetail', {
            imported: importResult.imported,
            replaced: importResult.replaced,
            merged: importResult.merged,
            skipped: importResult.skipped,
          })}
        </p>
      )}

      {statusMessage && (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          {statusMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
