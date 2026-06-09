'use client';

import { formatDurationCompact } from '../lib/readingStats';
import { useI18n } from './InterfaceLanguageProvider';

interface VideoMetadataPanelProps {
  title?: string;
  channelName?: string;
  durationSeconds?: number;
  subtitleLanguageName?: string;
  subtitleLanguageKind?: 'manual' | 'auto';
}

function MetadataItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-600 dark:text-gray-400">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100 break-words ${
          mono ? 'font-mono tabular-nums' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function VideoMetadataPanel({
  title,
  channelName,
  durationSeconds,
  subtitleLanguageName,
  subtitleLanguageKind,
}: VideoMetadataPanelProps) {
  const { t } = useI18n();

  const durationValue =
    typeof durationSeconds === 'number' && durationSeconds > 0
      ? formatDurationCompact(durationSeconds)
      : '—';

  const subtitleValue = subtitleLanguageName
    ? subtitleLanguageKind
      ? `${subtitleLanguageName} (${subtitleLanguageKind === 'manual' ? t('metadata.subtitleManual') : t('metadata.subtitleAuto')})`
      : subtitleLanguageName
    : '—';

  return (
    <section className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/80">
      {title && (
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-3">
          {title}
        </h4>
      )}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetadataItem
          label={t('metadata.channel')}
          value={channelName?.trim() || '—'}
        />
        <MetadataItem
          label={t('metadata.duration')}
          value={durationValue}
          mono
        />
        <MetadataItem
          label={t('metadata.subtitleLanguage')}
          value={subtitleValue}
        />
      </dl>
    </section>
  );
}
