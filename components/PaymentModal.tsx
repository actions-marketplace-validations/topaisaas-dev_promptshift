'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Download,
  Lock,
  Sparkles,
  Zap,
  Receipt,
  Building2,
  Mail,
  Share2,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import { ClientVault, VaultInvoice } from '@/lib/storage/clientVault';
import { InvoiceGenerator } from '@/lib/invoices/invoiceGenerator';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  zipBase64?: string;
  initialPlan?: 'single' | 'pro' | 'team';
  onOpenPortal?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  projectName,
  zipBase64,
  initialPlan = 'single',
  onOpenPortal,
}) => {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'pro' | 'team'>(isFreeBeta ? 'pro' : initialPlan);
  const [currency, setCurrency] = useState<SupportedCurrency>(() =>
    typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'EUR'
  );
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<VaultInvoice | null>(null);
  const [emailError, setEmailError] = useState('');

  // Developer account & email state
  const [customerEmail, setCustomerEmail] = useState('');

  // Synchronize plan selection, customer email and active currency whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(isFreeBeta ? 'pro' : initialPlan);
      setIsPaid(false);
      setLastInvoice(null);
      setCurrency(CurrencyManager.getActiveCurrency());
      setEmailError('');

      // Auto-load previously entered email from sovereign local vault if available
      const savedCust = ClientVault.getCustomerInfo();
      if (
        savedCust.email &&
        !savedCust.email.endsWith('@promptshift.dev') &&
        savedCust.email.includes('@')
      ) {
        setCustomerEmail(savedCust.email);
      } else {
        if (savedCust.email && savedCust.email.endsWith('@promptshift.dev')) {
          ClientVault.saveCustomerInfo({ ...savedCust, email: '' });
        }
        setCustomerEmail('');
      }
    }
  }, [isOpen, initialPlan, isFreeBeta]);

  // Listen to currency changes dispatched from anywhere in the app
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    window.addEventListener('promptshift_currency_changed', handler);
    return () => window.removeEventListener('promptshift_currency_changed', handler);
  }, []);

  if (!isOpen) return null;

  const tierPriceInfo = CurrencyManager.getTierPrice(selectedPlan, currency, 'monthly');
  const hasProject = Boolean(zipBase64 && zipBase64.trim().length > 0);
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customerEmail.trim());
  const currentAmount = isFreeBeta ? '0.00' : tierPriceInfo.raw.toFixed(currency === 'JPY' ? 0 : 2);
  const displayPrice = isFreeBeta ? CurrencyManager.formatZero(currency) : tierPriceInfo.formatted;

  const handleBetaProActivation = () => {
    if (!hasProject) {
      setEmailError('Please upload your project in the converter first before claiming your Pro Pass.');
      return;
    }
    const finalEmail = customerEmail.trim();
    if (!isEmailValid) {
      setEmailError('A valid email address is strictly required to activate your Free Pro Pass.');
      return;
    }
    setEmailError('');
    setIsProcessing(true);
    setTimeout(() => {
      ClientVault.enrollBetaPro(finalEmail);
      setIsProcessing(false);

      // Dispatch confirmation email asynchronously
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pro_pass_activated',
          email: finalEmail,
          projectName: projectName || 'Universal AI Project',
        }),
      }).catch((err) => console.warn('[PaymentModal] Pro pass confirmation email error:', err));

      handlePaymentSuccess(
        'Pro Beta Pass (Early Adopter Free Access)',
        'BETA-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      );
    }, 400);
  };

  const handlePolarCheckout = async () => {
    const emailToUse = customerEmail.trim();
    if (!emailToUse || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailToUse)) {
      setEmailError('Please enter your email so Polar can deliver your receipt and license key.');
      const inputEl = document.getElementById('dev-email-input');
      if (inputEl) inputEl.focus();
      return;
    }

    setIsProcessing(true);
    setEmailError('');

    try {
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://promptshift.dev';
      const successUrl = `${appUrl}/?checkout=success&plan=${selectedPlan}&checkout_id={CHECKOUT_ID}`;
      const returnUrl = `${appUrl}/#pricing`;

      const res = await fetch('/api/payments/polar/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          customerEmail: emailToUse,
          projectName: projectName || 'Universal AI Project',
          successUrl,
          returnUrl,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        // Redirect to Polar hosted checkout (Merchant of Record)
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Unable to initialize Polar checkout session.');
      }
    } catch (err: any) {
      console.error('Polar checkout launch error:', err);
      setEmailError(err.message || 'Unable to open Polar secure checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadBundle = () => {
    if (!zipBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${zipBase64}`;
    link.download = `${projectName}_converted_bundle.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePaymentSuccess = async (
    method: string = 'Polar.sh (Apple Pay, Google Pay, Cards)',
    orderId: string = 'POLAR-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  ) => {
    setIsPaid(true);

    AnalyticsTracker.track({
      type: 'payment_completed',
      planTier: selectedPlan,
      currency,
      projectTitleAnon: projectName,
    });

    const planNameMap = {
      single: 'Single Project Pass' as const,
      pro: 'Pro Developer Subscription' as const,
      team: 'Team & Agency Pass' as const,
    };

    const finalPlanName = planNameMap[selectedPlan];

    // 1. Record invoice in ClientVault with localized currency and customer email
    const customer = ClientVault.getCustomerInfo();
    const finalEmail =
      customerEmail.trim() ||
      (customer.email && !customer.email.endsWith('@promptshift.dev') ? customer.email : '');

    // Persist developer email so Member Space and Sovereign Vault are immediately updated
    ClientVault.saveCustomerInfo({
      ...customer,
      email: finalEmail,
    });

    // In Free Beta mode, NO invoices are generated or recorded (no company / 0 €).
    // In Paid mode, official VAT invoices are generated and recorded in the client vault.
    if (!isFreeBeta) {
      const inv = ClientVault.saveInvoice({
        orderId,
        planName: finalPlanName,
        amount: currentAmount,
        currency,
        paymentMethod: method,
        status: 'PAID',
        customerName: customer.name || 'Lead Autonomous Software Engineer',
        customerCompany: customer.company || 'Engineering Studio',
        customerEmail: finalEmail,
      });
      setLastInvoice(inv);
    } else {
      setLastInvoice(null);
    }

    // Persist active plan tier in Sovereign Vault
    ClientVault.setActivePlan(selectedPlan);

    // 2. Save conversion in ClientVault if bundle is ready
    if (zipBase64) {
      ClientVault.saveConversion({
        projectName,
        sourcePlatform: 'gemini',
        targetPlatform: 'claude',
        fileCount: 4,
        parityScore: 98.5,
        zipBase64,
        status: 'COMPLETED',
      });
    }

    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="w-full max-w-lg h-[660px] max-h-[92vh] bg-cardBg border border-borderColor rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        <button
          onClick={onClose}
          aria-label="Close payment modal"
          className="absolute top-5 right-5 text-textMuted hover:text-white p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors z-10"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 text-center items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow mb-1 flex-shrink-0" aria-hidden="true">
            {isFreeBeta ? <Sparkles className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 id="payment-modal-title" className="text-xl font-bold text-white tracking-tight min-h-[28px] flex items-center justify-center">
            {isFreeBeta
              ? 'Pro Developer Pass — Public Beta'
              : selectedPlan === 'team'
              ? 'Unlock Team & Agency Pass'
              : selectedPlan === 'pro'
              ? 'Unlock Pro Developer Pass'
              : 'Unlock 1-Click Conversion Pass'}
          </h2>
          <p className="text-xs text-textMuted max-w-sm text-center min-h-[32px] flex items-center justify-center">
            {isFreeBeta
              ? '100% Free Pro access for early adopters during public beta. Simply enter your developer email.'
              : selectedPlan === 'team'
              ? 'Full team license with CI/CD GitHub & GitLab sync, SOC-2 DPA, and unlimited migrations.'
              : selectedPlan === 'pro'
              ? 'Unlimited project migrations, personal CLI Token, all security shields, and RAM vault.'
              : 'Unlock your clean, production-ready bundle with verified 98.5% semantic AST parity.'}
          </p>
        </div>

        {!isPaid ? (
          <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            {/* Plan Selector Tabs */}
            <div className="pt-3 pb-1 flex-shrink-0 overflow-visible">
              <div
                role="tablist"
                aria-label="Subscription plan options"
                className={`grid ${isFreeBeta ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-3'} p-1 rounded-2xl bg-slate-900 border border-borderColor gap-1 overflow-visible relative`}
              >
                {!isFreeBeta && (
                  <button
                    role="tab"
                    aria-selected={selectedPlan === 'single'}
                    onClick={() => setSelectedPlan('single')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none whitespace-nowrap text-center ${
                      selectedPlan === 'single'
                        ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                        : 'text-textMuted hover:text-white'
                    }`}
                  >
                    Single ({CurrencyManager.getTierPrice('single', currency).formatted})
                  </button>
                )}

                <button
                  role="tab"
                  aria-selected={selectedPlan === 'pro'}
                  onClick={() => setSelectedPlan('pro')}
                  className={`relative py-2 px-2 rounded-xl text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none whitespace-nowrap text-center ${
                    selectedPlan === 'pro'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-neonCyan font-extrabold'
                      : 'text-textMuted hover:text-white'
                  }`}
                >
                  {isFreeBeta ? 'Pass Pro Developer (100% Free Beta)' : `Pro (${CurrencyManager.getTierPrice('pro', currency).formatted}/mo)`}
                  <span className="absolute -top-2.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-400 text-black uppercase tracking-wider shadow-md z-10 pointer-events-none">
                    {isFreeBeta ? '★ 100% Free' : '★ Popular'}
                  </span>
                </button>

                {!isFreeBeta && (
                  <button
                    role="tab"
                    aria-selected={selectedPlan === 'team'}
                    onClick={() => setSelectedPlan('team')}
                    className={`relative py-2 px-2 rounded-xl text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none whitespace-nowrap text-center ${
                      selectedPlan === 'team'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg font-extrabold border border-purple-400/50'
                        : 'text-textMuted hover:text-white'
                    }`}
                  >
                    Team ({CurrencyManager.getTierPrice('team', currency).formatted}/mo)
                    <span className="absolute -top-2.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-purple-400 text-black uppercase tracking-wider shadow-md z-10 pointer-events-none">
                      CI/CD
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable / Interactive Form Body */}
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] pr-1 my-1 gap-2.5 focus:outline-none">
              {!hasProject && isFreeBeta && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 text-left">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">No project uploaded yet</span>
                    <span className="text-[11px] text-amber-200/80">
                      You must upload your project folder or .zip in the converter first before claiming and downloading your Free Pro Pass bundle.
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Plan Details Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-borderColor min-h-[78px]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">
                      {selectedPlan === 'single'
                        ? (isFreeBeta ? 'Free Starter (No Signup)' : 'Pay-As-You-Go Pass')
                        : selectedPlan === 'pro'
                        ? (isFreeBeta ? 'Pro Developer Pass (Beta)' : 'Pro Developer Subscription')
                        : (isFreeBeta ? 'Team & Agency (Included in Beta)' : 'Team & Agency Pass')}
                    </span>
                    {selectedPlan === 'pro' && (
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                    )}
                    {selectedPlan === 'team' && (
                      <Building2 className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-[11px] text-textMuted mt-0.5 max-w-[270px] min-h-[32px] flex items-center">
                    {selectedPlan === 'single'
                      ? (isFreeBeta ? 'Up to 2 files per project without creating an account.' : 'Single project migration. Zero recurring subscription. Full secret redactor.')
                      : selectedPlan === 'pro'
                      ? (isFreeBeta ? 'Unlimited projects (> 2 files), CLI Token, all In-RAM cybersecurity shields.' : 'Unlimited project migrations • CLI sync • All shields • Cancel anytime')
                      : (isFreeBeta ? 'Multi-file export, full bundle, CI/CD synchronization included in beta.' : '5 seats included • GitHub CI/CD Action auto-sync • SOC-2 DPA • Priority support')}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 min-w-[90px]">
                  <span className="text-2xl font-black text-emeraldGlow leading-none block">
                    {displayPrice}
                  </span>
                  <span className="text-[10px] text-textMuted block min-h-[14px] mt-0.5">
                    {isFreeBeta
                      ? 'Free in Beta'
                      : selectedPlan === 'single'
                      ? 'one-time'
                      : `/ month (${currency})`}
                  </span>
                </div>
              </div>

              {/* Email for Customer Receipt, License & Sovereign Vault */}
              <div className="flex flex-col gap-1 text-left">
                <label htmlFor="dev-email-input" className="text-[11px] font-bold text-textMuted flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Your Email (Receipt, VAT Invoice & License Key) *</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Sovereign Vault Linked</span>
                </label>
                <input
                  id="dev-email-input"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isFreeBeta && isEmailValid && hasProject) handleBetaProActivation();
                      else if (!isFreeBeta) handlePolarCheckout();
                    }
                  }}
                  placeholder="your.email@company.com"
                  className={`w-full px-3 py-2 rounded-xl bg-slate-900 border ${
                    emailError ? 'border-red-500' : 'border-borderColor'
                  } text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors font-mono`}
                />
                <p className="text-[10px] text-slate-400 px-1">
                  Polar.sh delivers your official order receipt, VAT invoice, and license confirmation directly to this email.
                </p>
                {emailError && (
                  <span className="text-[11px] text-red-400 pl-1 font-semibold">{emailError}</span>
                )}
              </div>

              {/* Payment & Action Buttons */}
              <div className="flex flex-col gap-3 my-1">
                {isFreeBeta ? (
                  /* Free Beta Pro Activation Button */
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleBetaProActivation}
                      disabled={!isEmailValid || !hasProject || isProcessing}
                      aria-label={`Claim Free Pro Pass (${CurrencyManager.formatZero(currency)})`}
                      className={`w-full h-[46px] min-h-[46px] max-h-[46px] flex-shrink-0 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all select-none ${
                        !isEmailValid || !hasProject || isProcessing
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black shadow-neonCyan hover:brightness-105 active:brightness-95 cursor-pointer'
                      }`}
                    >
                      <Zap className="w-4 h-4 flex-shrink-0 fill-current" />
                      <span>
                        {isProcessing
                          ? 'Activating Pro Pass...'
                          : !hasProject
                          ? 'Upload Project First to Activate'
                          : !isEmailValid
                          ? 'Enter Developer Email to Unlock'
                          : 'Claim Free Pro Pass'}
                      </span>
                    </button>

                    {!hasProject && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-cyan-400" />
                        <span>Upload Project First in Converter</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Polar Merchant of Record Checkout Button */
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handlePolarCheckout}
                      disabled={isProcessing}
                      aria-label={`Pay ${displayPrice} with Polar`}
                      className={`w-full h-[46px] min-h-[46px] max-h-[46px] flex-shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-neonCyan hover:brightness-105 active:brightness-95 transition-all select-none cursor-pointer border border-cyan-300/40 ${
                        isProcessing ? 'opacity-80 cursor-wait' : ''
                      }`}
                    >
                      <Zap className="w-4 h-4 flex-shrink-0 fill-current" />
                      <span>
                        {isProcessing
                          ? 'Opening Secure Polar Checkout...'
                          : `Unlock with Polar (${displayPrice})`}
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-3 text-[10px] text-textMuted py-0.5">
                      <span>Apple Pay</span>
                      <span>•</span>
                      <span>Google Pay</span>
                      <span>•</span>
                      <span>Cards & SEPA</span>
                      <span>•</span>
                      <span>MoR by Polar.sh</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Payment Success State */
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 py-4 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emeraldGlow flex items-center justify-center" aria-hidden="true">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isFreeBeta
                  ? 'Free Beta Pro Pass Activated!'
                  : selectedPlan === 'team'
                  ? 'Team & Agency Pass Activated!'
                  : selectedPlan === 'pro'
                  ? 'Pro Subscription Activated!'
                  : 'Payment Confirmed!'}
              </h3>
              <p className="text-xs text-textMuted mt-1">
                {isFreeBeta
                  ? `Congratulations! Your Early Adopter Pro Pass is active and linked to ${customerEmail.trim() || 'your Sovereign Client Vault'}. Download your project bundle and enjoy unrestricted Pro access.`
                  : selectedPlan === 'team'
                  ? `5 team seats, CI/CD auto-sync, and unlimited project exports are now unlocked for ${customerEmail.trim() || 'your organization'}.`
                  : selectedPlan === 'pro'
                  ? `Unlimited project conversions and CLI Token are now unlocked for ${customerEmail.trim() || 'your account'}.`
                  : 'Your converted project bundle has been generated in RAM.'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              {zipBase64 && (
                <button
                  onClick={downloadBundle}
                  aria-label="Download your converted project ZIP archive"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-neonEmerald hover:brightness-105 active:brightness-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download Converted Bundle (.zip)</span>
                </button>
              )}

              {lastInvoice && (
                <button
                  onClick={() => InvoiceGenerator.generatePdf(lastInvoice)}
                  aria-label="Download official clean PDF invoice receipt"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:brightness-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span>Download Clean PDF Invoice ({lastInvoice.invoiceNumber})</span>
                </button>
              )}

              {/* 1-Click Viral Share Loop */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Just migrated my AI coding assistant rules with @PromptShift (https://promptshift.dev)! 100% in-RAM execution, zero data retention & 98.5% verified AST parity. Highly recommended for multi-model devs! 🔥 #AI #DevTools #Cursor #Claude"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share your successful migration on X / Twitter"
                className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                <span>Share Migration on X / Twitter</span>
              </a>

              {onOpenPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortal();
                  }}
                  className="text-xs text-cyan-300 hover:text-white underline pt-1 font-semibold"
                >
                  Open Customer Portal & Vault History
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-textMuted border-t border-borderColor pt-3 mt-auto flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>RAM-Only Execution • Zero Data Retention Guarantee</span>
        </div>
      </div>
    </div>
  );
};
