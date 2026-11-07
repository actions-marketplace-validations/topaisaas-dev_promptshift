'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { CurrencyManager } from '@/lib/currency/currencyManager';

interface PageTrackerProps {
  path: string;
}

/**
 * Page-level tracker (for backwards compatibility)
 */
export function PageTracker({ path }: PageTrackerProps) {
  useEffect(() => {
    try {
      const currency = CurrencyManager.getActiveCurrency();
      AnalyticsTracker.trackPageView({ path, currency });
    } catch {
      AnalyticsTracker.trackPageView({ path });
    }
  }, [path]);

  return null;
}

/**
 * Global Site-Wide Real-Time Tracker
 * Captures 100% of human visits, real HTTP referrers (ChatGPT, Perplexity, Claude, Google, X),
 * UTM parameters, inferred user intents, and session IDs with zero PII retention.
 */
export function GlobalPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    try {
      const currency = CurrencyManager.getActiveCurrency();
      AnalyticsTracker.trackPageView({
        path: pathname,
        currency,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        searchParams: searchParams || undefined,
      });
    } catch {
      AnalyticsTracker.trackPageView({
        path: pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        searchParams: searchParams || undefined,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
