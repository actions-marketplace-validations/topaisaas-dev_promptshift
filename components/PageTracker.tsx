'use client';

import { useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { CurrencyManager } from '@/lib/currency/currencyManager';

interface PageTrackerProps {
  path: string;
}

export function PageTracker({ path }: PageTrackerProps) {
  useEffect(() => {
    try {
      const currency = CurrencyManager.getActiveCurrency();
      AnalyticsTracker.trackPageView(path, undefined, currency);
    } catch {
      AnalyticsTracker.trackPageView(path);
    }
  }, [path]);

  return null;
}
