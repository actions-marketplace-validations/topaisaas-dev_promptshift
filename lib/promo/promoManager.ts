'use client';

/**
 * VIP Promo, Admin & Peer Developer Pass Manager
 * Allows admins, dev friends and beta partners to unlock full access 100% free
 * via promo codes (e.g. SMOKETEST, SMOKTEST, DEVVIP, ADMIN, BETA2026) or query string (?promo=SMOKETEST).
 */

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  description: string;
  passType: 'vip_pro' | 'free_single';
}

const PROMO_CODES: Record<
  string,
  { discountPercent: number; description: string; passType: 'vip_pro' | 'free_single' }
> = {
  SMOKETEST: {
    discountPercent: 100,
    description: 'Admin Smoketest Pass (100% Free Pro Developer Unlimited)',
    passType: 'vip_pro',
  },
  SMOKTEST: {
    discountPercent: 100,
    description: 'Admin Smoketest Pass (100% Free Pro Developer Unlimited)',
    passType: 'vip_pro',
  },
  ADMIN: {
    discountPercent: 100,
    description: 'Admin Full-Access Sandbox Pass (100% OFF)',
    passType: 'vip_pro',
  },
  DEVVIP: {
    discountPercent: 100,
    description: 'Lifetime VIP Developer Pass (100% OFF)',
    passType: 'vip_pro',
  },
  BETA2026: {
    discountPercent: 100,
    description: 'Beta Tester All-Access Pass (100% OFF)',
    passType: 'vip_pro',
  },
};

const VIP_ACTIVE_KEY = 'promptshift_vip_status';
const VIP_CODE_KEY = 'promptshift_vip_code';

export class PromoManager {
  /**
   * Validates a given promo code (case-insensitive)
   */
  public static validate(inputCode: string): PromoValidationResult {
    const normalized = (inputCode || '').trim().toUpperCase();
    const match = PROMO_CODES[normalized];

    if (match) {
      return {
        valid: true,
        code: normalized,
        discountPercent: match.discountPercent,
        description: match.description,
        passType: match.passType,
      };
    }

    return {
      valid: false,
      code: normalized,
      discountPercent: 0,
      description: 'Invalid or expired promo code',
      passType: 'free_single',
    };
  }

  /**
   * Activates VIP mode in local client storage and elevates plan to Pro/VIP
   */
  public static activateVip(code: string): void {
    if (typeof window === 'undefined') return;
    try {
      const normalized = (code || 'SMOKETEST').trim().toUpperCase();
      localStorage.setItem(VIP_ACTIVE_KEY, 'true');
      localStorage.setItem(VIP_CODE_KEY, normalized);
      localStorage.setItem('promptshift_active_plan', 'pro');

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(
          new CustomEvent('promptshift_vip_activated', { detail: { code: normalized } })
        );
        window.dispatchEvent(
          new CustomEvent('promptshift_plan_changed', { detail: 'pro' })
        );
      }
    } catch (e) {
      console.warn('Failed to activate VIP pass in browser storage:', e);
    }
  }

  /**
   * Deactivates VIP mode and resets client plan to free
   */
  public static deactivateVip(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(VIP_ACTIVE_KEY);
      localStorage.removeItem(VIP_CODE_KEY);
      localStorage.setItem('promptshift_active_plan', 'free');

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(
          new CustomEvent('promptshift_plan_changed', { detail: 'free' })
        );
      }
    } catch (e) {
      console.warn('Failed to deactivate VIP pass in browser storage:', e);
    }
  }

  /**
   * Checks if VIP mode is currently active
   */
  public static isVipActive(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return (
        localStorage.getItem(VIP_ACTIVE_KEY) === 'true' ||
        Boolean(localStorage.getItem(VIP_CODE_KEY))
      );
    } catch {
      return false;
    }
  }

  /**
   * Returns active VIP code if present
   */
  public static getVipCode(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(VIP_CODE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Inspects current URL search params for ?promo=... or ?vip=... or ?code=...
   */
  public static checkUrlForPromo(): PromoValidationResult | null {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const promo = params.get('promo') || params.get('code') || params.get('vip');

      if (promo) {
        const res = this.validate(promo);
        if (res.valid) {
          this.activateVip(res.code);
          return res;
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
    return null;
  }
}
