'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from './InterfaceLanguageProvider';
import GlobalTranslationLanguageSelect from './GlobalTranslationLanguageSelect';
import InterfaceLanguageSelect from './InterfaceLanguageSelect';
import LearningSettings from './LearningSettings';
import TaskLanguageSelect from './TaskLanguageSelect';

const topBarButtonClass =
  'p-2.5 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-md';

export default function AppSettingsPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
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
        className={`${topBarButtonClass} ${open ? 'ring-2 ring-blue-500/50' : ''}`}
      >
        ⚙️
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('settings.title')}
          className="absolute top-full right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg p-4"
        >
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {t('settings.title')}
          </h2>
          <div className="space-y-5">
            <InterfaceLanguageSelect />
            <GlobalTranslationLanguageSelect />
            <TaskLanguageSelect />
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <LearningSettings embedded />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
