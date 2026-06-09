'use client';

import {
  TRANSLATION_LANGUAGES,
  type TranslationLanguage,
} from '../lib/translationLanguages';
import { useI18n } from './InterfaceLanguageProvider';

interface TranslationLanguageSelectProps {
  selectedLanguage: string;
  isLoading?: boolean;
  translationEnabled?: boolean;
  translationShortCode?: string;
  translateProgress?: { done: number; total: number };
  hasTranslations?: boolean;
  onChange: (languageCode: string) => void;
  onToggleTranslation?: () => void;
  onRetranslate?: () => void;
  onCancelTranslation?: () => void;
}

export default function TranslationLanguageSelect({
  selectedLanguage,
  isLoading = false,
  translationEnabled = false,
  translationShortCode = 'UK',
  translateProgress = { done: 0, total: 0 },
  hasTranslations = false,
  onChange,
  onToggleTranslation,
  onRetranslate,
  onCancelTranslation,
}: TranslationLanguageSelectProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label
          htmlFor="translation-language"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('transcript.translationLanguage')}
        </label>
        {translationEnabled && !isLoading && (
          <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
            {t('transcript.sideBySideMode')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-stretch gap-2">
        <select
          id="translation-language"
          value={selectedLanguage}
          disabled={isLoading}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-[10rem] px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/60 disabled:opacity-50"
        >
          {TRANSLATION_LANGUAGES.map((language: TranslationLanguage) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>

        {onToggleTranslation && (
          <button
            type="button"
            onClick={onToggleTranslation}
            disabled={isLoading}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              translationEnabled
                ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-700 dark:hover:text-teal-300'
            }`}
          >
            {isLoading
              ? `${translateProgress.done}/${translateProgress.total}`
              : translationEnabled
                ? t('transcript.translationOn', { code: translationShortCode })
                : t('transcript.enableTranslation')}
          </button>
        )}

        {translationEnabled && hasTranslations && !isLoading && onRetranslate && (
          <button
            type="button"
            onClick={onRetranslate}
            title={t('transcript.retranslate')}
            aria-label={t('transcript.retranslate')}
            className="shrink-0 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            🔄
          </button>
        )}
      </div>

      {isLoading && (
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{
                width:
                  translateProgress.total > 0
                    ? `${(translateProgress.done / translateProgress.total) * 100}%`
                    : '0%',
              }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('transcript.translating', {
                done: translateProgress.done,
                total: translateProgress.total,
              })}
            </p>
            {onCancelTranslation && (
              <button
                type="button"
                onClick={onCancelTranslation}
                className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
              >
                {t('transcript.cancelTranslation')}
              </button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !translationEnabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('transcript.translationHint')}
        </p>
      )}
    </div>
  );
}
