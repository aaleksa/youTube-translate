'use client';

import { INTERFACE_LANGUAGES } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

export default function InterfaceLanguageSelect() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
      <label
        htmlFor="interface-language"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {t('interfaceLanguage.label')}
      </label>
      <select
        id="interface-language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {INTERFACE_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
