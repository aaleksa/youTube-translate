'use client';

import { useEffect, useState } from 'react';
import type { PremiumAccessInfo } from '../../../v2-core/types';
import { getSubscriptionAccess } from '../../lib/v2/subscriptionApi';
import { createCheckoutSession } from '../../lib/v2/billingApi';
import { isStripeConfiguredOnClient } from '../../lib/v2/config';
import { useI18n } from '../InterfaceLanguageProvider';
import { useAuth } from '../auth/AuthProvider';

function formatAiUsage(
  info: PremiumAccessInfo,
  t: (
    key: 'premium.aiUnlimited' | 'premium.aiUsage',
    params?: Record<string, string | number>
  ) => string
): string {
  if (info.isPremium && info.aiUsage.limit === null) {
    return t('premium.aiUnlimited');
  }

  const limit = info.aiUsage.limit ?? 0;
  return t('premium.aiUsage', {
    used: info.aiUsage.used,
    limit,
  });
}

export default function PremiumStatus() {
  const { enabled, ready, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [info, setInfo] = useState<PremiumAccessInfo | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const stripeConfigured = isStripeConfiguredOnClient();

  useEffect(() => {
    if (!enabled || !ready || !isAuthenticated) {
      setInfo(null);
      return;
    }

    let cancelled = false;

    const load = () => {
      void getSubscriptionAccess()
        .then((access) => {
          if (!cancelled) setInfo(access);
        })
        .catch(() => {
          if (!cancelled) setInfo(null);
        });
    };

    load();
    window.addEventListener('yoytube-premium-refresh', load);

    return () => {
      cancelled = true;
      window.removeEventListener('yoytube-premium-refresh', load);
    };
  }, [enabled, ready, isAuthenticated]);

  if (!enabled || !ready || !isAuthenticated || !info) {
    return null;
  }

  const isLow =
    !info.isPremium &&
    info.aiUsage.limit !== null &&
    info.aiUsage.remaining !== null &&
    info.aiUsage.remaining <= 3;

  const usageLabel = formatAiUsage(info, t);

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : t('premium.checkoutError')
      );
      setCheckoutLoading(false);
    }
  };

  const usageTone = info.isPremium
    ? 'text-amber-800 dark:text-amber-100'
    : isLow
      ? 'text-red-700 dark:text-red-200'
      : 'text-gray-700 dark:text-gray-200';

  return (
    <>
      <div
        className={`inline-flex h-9 items-center overflow-hidden rounded-full border text-xs font-medium ${
          info.isPremium
            ? 'border-amber-300/70 bg-amber-50/90 dark:border-amber-500/40 dark:bg-amber-950/50'
            : isLow
              ? 'border-red-300/70 bg-red-50/90 dark:border-red-500/40 dark:bg-red-950/40'
              : 'border-gray-200/80 bg-gray-50/90 dark:border-gray-600 dark:bg-gray-800/80'
        }`}
      >
        <span
          data-testid="premium-ai-usage"
          className={`px-2.5 py-1 ${usageTone}`}
          title={usageLabel}
        >
          {usageLabel}
        </span>

        {!info.isPremium && (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-px bg-gray-300/80 dark:bg-gray-600"
            />
            <button
              type="button"
              data-testid="premium-upgrade-button"
              onClick={() => setShowUpgrade(true)}
              className="h-full px-2.5 py-1 font-semibold text-amber-800 transition hover:bg-amber-100/80 dark:text-amber-100 dark:hover:bg-amber-900/40"
            >
              {t('premium.upgrade')}
            </button>
          </>
        )}
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('premium.upgradeTitle')}
              </h2>
              <button
                type="button"
                onClick={() => setShowUpgrade(false)}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={t('premium.close')}
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('premium.upgradeBody')}
            </p>

            <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-2 mb-6 list-disc pl-5">
              <li>{t('premium.benefitUnlimitedAi')}</li>
              <li>{t('premium.benefitPriority')}</li>
              <li>{t('premium.benefitSync')}</li>
            </ul>

            {checkoutError && (
              <p className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {checkoutError}
              </p>
            )}

            {!stripeConfigured && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {t('premium.comingSoon')}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {stripeConfigured && (
                <button
                  type="button"
                  data-testid="premium-checkout-button"
                  disabled={checkoutLoading}
                  onClick={() => void startCheckout()}
                  className="w-full min-h-11 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
                >
                  {checkoutLoading
                    ? t('premium.checkoutLoading')
                    : t('premium.checkout')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowUpgrade(false)}
                className={`w-full min-h-11 rounded-lg font-semibold ${
                  stripeConfigured
                    ? 'border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {t('premium.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
