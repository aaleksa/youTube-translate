'use client';

import Link from 'next/link';
import { FAQ_ITEM_IDS, faqAnswerKey, faqQuestionKey } from '../lib/faqContent';
import { useI18n } from './InterfaceLanguageProvider';

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || '';

export default function FaqPageContent() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(5rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            ← {t('faq.backHome')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('faq.pageTitle')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('faq.pageSubtitle')}
          </p>
        </header>

        <div className="space-y-3">
          {FAQ_ITEM_IDS.map((id) => (
            <details
              key={id}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 shadow-sm open:shadow-md transition-shadow"
            >
              <summary className="cursor-pointer list-none px-4 py-3.5 sm:px-5 sm:py-4 font-semibold text-gray-900 dark:text-gray-100 marker:content-none flex items-center justify-between gap-3">
                <span>{t(faqQuestionKey(id))}</span>
                <span
                  aria-hidden
                  className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform"
                >
                  ▾
                </span>
              </summary>
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700/80 pt-3">
                {t(faqAnswerKey(id))}
              </div>
            </details>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-gray-800/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('faq.supportTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('faq.supportBody')}
          </p>
          {SUPPORT_EMAIL ? (
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              {t('faq.supportEmail')}
            </a>
          ) : null}
        </section>

        <footer className="mt-6 flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </main>
  );
}
