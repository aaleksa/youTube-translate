'use client';

import { useMemo } from 'react';
import {
  calculateReadingStats,
  formatDurationCompact,
} from '../lib/readingStats';
import { useI18n } from './InterfaceLanguageProvider';

interface ReadingStatsPanelProps {
  fullText: string;
  transcript: Array<{ text: string; start?: string; duration?: string }>;
}

export default function ReadingStatsPanel({
  fullText,
  transcript,
}: ReadingStatsPanelProps) {
  const { t } = useI18n();
  const stats = useMemo(
    () => calculateReadingStats(fullText, transcript),
    [fullText, transcript]
  );

  return (
    <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/80">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {t('quickInfo.duration')}
        </p>
        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
          {formatDurationCompact(stats.durationSeconds)}
        </p>
      </div>
      <div>
        <p
          className="text-xs text-gray-600 dark:text-gray-400"
          title={t('quickInfo.wpmHint')}
        >
          {t('quickInfo.wpm')}
        </p>
        <p className="text-lg font-bold text-rose-600 dark:text-rose-400 tabular-nums">
          {stats.speakingWpm ?? '—'}
        </p>
      </div>
      <div>
        <p
          className="text-xs text-gray-600 dark:text-gray-400"
          title={t('quickInfo.readingTimeHint')}
        >
          {t('quickInfo.readingTime')}
        </p>
        <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 font-mono tabular-nums">
          {formatDurationCompact(stats.estimatedReadingSeconds)}
        </p>
      </div>
    </div>
  );
}
