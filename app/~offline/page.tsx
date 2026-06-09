import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-md w-full rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-gray-800 shadow-lg p-6 text-center">
        <p className="text-4xl mb-4" aria-hidden>
          📡
        </p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          You are offline
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Ви offline. Перевірте інтернет-з&apos;єднання.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Cached pages remain available while offline.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
