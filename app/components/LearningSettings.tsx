'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getFlashcardSettings,
  updateAutoEnrichNewCards,
  type FlashcardSettings,
} from '../lib/flashcardSettings';
import {
  getLearningSettings,
  updateAutoPause,
  type AutoPauseFeature,
  type LearningSettings,
} from '../lib/learningSettings';
import { useI18n } from './InterfaceLanguageProvider';

interface LearningSettingsProps {
  embedded?: boolean;
}

function ToggleRow({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 dark:border-gray-600 dark:bg-gray-900/40">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          {label}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500"
      />
    </label>
  );
}

export default function LearningSettings({ embedded = false }: LearningSettingsProps) {
  const { t } = useI18n();
  const [settings, setSettings] = useState<LearningSettings | null>(null);
  const [flashcardSettings, setFlashcardSettings] =
    useState<FlashcardSettings | null>(null);
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
    setFlashcardSettings(getFlashcardSettings());
  }, []);

  const handleToggle = (feature: AutoPauseFeature, enabled: boolean) => {
    const next = updateAutoPause(feature, enabled);
    setSettings(next);
  };

  if (!settings || !flashcardSettings) return null;

  const anyEnabled = Object.values(settings.autoPause).some(Boolean);
  const isOpen = embedded || open;

  const content = (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('learning.hint')}</p>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('learning.autoPauseWhen')}
        </p>
        <ul className="space-y-2">
          {autoPauseOptions.map(({ feature, label }) => (
            <li key={feature}>
              <ToggleRow
                checked={settings.autoPause[feature]}
                label={label}
                onChange={(enabled) => handleToggle(feature, enabled)}
              />
            </li>
          ))}
        </ul>
        {!anyEnabled && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('learning.continuousMode')}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Flashcards
        </p>
        <ToggleRow
          checked={flashcardSettings.autoEnrichNewCards}
          label={t('enrichment.autoEnrich')}
          hint={t('enrichment.autoEnrichHint')}
          onChange={(enabled) =>
            setFlashcardSettings(updateAutoEnrichNewCards(enabled))
          }
        />
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

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

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {content}
        </div>
      )}
    </div>
  );
}
