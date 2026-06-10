import {
  getFlashcards,
  normalizeFlashcardWord,
  saveFlashcards,
  type Flashcard,
} from './flashcards';
import type { TranslationLanguageCode } from './translationLanguages';

const BATCH_SIZE = 50;

function hasTranslationInLanguage(
  card: Flashcard,
  language: TranslationLanguageCode
): boolean {
  if (card.translations?.[language]?.trim()) return true;
  return (
    (card.translationLanguage === language || !card.translationLanguage) &&
    Boolean(card.translation.trim())
  );
}

export function getFlashcardTranslation(
  card: Flashcard,
  language: TranslationLanguageCode
): string {
  const direct = card.translations?.[language]?.trim();
  if (direct) return direct;

  if (
    card.translationLanguage === language ||
    !card.translationLanguage
  ) {
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
    if (
      card.translation.trim() &&
      !card.translations?.[sourceLang]?.trim()
    ) {
      prefilled += 1;
      return {
        ...card,
        translations: {
          ...card.translations,
          [sourceLang]: card.translation.trim(),
        },
      };
    }
    return card;
  });

  if (prefilled > 0) {
    saveFlashcards(cards);
  }

  const missing = new Map<string, Flashcard>();

  for (const card of cards) {
    const key = normalizeFlashcardWord(card.word);
    if (!key) continue;
    if (hasTranslationInLanguage(card, language)) continue;
    missing.set(key, card);
  }

  if (missing.size === 0) return 0;

  const words = [...missing.values()].map((card) => card.word.trim());
  const translatedByKey = new Map<string, string>();

  for (let index = 0; index < words.length; index += BATCH_SIZE) {
    const batch = words.slice(index, index + BATCH_SIZE);
    const response = await fetch('/api/translate-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: batch, targetLanguage: language }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to translate flashcards');
    }

    const batchTranslations: string[] = data.translations ?? [];
    batch.forEach((word, batchIndex) => {
      const translated = batchTranslations[batchIndex]?.trim();
      if (!translated) return;
      translatedByKey.set(normalizeFlashcardWord(word), translated);
    });
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
