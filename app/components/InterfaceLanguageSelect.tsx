'use client';

import { INTERFACE_LANGUAGES } from '../lib/i18n';
import { useI18n } from './InterfaceLanguageProvider';

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';

export default function InterfaceLanguageSelect() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div>
      <label
        htmlFor="interface-language"
        className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
      >
        {t('interfaceLanguage.label')}
      </label>
      <select
        id="interface-language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className={selectClass}
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
