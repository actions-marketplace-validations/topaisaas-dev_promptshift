'use client';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

/**
 * Sovereign Client Vault
 * Stores conversion history and invoice receipts in the user's local browser sandbox.
 * Complies 100% with Zero Data Retention: No project code or prompts are ever stored on cloud servers.
 */

export interface VaultConversion {
  id: string;
  projectName: string;
  sourcePlatform: string;
  targetPlatform: string;
  fileCount: number;
  parityScore: number;
  timestamp: string;
  zipBase64?: string;
  status: 'COMPLETED' | 'READY';
}

export interface VaultInvoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  planName: 'Single Project Pass' | 'Pro Developer Subscription' | 'Team & Agency Pass' | string;
  amount: string;
  currency: string;
  timestamp: string;
  paymentMethod: 'Polar.sh (Apple Pay, Google Pay, Cards, SEPA)' | 'Polar.sh' | string;
  status: 'PAID';
  customerName?: string;
  customerCompany?: string;
  customerEmail?: string;
  customerVatId?: string;
  poNumber?: string;
  isReverseCharge?: boolean;
}

const CONVERSIONS_KEY = 'promptshift_vault_conversions';
const INVOICES_KEY = 'promptshift_vault_invoices';
const CUSTOMER_INFO_KEY = 'promptshift_customer_info';
const ACTIVE_PLAN_KEY = 'promptshift_active_plan';

export type UserPlanTier = 'free' | 'single' | 'pro' | 'team' | 'vip';

export class ClientVault {
  /**
   * Retrieves all saved conversions from local storage
   */
  public static getConversions(): VaultConversion[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CONVERSIONS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Saves a new conversion into the local vault
   */
  public static saveConversion(conv: Omit<VaultConversion, 'id' | 'timestamp'> & { zipBase64?: string }): VaultConversion {
    const conversions = this.getConversions();
    const newConv: VaultConversion = {
      ...conv,
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    conversions.unshift(newConv);
    try {
      localStorage.setItem(CONVERSIONS_KEY, JSON.stringify(conversions.slice(0, 50))); // Keep last 50
    } catch (e) {
      console.warn('Vault storage ceiling reached, trimming older entries:', e);
    }
    return newConv;
  }

  /**
   * Deletes a conversion from the local vault
   */
  public static deleteConversion(id: string): void {
    if (typeof window === 'undefined') return;
    const filtered = this.getConversions().filter((c) => c.id !== id);
    localStorage.setItem(CONVERSIONS_KEY, JSON.stringify(filtered));
  }

  /**
   * Retrieves all saved invoices from local storage
   */
  public static getInvoices(): VaultInvoice[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(INVOICES_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Saves a new invoice receipt
   */
  public static saveInvoice(invoice: Omit<VaultInvoice, 'id' | 'invoiceNumber' | 'timestamp'>): VaultInvoice {
    const invoices = this.getInvoices();
    const count = invoices.length + 1;
    const invNumber = `INV-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    const newInvoice: VaultInvoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      invoiceNumber: invNumber,
      timestamp: new Date().toISOString(),
    };
    invoices.unshift(newInvoice);
    try {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.warn('Failed to save invoice to vault:', e);
    }
    return newInvoice;
  }

  /**
   * Get and update customer billing profile (Name, Company, VAT number)
   */
  public static getCustomerInfo(): {
    name: string;
    company: string;
    email: string;
    vatId: string;
    poNumber: string;
    isReverseCharge: boolean;
  } {
    if (typeof window === 'undefined') {
      return { name: '', company: '', email: '', vatId: '', poNumber: '', isReverseCharge: false };
    }
    try {
      const raw = localStorage.getItem(CUSTOMER_INFO_KEY);
      return raw
        ? JSON.parse(raw)
        : {
            name: '',
            company: '',
            email: '',
            vatId: '',
            poNumber: '',
            isReverseCharge: false,
          };
    } catch {
      return { name: '', company: '', email: '', vatId: '', poNumber: '', isReverseCharge: false };
    }
  }

  public static saveCustomerInfo(info: {
    name: string;
    company: string;
    email: string;
    vatId: string;
    poNumber?: string;
    isReverseCharge?: boolean;
  }): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(info));
  }

  /**
   * Retrieves active subscription plan tier
   */
  public static getActivePlan(): UserPlanTier {
    if (typeof window === 'undefined') return 'free';
    try {
      // 1. Check verified paid invoices first (Highest authority: verified purchases)
      const invoices = this.getInvoices();
      for (const inv of invoices) {
        const name = (inv.planName || '').toLowerCase();
        if (name.includes('team')) return 'team';
        if (name.includes('pro')) return 'pro';
        if (name.includes('single')) return 'single';
      }

      // 2. Check Beta Early Adopter pass
      if (this.isBetaEarlyAdopter()) {
        // In free_beta mode, early adopters enjoy full Pro tier
        if (MonetizationManager.isFreeBeta()) {
          return 'pro';
        }
        // In paid mode, early adopters smoothly transition to free unless subscribed
        return 'free';
      }

      // 3. Check explicit subscription plan stored in Sovereign Vault
      const explicit = localStorage.getItem(ACTIVE_PLAN_KEY) as UserPlanTier | null;
      if (explicit && ['team', 'pro', 'single'].includes(explicit)) {
        return explicit;
      }

      // 4. Check VIP code / promo pass
      if (localStorage.getItem('promptshift_vip_status') === 'true' || explicit === 'vip') {
        return 'vip';
      }

      if (explicit === 'free') {
        return 'free';
      }

      return 'free';
    } catch {
      return 'free';
    }
  }

  /**
   * Checks whether client has activated the Free Beta Pro pass
   */
  public static isBetaEarlyAdopter(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('promptshift_beta_early_adopter') === 'true';
  }

  /**
   * Enrolls developer into Free Pro Early Adopter pass during Beta
   */
  public static enrollBetaPro(email: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('promptshift_beta_early_adopter', 'true');
      localStorage.setItem('promptshift_beta_enrolled_at', new Date().toISOString());
      this.setActivePlan('pro');
      const cust = this.getCustomerInfo();
      this.saveCustomerInfo({ ...cust, email });
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('promptshift_beta_enrolled', { detail: { email } }));
        window.dispatchEvent(new CustomEvent('promptshift_plan_changed', { detail: 'pro' }));
      }
    } catch (e) {
      console.warn('Failed to enroll beta pro in vault:', e);
    }
  }

  /**
   * Identifies whether user needs to purchase a subscription when paid mode is turned on
   */
  public static isBetaPendingPaidUpgrade(): boolean {
    if (typeof window === 'undefined') return false;
    return MonetizationManager.isPaidMode() && this.isBetaEarlyAdopter() && this.getInvoices().length === 0;
  }

  /**
   * Sets active subscription plan tier
   */
  public static setActivePlan(plan: 'free' | 'single' | 'pro' | 'team'): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_PLAN_KEY, plan);
      // Clear VIP status when purchasing/activating a commercial plan so paid tier is immediately visible
      if (plan === 'pro' || plan === 'team' || plan === 'single') {
        localStorage.removeItem('promptshift_vip_status');
        localStorage.removeItem('promptshift_vip_code');
      }
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('promptshift_plan_changed', { detail: plan }));
      }
    } catch (e) {
      console.warn('Failed to set active plan in vault:', e);
    }
  }

  /**
   * Completely purges the local browser vault (conversions, cached bundles, and receipts)
   */
  public static purgeVault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CONVERSIONS_KEY);
    localStorage.removeItem(INVOICES_KEY);
    localStorage.removeItem(CUSTOMER_INFO_KEY);
    localStorage.removeItem(ACTIVE_PLAN_KEY);
    localStorage.removeItem('promptshift_vip_status');
    localStorage.removeItem('promptshift_vip_code');
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('promptshift_vault_purged'));
      window.dispatchEvent(new CustomEvent('promptshift_plan_changed', { detail: 'free' }));
    }
  }
}
