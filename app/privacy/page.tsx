import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How YouTube Translator collects, uses, and protects your data.',
};

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'support@example.com';
const LAST_UPDATED = '2026-07-29';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 mb-6">
          <strong>Template notice:</strong> this is a generic starting point,
          not legal advice. Replace the placeholders below (operator name,
          jurisdiction, contact details) and have it reviewed by a lawyer
          before relying on it for a real public launch.
        </div>

        <article className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              1. What this service is
            </h2>
            <p>
              YouTube Translator (&quot;Translaty&quot;, &quot;we&quot;,
              &quot;us&quot;) is a web application that extracts subtitles
              from YouTube videos and generates AI-assisted learning
              materials (flashcards, quizzes, summaries, and similar
              content).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              2. Data we collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account data:</strong> email address and a hashed
                password (or a Google account identifier, if you sign in
                with Google).
              </li>
              <li>
                <strong>Learning data:</strong> the YouTube URLs you submit,
                flashcards, quiz results, study progress, and settings you
                create while using the app.
              </li>
              <li>
                <strong>Payment data:</strong> if you subscribe to Premium,
                payments are processed by Stripe. We do not store your card
                details ourselves.
              </li>
              <li>
                <strong>Technical data:</strong> basic request metadata (IP
                address, timestamps) used for security, rate limiting, and
                abuse prevention.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              3. How we use your data
            </h2>
            <p>
              We use your data to provide and improve the service: storing
              your learning progress, generating AI content via OpenAI&apos;s
              API, authenticating you, processing payments, and communicating
              essential account or billing notices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              4. Third-party services
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>OpenAI</strong> - processes transcript text to
                generate learning content.
              </li>
              <li>
                <strong>AWS (Cognito, DynamoDB)</strong> - authentication and
                data storage when the app is configured with a cloud
                backend.
              </li>
              <li>
                <strong>Stripe</strong> - payment processing for Premium
                subscriptions.
              </li>
              <li>
                <strong>YouTube</strong> - the source of video metadata and
                subtitles you choose to process.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              5. Data retention and deletion
            </h2>
            <p>
              Your data is retained for as long as your account is active.
              You can request deletion of your account and associated data
              by contacting us at{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              6. Your rights
            </h2>
            <p>
              Depending on your jurisdiction (e.g. GDPR for EU/UK residents),
              you may have the right to access, correct, export, or delete
              your personal data, and to object to certain processing.
              Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              7. Local-only mode
            </h2>
            <p>
              If you use the app without an account, your data (flashcards,
              settings, progress) is stored only in your browser&apos;s local
              storage and is never sent to our servers except for the
              transcript/AI requests you explicitly trigger.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              8. Contact
            </h2>
            <p>
              Questions about this policy? Email us at{' '}
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
