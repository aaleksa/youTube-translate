'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getLearningSettings,
  updateAutoPause,
  type AutoPauseFeature,
  type LearningSettings,
} from '../lib/learningSettings';
import { useI18n } from './InterfaceLanguageProvider';

export default function LearningSettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<LearningSettings | null>(null);
  const [open, setOpen] = useState(false);

  const autoPauseOptions = useMemo(
    (): Array<{ feature: AutoPauseFeature; label: string }> => [
      { feature: 'explainSentence', label: t('learning.explainSentence') },
      { feature: 'translateSelection', label: t('learning.translateSelection') },
      { feature: 'grammarAnalysis', label: t('learning.grammarAnalysis') },
      { feature: 'quiz', label: t('learning.quiz') },
    ],
    [t]
  );

  useEffect(() => {
    setSettings(getLearningSettings());
  }, []);

  const handleToggle = (feature: AutoPauseFeature, enabled: boolean) => {
    const next = updateAutoPause(feature, enabled);
    setSettings(next);
  };

  if (!settings) return null;

  const anyEnabled = Object.values(settings.autoPause).some(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {t('learning.title')}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('learning.hint')}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('learning.autoPauseWhen')}
          </p>
          <ul className="space-y-2">
            {autoPauseOptions.map(({ feature, label }) => (
              <li key={feature}>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoPause[feature]}
                    onChange={(e) => handleToggle(feature, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
          {!anyEnabled && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {t('learning.continuousMode')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
