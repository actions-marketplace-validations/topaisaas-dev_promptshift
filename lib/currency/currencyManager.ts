'use client';

/**
 * Sovereign Multi-Currency & Geolocation Manager
 * Automatically detects the client's localized currency based on timezone & locale,
 * with zero tracking cookies and persistent client-side preferences.
 */

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  rates: {
    single: number;
    proMonthly: number;
    proAnnualMonthly: number;
    teamMonthly: number;
    teamAnnualMonthly: number;
  };
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rates: {
      single: 1.99,
      proMonthly: 5.99,
      proAnnualMonthly: 4.10,
      teamMonthly: 19.99,
      teamAnnualMonthly: 16.50,
    },
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rates: {
      single: 1.89,
      proMonthly: 5.49,
      proAnnualMonthly: 3.80,
      teamMonthly: 18.49,
      teamAnnualMonthly: 15.20,
    },
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rates: {
      single: 1.59,
      proMonthly: 4.79,
      proAnnualMonthly: 3.30,
      teamMonthly: 15.99,
      teamAnnualMonthly: 13.10,
    },
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rates: {
      single: 2.69,
      proMonthly: 7.99,
      proAnnualMonthly: 5.50,
      teamMonthly: 26.99,
      teamAnnualMonthly: 22.20,
    },
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rates: {
      single: 2.99,
      proMonthly: 8.99,
      proAnnualMonthly: 6.20,
      teamMonthly: 29.99,
      teamAnnualMonthly: 24.70,
    },
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rates: {
      single: 299,
      proMonthly: 899,
      proAnnualMonthly: 620,
      teamMonthly: 2999,
      teamAnnualMonthly: 2470,
    },
  },
};

const STORAGE_KEY = 'promptshift_user_currency';
const CURRENCY_CHANGE_EVENT = 'promptshift_currency_changed';

export class CurrencyManager {
  /**
   * Automatically detects the user's localized currency from browser environment
   */
  public static detectCurrency(): SupportedCurrency {
    if (typeof window === 'undefined') return 'USD';

    // 1. User manual override stored locally (only if explicitly picked by the user)
    const explicitChoice = localStorage.getItem('promptshift_user_currency_explicit');
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
    if (explicitChoice && saved && CURRENCIES[saved]) {
      return saved;
    }

    // 2. Client timezone heuristic
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

      if (timeZone.startsWith('Europe/London')) {
        return 'GBP';
      }
      if (
        timeZone.startsWith('Europe/') ||
        timeZone.includes('Paris') ||
        timeZone.includes('Berlin') ||
        timeZone.includes('Madrid') ||
        timeZone.includes('Rome') ||
        timeZone.includes('Amsterdam') ||
        timeZone.includes('Brussels') ||
        timeZone.includes('Vienna') ||
        timeZone.includes('Lisbon') ||
        timeZone.includes('Athens') ||
        timeZone.includes('Helsinki') ||
        timeZone.includes('Dublin')
      ) {
        return 'EUR';
      }
      if (timeZone.startsWith('Asia/Tokyo')) {
        return 'JPY';
      }
      if (timeZone.startsWith('Australia/') || timeZone.includes('Sydney') || timeZone.includes('Melbourne')) {
        return 'AUD';
      }
      if (timeZone.startsWith('America/Toronto') || timeZone.startsWith('America/Vancouver') || timeZone.startsWith('America/Montreal') || timeZone.startsWith('America/Edmonton')) {
        return 'CAD';
      }
    } catch {
      // Fallback
    }

    // 3. User navigator language & languages array
    try {
      const languages = (navigator.languages || [navigator.language || '']).map((l) => l.toLowerCase());
      for (const lang of languages) {
        if (lang.includes('fr') || lang.includes('de') || lang.includes('es') || lang.includes('it') || lang.includes('nl') || lang.includes('pt')) {
          return 'EUR';
        }
        if (lang.includes('en-gb')) return 'GBP';
        if (lang.includes('en-ca') || lang.includes('fr-ca')) return 'CAD';
        if (lang.includes('en-au')) return 'AUD';
        if (lang.includes('ja')) return 'JPY';
      }
    } catch {
      // Fallback
    }

    return 'EUR'; // Default to EUR for international developer friendly experience
  }

  /**
   * Asynchronously refines the user's localized currency via server IP geolocation
   */
  public static async initFromIp(): Promise<SupportedCurrency> {
    if (typeof window === 'undefined') return 'USD';
    try {
      const explicitChoice = localStorage.getItem('promptshift_user_currency_explicit');
      if (explicitChoice) {
        const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
        if (saved && CURRENCIES[saved]) return saved;
      }

      const res = await fetch('/api/geo');
      if (res.ok) {
        const data = await res.json();
        if (data.currency && CURRENCIES[data.currency as SupportedCurrency]) {
          const detected = data.currency as SupportedCurrency;
          this.setCurrency(detected, false);
          return detected;
        }
      }
    } catch {
      // Fallback silently
    }
    return this.getActiveCurrency();
  }

  /**
   * Sets user's currency preference and notifies all listeners across the app
   */
  public static setCurrency(currency: SupportedCurrency, isExplicit: boolean = true): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, currency);
    if (isExplicit) {
      localStorage.setItem('promptshift_user_currency_explicit', 'true');
    }
    window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: currency }));
  }

  /**
   * Returns current active currency
   */
  public static getActiveCurrency(): SupportedCurrency {
    return this.detectCurrency();
  }

  /**
   * Formats a given number into the appropriate localized price string
   */
  public static format(amount: number, currency: SupportedCurrency = 'USD'): string {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    if (currency === 'JPY') {
      return `${config.symbol}${Math.round(amount)}`;
    }
    if (currency === 'EUR') {
      return `${amount.toFixed(2).replace('.', ',')} ${config.symbol}`;
    }
    return `${config.symbol}${amount.toFixed(2)}`;
  }

  /**
   * Retrieves the localized price for a specific tier and billing cycle
   */
  public static getTierPrice(
    tier: 'single' | 'pro' | 'team',
    currency: SupportedCurrency = 'USD',
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): { formatted: string; raw: number; billingSuffix: string } {
    const config = CURRENCIES[currency] || CURRENCIES.USD;

    if (tier === 'single') {
      return {
        formatted: this.format(config.rates.single, currency),
        raw: config.rates.single,
        billingSuffix: '/ project',
      };
    }

    if (tier === 'pro') {
      const price = billingCycle === 'monthly' ? config.rates.proMonthly : config.rates.proAnnualMonthly;
      const annualTotal = (config.rates.proAnnualMonthly * 12).toFixed(currency === 'JPY' ? 0 : 0);
      const suffix = billingCycle === 'monthly' ? '/ month' : `/ mo (${this.format(Number(annualTotal), currency)} billed annually)`;
      return {
        formatted: this.format(price, currency),
        raw: price,
        billingSuffix: suffix,
      };
    }

    // Team tier
    const price = billingCycle === 'monthly' ? config.rates.teamMonthly : config.rates.teamAnnualMonthly;
    const annualTotal = (config.rates.teamAnnualMonthly * 12).toFixed(currency === 'JPY' ? 0 : 0);
    const suffix = billingCycle === 'monthly' ? '/ month' : `/ mo (${this.format(Number(annualTotal), currency)} billed annually)`;
    return {
      formatted: this.format(price, currency),
      raw: price,
      billingSuffix: suffix,
    };
  }
}
