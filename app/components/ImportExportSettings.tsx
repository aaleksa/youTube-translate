'use client';

import { useRef, useState, type ReactNode } from 'react';
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

type DataSection = 'export' | 'import' | 'backup';

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: DataSection;
  title: string;
  open: boolean;
  onToggle: (id: DataSection) => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-2 bg-gray-50 px-3 py-2.5 text-left text-sm font-semibold text-gray-800 transition hover:bg-gray-100 dark:bg-gray-900/50 dark:text-gray-100 dark:hover:bg-gray-900"
      >
        <span>{title}</span>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="space-y-3 border-t border-gray-200 p-3 dark:border-gray-600">{children}</div>}
    </div>
  );
}

const primaryBtn =
  'w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700';
const secondaryBtn =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
const accentBtn =
  'w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700';
const successBtn =
  'w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700';
const violetBtn =
  'w-full rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700';

interface ImportExportSettingsProps {
  compact?: boolean;
}

export default function ImportExportSettings({
  compact = false,
}: ImportExportSettingsProps) {
  const { t } = useI18n();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [includeSrs, setIncludeSrs] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<DuplicateStrategy>('skip');
  const [openSection, setOpenSection] = useState<DataSection | null>(
    compact ? 'export' : null
  );

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvText, setCsvText] = useState('');
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importResult, setImportResult] = useState<ImportFlashcardResult | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleSection = (id: DataSection) => {
    setOpenSection((current) => (current === id ? null : id));
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
    setOpenSection('import');
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

  const exportBody = (
    <>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
          className={primaryBtn}
        >
          {t('importExport.exportCsv')}
        </button>
        <button type="button" onClick={() => downloadAnkiCsv()} className={accentBtn}>
          {t('importExport.exportAnki')}
        </button>
      </div>
    </>
  );

  const importBody = (
    <>
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
        className={secondaryBtn}
      >
        {t('importExport.chooseCsv')}
      </button>

      {csvHeaders.length > 0 && (
        <div className="space-y-3">
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
                className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
            <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('importExport.duplicates')}
            </p>
            <select
              value={duplicateStrategy}
              onChange={(e) =>
                setDuplicateStrategy(e.target.value as DuplicateStrategy)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="skip">{t('importExport.duplicateSkip')}</option>
              <option value="replace">{t('importExport.duplicateReplace')}</option>
              <option value="merge">{t('importExport.duplicateMerge')}</option>
            </select>
          </div>

          <button type="button" onClick={handleImportCsv} className={successBtn}>
            {t('importExport.importCsv')}
          </button>
        </div>
      )}
    </>
  );

  const backupBody = (
    <>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('importExport.backupHint')}
      </p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => downloadBackup()} className={violetBtn}>
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
          className={secondaryBtn}
        >
          {t('importExport.importBackup')}
        </button>
      </div>
    </>
  );

  const statusBlock = (
    <>
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
        <p className="text-xs text-emerald-700 dark:text-emerald-300">{statusMessage}</p>
      )}
      {errorMessage && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <Section
          id="export"
          title={t('importExport.exportTitle')}
          open={openSection === 'export'}
          onToggle={toggleSection}
        >
          {exportBody}
        </Section>
        <Section
          id="import"
          title={t('importExport.importTitle')}
          open={openSection === 'import'}
          onToggle={toggleSection}
        >
          {importBody}
        </Section>
        <Section
          id="backup"
          title={t('importExport.backupTitle')}
          open={openSection === 'backup'}
          onToggle={toggleSection}
        >
          {backupBody}
        </Section>
        {statusBlock}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('importExport.exportTitle')}
        </h3>
        {exportBody}
      </div>
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('importExport.importTitle')}
        </h3>
        {importBody}
      </div>
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('importExport.backupTitle')}
        </h3>
        {backupBody}
      </div>
      {statusBlock}
    </div>
  );
}


