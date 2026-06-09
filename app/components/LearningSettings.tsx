'use client';

import { useEffect, useState } from 'react';
import {
  getLearningSettings,
  updateAutoPause,
  type AutoPauseFeature,
  type LearningSettings,
} from '../lib/learningSettings';

const AUTO_PAUSE_OPTIONS: Array<{
  feature: AutoPauseFeature;
  label: string;
}> = [
  { feature: 'explainSentence', label: 'Explain Sentence' },
  { feature: 'translateSelection', label: 'Translate Selection' },
  { feature: 'grammarAnalysis', label: 'Grammar Analysis' },
  { feature: 'quiz', label: 'Quiz' },
];

export default function LearningSettings() {
  const [settings, setSettings] = useState<LearningSettings | null>(null);
  const [open, setOpen] = useState(false);

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
          Learning Settings
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            За замовчуванням відео не зупиняється. Увімкніть автопаузу для режиму
            детального навчання.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Auto-pause video when:
          </p>
          <ul className="space-y-2">
            {AUTO_PAUSE_OPTIONS.map(({ feature, label }) => (
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
              Режим безперервного перегляду.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
