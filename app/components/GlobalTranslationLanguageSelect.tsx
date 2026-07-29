'use client';

import {
  TRANSLATION_LANGUAGES,
  type TranslationLanguageCode,
} from '../lib/translationLanguages';
import { useI18n } from './InterfaceLanguageProvider';

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';

export default function GlobalTranslationLanguageSelect() {
  const { t, translationLanguage, setTranslationLanguage } = useI18n();

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
        {t('settings.translationLanguage')}
      </label>
      <p className="mb-1.5 text-xs text-gray-500 dark:text-gray-400">
        {t('settings.translationLanguageHint')}
      </p>
      <select
        value={translationLanguage}
        onChange={(e) =>
          setTranslationLanguage(e.target.value as TranslationLanguageCode)
        }
        className={selectClass}
      >
        {TRANSLATION_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
