import type { TranslationKey } from './i18n';

export const FAQ_ITEM_IDS = [
  'account',
  'sync',
  'premium',
  'subtitles',
  'ai',
  'mastered',
  'anki',
  'offline',
  'deleteData',
] as const;

export type FaqItemId = (typeof FAQ_ITEM_IDS)[number];

export function faqQuestionKey(id: FaqItemId): TranslationKey {
  return `faq.q.${id}` as TranslationKey;
}

export function faqAnswerKey(id: FaqItemId): TranslationKey {
  return `faq.a.${id}` as TranslationKey;
}
