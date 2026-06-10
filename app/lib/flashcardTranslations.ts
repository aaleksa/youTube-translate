import { enrichWordsForFlashcards } from './enrichFlashcards';
import {
  getFlashcards,
  normalizeFlashcardWord,
  saveFlashcards,
  type Flashcard,
} from './flashcards';
import type { TranslationLanguageCode } from './translationLanguages';

const BATCH_SIZE = 12;
const GLOSS_SPLIT = /\s+[—–-]\s+/;

function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

function hasLatinLetters(text: string): boolean {
  return /[a-zA-Z]{2,}/.test(text);
}

/** e.g. "good, acceptable — класно, добре" */
function isMixedLanguageGloss(text: string): boolean {
  const trimmed = text.trim();
  if (!GLOSS_SPLIT.test(trimmed) || !hasLatinLetters(trimmed)) return false;

  const parts = trimmed
    .split(GLOSS_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return false;

  const first = parts[0];
  const last = parts[parts.length - 1];
  return hasLatinLetters(first) && last !== first;
}

/** Keep only the learner-language part of a stored translation. */
export function normalizeTranslationText(
  text: string,
  language: TranslationLanguageCode
): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (isMixedLanguageGloss(trimmed)) {
    const parts = trimmed
      .split(GLOSS_SPLIT)
      .map((part) => part.trim())
      .filter(Boolean);
    const localized = parts[parts.length - 1];
    if (localized) return localized;
  }

  if (language === 'uk' && hasLatinLetters(trimmed) && hasCyrillic(trimmed)) {
    const cyrillicParts = trimmed
      .split(/[,;]/)
      .map((part) => part.trim())
      .filter((part) => hasCyrillic(part) && !hasLatinLetters(part));
    if (cyrillicParts.length > 0) return cyrillicParts.join(', ');
  }

  return trimmed;
}

/** Stored translation is unusable for the selected language (e.g. Ukrainian text under PL). */
function isStaleTranslation(
  text: string,
  language: TranslationLanguageCode
): boolean {
  if (!text.trim()) return true;
  if (isMixedLanguageGloss(text)) return true;
  if (language !== 'uk' && hasCyrillic(text)) return true;
  return false;
}

function needsTranslation(
  card: Flashcard,
  language: TranslationLanguageCode
): boolean {
  const mapped = card.translations?.[language]?.trim();
  if (mapped) return isStaleTranslation(mapped, language);

  if (card.translationLanguage === language) {
    return isStaleTranslation(card.translation, language);
  }

  return true;
}

/** Translation is clean enough to show as a reverse-quiz prompt (L1 → guess EN). */
export function isTranslationSuitableForReverseQuiz(
  translation: string,
  word: string,
  translationLanguage: TranslationLanguageCode
): boolean {
  const text = translation.trim();
  if (!text || text.length > 100) return false;

  if (translationLanguage === 'en') return true;

  const latinSegments = text.match(/[a-zA-Z][a-zA-Z0-9' -]*/g) ?? [];
  const wordNorm = word.trim().toLowerCase();
  if (!wordNorm) return false;

  for (const segment of latinSegments) {
    const seg = segment.trim().toLowerCase();
    if (seg.length < 3) continue;
    if (wordNorm.includes(seg) || seg.includes(wordNorm)) continue;
    return false;
  }

  return true;
}

export function getFlashcardTranslation(
  card: Flashcard,
  language: TranslationLanguageCode
): string {
  const raw =
    card.translations?.[language]?.trim() ??
    (card.translationLanguage === language ? card.translation.trim() : '');

  if (!raw) return '';
  return normalizeTranslationText(raw, language);
}

export async function ensureFlashcardTranslations(
  language: TranslationLanguageCode
): Promise<number> {
  let cards = getFlashcards();
  let prefilled = 0;

  cards = cards.map((card) => {
    const sourceLang = card.translationLanguage ?? 'uk';
    const needsLang = !card.translationLanguage;
    const needsMapEntry =
      card.translation.trim() && !card.translations?.[sourceLang]?.trim();

    if (!needsLang && !needsMapEntry) return card;

    prefilled += 1;
    return {
      ...card,
      translationLanguage: sourceLang,
      translations: needsMapEntry
        ? {
            ...card.translations,
            [sourceLang]: normalizeTranslationText(
              card.translation.trim(),
              sourceLang
            ),
          }
        : card.translations,
    };
  });

  if (prefilled > 0) {
    saveFlashcards(cards);
  }

  const missing = new Map<string, Flashcard>();

  for (const card of cards) {
    const key = normalizeFlashcardWord(card.word);
    if (!key) continue;
    if (!needsTranslation(card, language)) continue;
    missing.set(key, card);
  }

  if (missing.size === 0) return 0;

  const translatedByKey = new Map<string, string>();
  const missingCards = [...missing.values()];

  for (let index = 0; index < missingCards.length; index += BATCH_SIZE) {
    const batch = missingCards.slice(index, index + BATCH_SIZE);
    const words = batch.map((card) => card.word.trim());
    const transcript = batch
      .map((card) => card.example.trim() || card.word.trim())
      .join('\n');

    const enriched = await enrichWordsForFlashcards(
      words,
      transcript,
      language
    );

    for (const item of enriched) {
      const key = normalizeFlashcardWord(item.word);
      const translation = normalizeTranslationText(
        item.translation.trim(),
        language
      );
      if (!key || !translation || isStaleTranslation(translation, language)) {
        continue;
      }
      translatedByKey.set(key, translation);
    }
  }

  if (translatedByKey.size === 0) return 0;

  let updated = 0;
  const nextCards = cards.map((card) => {
    const key = normalizeFlashcardWord(card.word);
    const translated = translatedByKey.get(key);
    if (!translated) return card;

    updated += 1;
    return {
      ...card,
      translations: {
        ...card.translations,
        [language]: translated,
      },
    };
  });

  if (updated > 0) {
    saveFlashcards(nextCards);
  }

  return updated;
}
