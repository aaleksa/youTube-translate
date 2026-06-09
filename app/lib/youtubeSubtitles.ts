import { execSync } from 'child_process';

export interface SubtitleLanguage {
  code: string;
  name: string;
  kind: 'manual' | 'auto';
}

export interface YtDlpVideoMetadata {
  id?: string;
  title?: string;
  channel?: string;
  uploader?: string;
  duration?: number;
  subtitles?: Record<string, Array<{ ext?: string; url?: string }>>;
  automatic_captions?: Record<string, Array<{ ext?: string; url?: string }>>;
}

export interface ExtractedVideoMetadata {
  title?: string;
  channelName?: string;
  durationSeconds?: number;
}

export interface SelectedSubtitleLanguage {
  code: string;
  name: string;
  kind: 'manual' | 'auto';
}

export function extractVideoMetadata(
  metadata: YtDlpVideoMetadata
): ExtractedVideoMetadata {
  const duration =
    typeof metadata.duration === 'number' && metadata.duration > 0
      ? Math.round(metadata.duration)
      : undefined;

  return {
    title: metadata.title?.trim() || undefined,
    channelName:
      metadata.channel?.trim() || metadata.uploader?.trim() || undefined,
    durationSeconds: duration,
  };
}

export function getSelectedSubtitleLanguage(
  languages: SubtitleLanguage[],
  selectedCode?: string
): SelectedSubtitleLanguage | null {
  if (!selectedCode?.trim()) return null;

  const match = languages.find((language) => language.code === selectedCode);
  if (match) {
    return {
      code: match.code,
      name: match.name,
      kind: match.kind,
    };
  }

  return {
    code: selectedCode,
    name: formatLanguageName(selectedCode),
    kind: 'auto',
  };
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function fetchVideoMetadata(url: string): YtDlpVideoMetadata {
  const output = execSync(
    `yt-dlp --no-warnings -j --skip-download ${JSON.stringify(url)}`,
    {
      encoding: 'utf-8',
      maxBuffer: 20 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const jsonLine = output
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('{'));

  if (!jsonLine) {
    throw new Error('yt-dlp returned no JSON metadata');
  }

  return JSON.parse(jsonLine) as YtDlpVideoMetadata;
}

export function tryLoadAvailableLanguages(url: string): SubtitleLanguage[] {
  try {
    return getAvailableLanguages(fetchVideoMetadata(url));
  } catch (error) {
    console.log('Could not load subtitle languages:', error);
    return [];
  }
}

export function parseLanguageFromSubtitleFilename(
  filename: string
): string | null {
  const match = filename.match(
    /\.([a-z]{2}(?:-[A-Za-z0-9]+)?(?:-[a-z]{2})?)\.(?:vtt|srt|json)$/i
  );
  return match?.[1] ?? null;
}

const LANGUAGE_NAME_OVERRIDES: Record<string, string> = {
  en: 'English',
  uk: 'Ukrainian',
  'uk-UA': 'Ukrainian',
  ru: 'Russian',
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  pl: 'Polish',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  'zh-Hans': 'Chinese (Simplified)',
  'zh-Hant': 'Chinese (Traditional)',
};

export function formatLanguageName(code: string): string {
  if (LANGUAGE_NAME_OVERRIDES[code]) {
    return LANGUAGE_NAME_OVERRIDES[code];
  }

  const base = code.split('-')[0];
  if (base && LANGUAGE_NAME_OVERRIDES[base]) {
    const suffix = code.slice(base.length);
    return suffix ? `${LANGUAGE_NAME_OVERRIDES[base]}${suffix}` : LANGUAGE_NAME_OVERRIDES[base];
  }

  try {
    const display = new Intl.DisplayNames(['en'], { type: 'language' }).of(
      base || code
    );
    if (display && display !== code) {
      return code.includes('-') ? `${display} (${code})` : display;
    }
  } catch {
    // ignore
  }

  return code;
}

export function getAvailableLanguages(
  metadata: YtDlpVideoMetadata
): SubtitleLanguage[] {
  const manual = new Set(Object.keys(metadata.subtitles ?? {}));
  const auto = new Set(Object.keys(metadata.automatic_captions ?? {}));
  const codes = new Set([...manual, ...auto]);

  return Array.from(codes)
    .map((code) => ({
      code,
      name: formatLanguageName(code),
      kind: manual.has(code) ? ('manual' as const) : ('auto' as const),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function pickDefaultLanguage(languages: SubtitleLanguage[]): string | null {
  if (languages.length === 0) return null;

  const codes = new Set(languages.map((lang) => lang.code));
  const preferred = ['en', 'en-US', 'en-GB'];

  for (const code of preferred) {
    if (codes.has(code)) return code;
  }

  const manualEnglish = languages.find(
    (lang) => lang.kind === 'manual' && lang.code.startsWith('en')
  );
  if (manualEnglish) return manualEnglish.code;

  const autoEnglish = languages.find(
    (lang) => lang.kind === 'auto' && lang.code.startsWith('en')
  );
  if (autoEnglish) return autoEnglish.code;

  const manual = languages.find((lang) => lang.kind === 'manual');
  if (manual) return manual.code;

  return languages[0].code;
}

export function getSubtitleVttUrl(
  metadata: YtDlpVideoMetadata,
  lang: string
): string | null {
  const manual = metadata.subtitles?.[lang];
  const auto = metadata.automatic_captions?.[lang];

  for (const formats of [manual, auto]) {
    if (!formats?.length) continue;

    const vtt = formats.find((item) => item.ext === 'vtt' && item.url);
    if (vtt?.url) return vtt.url;

    const withUrl = formats.find((item) => item.url);
    if (withUrl?.url) return withUrl.url;
  }

  return null;
}

export async function fetchSubtitleContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subtitles (${response.status})`);
  }

  return response.text();
}
