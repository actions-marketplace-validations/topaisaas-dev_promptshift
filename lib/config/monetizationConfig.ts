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
  betaBadge: 'BÊTA PUBLIQUE • PRO OFFERT',
  betaHeadline: 'Le Convertisseur Universel de Projets IA — 100% Gratuit en Bêta Ouverte',
  betaNotice: 'PromptShift est actuellement en bêta publique ouverte. Le Pass Pro est offert à tous les développeurs early adopters.',

  // Pro tier options during beta
  allowProDuringBeta: true,
  requireEmailForProBeta: true,

  // Transition to paid roadmap notice
  betaExpirationNotice: "Votre statut de Membre Fondateur Bêta vous garantit un accès complet sans frais pendant toute la phase de test public.",
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
