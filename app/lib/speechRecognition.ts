export interface SpeechRecognitionResultEvent {
  results: Array<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
}

export interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
}

export function createSpeechRecognition(
  language = 'en-US'
): BrowserSpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  const Constructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Constructor) return null;

  const recognition = new Constructor();
  recognition.lang = language;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  return recognition;
}

export function mapTranscriptLanguageToSpeechLanguage(code?: string): string {
  if (!code?.trim()) return 'en-US';

  const normalized = code.trim().toLowerCase();
  if (normalized.includes('-')) return normalized;

  const map: Record<string, string> = {
    en: 'en-US',
    uk: 'uk-UA',
    pl: 'pl-PL',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  return map[normalized] ?? `${normalized}-${normalized.toUpperCase()}`;
}
