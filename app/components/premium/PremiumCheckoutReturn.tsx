'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../InterfaceLanguageProvider';
import { useAuth } from '../auth/AuthProvider';

const PREMIUM_REFRESH_EVENT = 'yoytube-premium-refresh';

export function dispatchPremiumRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PREMIUM_REFRESH_EVENT));
}

export default function PremiumCheckoutReturn() {
  const { enabled, ready, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [notice, setNotice] = useState<'success' | 'cancelled' | null>(null);

  useEffect(() => {
    if (!enabled || !ready || !isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    const premium = params.get('premium');
    if (premium !== 'success' && premium !== 'cancelled') {
      return;
    }

    setNotice(premium);
    dispatchPremiumRefresh();

    const url = new URL(window.location.href);
    url.searchParams.delete('premium');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [enabled, ready, isAuthenticated]);

  if (!notice) {
    return null;
  }

  const isSuccess = notice === 'success';

  return (
    <div
      role="status"
      data-testid="premium-checkout-notice"
      data-premium-notice={notice}
      className={`fixed bottom-4 left-4 right-4 z-[65] mx-auto max-w-md rounded-xl border px-4 py-3 shadow-lg backdrop-blur sm:left-auto ${
        isSuccess
          ? 'border-emerald-300/80 bg-emerald-50/95 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/90 dark:text-emerald-100'
          : 'border-slate-300/80 bg-slate-50/95 text-slate-800 dark:border-slate-500/40 dark:bg-slate-900/90 dark:text-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">
            {isSuccess ? t('premium.checkoutSuccessTitle') : t('premium.checkoutCancelledTitle')}
          </p>
          <p className="text-xs sm:text-sm mt-0.5 opacity-90">
            {isSuccess
              ? t('premium.checkoutSuccessBody')
              : t('premium.checkoutCancelledBody')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotice(null)}
          className="shrink-0 text-lg leading-none opacity-70 hover:opacity-100"
          aria-label={t('premium.close')}
        >
          ×
        </button>
      </div>
    </div>
  );
}
