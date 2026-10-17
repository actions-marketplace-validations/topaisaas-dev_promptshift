'use client';

/**
 * VIP Promo & Peer Developer Pass Manager
 * Allows dev friends and beta partners to unlock full access 100% free
 * via promo codes (e.g. DEVVIP, FRIENDS, BETA2026, LAUNCHVIP) or query string (?promo=DEVVIP).
 */

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  description: string;
  passType: 'vip_pro' | 'free_single';
}

const PROMO_CODES: Record<string, { discountPercent: number; description: string; passType: 'vip_pro' | 'free_single' }> = {};

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
   * Activates VIP mode in local client storage
   */
  public static activateVip(code: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VIP_ACTIVE_KEY, 'true');
    localStorage.setItem(VIP_CODE_KEY, code.toUpperCase());
    window.dispatchEvent(new CustomEvent('promptshift_vip_activated', { detail: { code: code.toUpperCase() } }));
  }

  /**
   * Checks if VIP mode is currently active
   */
  public static isVipActive(): boolean {
    return false;
  }

  /**
   * Returns active VIP code if present
   */
  public static getVipCode(): string | null {
    return null;
  }

  /**
   * Inspects current URL search params for ?promo=... or ?vip=...
   */
  public static checkUrlForPromo(): PromoValidationResult | null {
    return null;
  }
}
