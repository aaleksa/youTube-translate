'use client';

import {
  TRANSLATION_LANGUAGES,
  type TranslationLanguageCode,
} from '../lib/translationLanguages';
import { useI18n } from './InterfaceLanguageProvider';

export default function TaskLanguageSelect() {
  const { t, taskLanguage, setTaskLanguage } = useI18n();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('settings.taskLanguage')}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {t('settings.taskLanguageHint')}
      </p>
      <select
        value={taskLanguage}
        onChange={(e) => setTaskLanguage(e.target.value as TranslationLanguageCode)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
