import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of YouTube Translator.',
};

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@example.com';
const LAST_UPDATED = '2026-07-29';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(5rem+env(safe-area-inset-top))]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            ← Back to app
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-6">
          <strong>Template notice:</strong> this is a generic starting point,
          not legal advice. Replace the placeholders below (operator name,
          jurisdiction, governing law) and have it reviewed by a lawyer
          before relying on it for a real public launch.
        </div>

        <article className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              1. Acceptance of terms
            </h2>
            <p>
              By creating an account or using YouTube Translator
              (&quot;Translaty&quot;, &quot;the service&quot;), you agree to
              these Terms of Service and our{' '}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              2. The service
            </h2>
            <p>
              The service extracts publicly available subtitles from YouTube
              videos and generates AI-assisted learning materials. It does
              not host, download, or redistribute video files. Use of
              YouTube content remains subject to{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                YouTube&apos;s own Terms of Service
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              3. Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of
              your account credentials and for all activity under your
              account. You must provide a valid email address and be
              legally able to enter into these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              4. Acceptable use
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not use the service to infringe copyright or other rights of third parties.</li>
              <li>Do not attempt to circumvent rate limits, abuse the AI features to generate unrelated content, or interfere with the service&apos;s operation.</li>
              <li>Do not use automated tools to scrape or overload the service beyond normal personal use.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              5. Premium subscriptions and billing
            </h2>
            <p>
              Some features require a paid Premium subscription, billed and
              processed via Stripe. Subscriptions renew automatically unless
              cancelled before the renewal date. Refunds, where applicable,
              follow the policy communicated at time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              6. AI-generated content
            </h2>
            <p>
              Flashcards, summaries, quizzes, and other content generated by
              the AI features are produced automatically and may contain
              errors or inaccuracies. Use them as a learning aid, not as an
              authoritative source.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              7. Disclaimer and limitation of liability
            </h2>
            <p>
              The service is provided &quot;as is&quot; without warranties
              of any kind. To the maximum extent permitted by law, we are
              not liable for indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              8. Termination
            </h2>
            <p>
              We may suspend or terminate accounts that violate these terms.
              You may stop using the service and request account deletion at
              any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              9. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of
              the service after changes take effect constitutes acceptance
              of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              10. Contact
            </h2>
            <p>
              Questions about these terms? Email us at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
