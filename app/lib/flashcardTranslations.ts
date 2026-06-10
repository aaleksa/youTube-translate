import { enrichWordsForFlashcards } from './enrichFlashcards';
import {
  getFlashcards,
  normalizeFlashcardWord,
  saveFlashcards,
  type Flashcard,
} from './flashcards';
import type { TranslationLanguageCode } from './translationLanguages';

const BATCH_SIZE = 12;

function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/** Stored translation is unusable for the selected language (e.g. Ukrainian text under PL). */
function isStaleTranslation(
  text: string,
  language: TranslationLanguageCode
): boolean {
  if (!text.trim()) return true;
  if (language === 'uk') return false;
  return hasCyrillic(text);
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

export function getFlashcardTranslation(
  card: Flashcard,
  language: TranslationLanguageCode
): string {
  const direct = card.translations?.[language]?.trim();
  if (direct) return direct;

  if (card.translationLanguage === language) {
    return card.translation.trim();
  }

  return '';
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
            [sourceLang]: card.translation.trim(),
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
      const translation = item.translation.trim();
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
