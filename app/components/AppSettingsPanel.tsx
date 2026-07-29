'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from './InterfaceLanguageProvider';
import GlobalTranslationLanguageSelect from './GlobalTranslationLanguageSelect';
import InterfaceLanguageSelect from './InterfaceLanguageSelect';
import ImportExportSettings from './ImportExportSettings';
import LearningSettings from './LearningSettings';
import TaskLanguageSelect from './TaskLanguageSelect';
import { topBarIconButton } from './topBarStyles';
import type { TranslationKey } from '../lib/i18n';

type SettingsTab = 'languages' | 'learning' | 'data';

const TABS: Array<{ id: SettingsTab; labelKey: TranslationKey }> = [
  { id: 'languages', labelKey: 'settings.sectionLanguages' },
  { id: 'learning', labelKey: 'settings.sectionLearning' },
  { id: 'data', labelKey: 'settings.sectionData' },
];

export default function AppSettingsPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>('languages');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t('settings.ariaLabel')}
        className={`${topBarIconButton} ${open ? 'ring-2 ring-blue-500/50' : ''}`}
      >
        ⚙️
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('settings.title')}
          className="absolute top-full right-0 z-50 mt-2 flex w-[min(22rem,calc(100vw-1.25rem))] max-h-[min(85dvh,36rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.title')}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('settings.close')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              ×
            </button>
          </div>

          <div
            role="tablist"
            aria-label={t('settings.title')}
            className="flex gap-1 border-b border-gray-200 px-2 pt-2 dark:border-gray-700"
          >
            {TABS.map(({ id, labelKey }) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`settings-tab-${id}`}
                  onClick={() => setTab(id)}
                  className={`flex-1 rounded-t-lg px-2 py-2 text-xs font-semibold transition ${
                    selected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            aria-labelledby={`settings-tab-${tab}`}
            className="min-h-0 flex-1 overflow-y-auto p-4"
          >
            {tab === 'languages' && (
              <div className="space-y-4">
                <InterfaceLanguageSelect />
                <GlobalTranslationLanguageSelect />
                <TaskLanguageSelect />
              </div>
            )}
            {tab === 'learning' && <LearningSettings embedded />}
            {tab === 'data' && <ImportExportSettings compact />}
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <Link
              href="/faq"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/50"
            >
              {t('faq.openFaq')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
