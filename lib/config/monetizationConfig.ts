/**
 * PromptShift Monetization & Release Mode Configuration
 * 
 * Central switch to control monetization state across the entire platform:
 * - 'free_beta' : Open Public Beta. Starter is 100% free (<= 5 files). Pro is 100% free in exchange for email. Zero payment required.
 * - 'paid'      : Full commercial monetization with PayPal & Credit Card processing (Single $1.99, Pro $5.99/mo, Team $19.99/mo).
 */

export type MonetizationMode = 'free_beta' | 'paid';

export interface MonetizationConfig {
  mode: MonetizationMode;
  freeTierMaxFiles: number;
  betaName: string;
  betaBadge: string;
  betaHeadline: string;
  betaNotice: string;
  allowProDuringBeta: boolean;
  requireEmailForProBeta: boolean;
  betaExpirationNotice: string;
}

export const MONETIZATION_CONFIG: MonetizationConfig = {
  // Master toggle: 'free_beta' while legal entity registration is in progress.
  // Switch to 'paid' to reactivate the complete commercial checkout on launch day!
  mode: 'free_beta',

  // Free Starter project limit without email
  freeTierMaxFiles: 5,

  // Branding & copy for Free Beta phase
  betaName: 'PromptShift Open Beta',
  betaBadge: 'OPEN PUBLIC BETA • FREE PRO PASS',
  betaHeadline: 'Universal AI Project Transpiler — Free During Open Public Beta',
  betaNotice: 'PromptShift is currently in open public beta. The Pro Pass is complimentary for all early adopter developers.',

  // Pro tier options during beta
  allowProDuringBeta: true,
  requireEmailForProBeta: true,

  // Transition to paid roadmap notice
  betaExpirationNotice: 'Your Beta Founding Member status guarantees complete, unrestricted access at zero cost throughout the entire public test phase.',
};

export class MonetizationManager {
  public static isFreeBeta(): boolean {
    return MONETIZATION_CONFIG.mode === 'free_beta';
  }

  public static isPaidMode(): boolean {
    return MONETIZATION_CONFIG.mode === 'paid';
  }

  public static getFreeLimit(): number {
    return MONETIZATION_CONFIG.freeTierMaxFiles;
  }
}
