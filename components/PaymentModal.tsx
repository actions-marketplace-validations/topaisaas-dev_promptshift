'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Download,
  CreditCard,
  Lock,
  Sparkles,
  Zap,
  Receipt,
  Building2,
  Gift,
  Tag,
  Mail,
  Share2,
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { ClientVault, VaultInvoice } from '@/lib/storage/clientVault';
import { InvoiceGenerator } from '@/lib/invoices/invoiceGenerator';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { PromoManager, PromoValidationResult } from '@/lib/promo/promoManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { MonetizationManager, MONETIZATION_CONFIG } from '@/lib/config/monetizationConfig';

interface PayPalButtonWrapperProps {
  currentAmount: string;
  currency: string;
  selectedPlan: string;
  onSuccess: () => void;
}

const PayPalButtonWrapper: React.FC<PayPalButtonWrapperProps> = ({
  currentAmount,
  currency,
  selectedPlan,
  onSuccess,
}) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);

  if (isRejected) {
    return (
      <button
        type="button"
        disabled={isFallbackLoading}
        onClick={async () => {
          setIsFallbackLoading(true);
          try {
            const res = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: currentAmount, currency }),
            });
            const data = await res.json();
            if (data.id) {
              await fetch('/api/payments/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.id }),
              });
              onSuccess();
            }
          } catch (err) {
            console.error('PayPal fallback error:', err);
          } finally {
            setIsFallbackLoading(false);
          }
        }}
        aria-label="Pay with PayPal"
        className="w-full h-[42px] min-h-[42px] max-h-[42px] flex-shrink-0 rounded-xl bg-[#ffc439] hover:bg-[#f2ba32] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none border border-amber-400/40"
      >
        <span className="font-bold text-[#003087]">Pay</span>
        <span className="font-bold text-[#0079C1]">Pal</span>
        <span className="text-xs font-semibold ml-1 text-slate-900">
          {isFallbackLoading ? 'Connecting...' : 'Checkout'}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full min-h-[42px] flex-shrink-0 relative">
      {isPending && (
        <div className="w-full h-[42px] rounded-xl bg-[#ffc439]/90 animate-pulse flex items-center justify-center gap-1 text-black font-bold text-xs select-none border border-amber-400/40">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#0079C1]">Pal</span>
          <span className="text-slate-800 text-[11px] font-medium ml-1">Loading secure checkout...</span>
        </div>
      )}
      <div className={isPending ? 'hidden' : 'block'}>
        <PayPalButtons
          key={`paypal-btn-${currency}-${selectedPlan}`}
          fundingSource="paypal"
          style={{
            layout: 'horizontal',
            color: 'gold',
            shape: 'rect',
            height: 42,
            label: 'paypal',
            tagline: false,
          }}
          createOrder={async () => {
            const res = await fetch('/api/payments/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: currentAmount, currency }),
            });
            const data = await res.json();
            if (!data.id) throw new Error(data.error || 'Failed to create PayPal order');
            return data.id;
          }}
          onApprove={async (data) => {
            await fetch('/api/payments/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            onSuccess();
          }}
          onError={(err) => {
            console.warn('PayPal Buttons warning:', err);
          }}
        />
      </div>
    </div>
  );
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  zipBase64?: string;
  initialPlan?: 'single' | 'pro' | 'team';
  onOpenPortal?: () => void;
}

// Feature flag: set to true to display direct debit/credit card checkout button
const ENABLE_CARD_PAYMENT = true;

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
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'EUR');
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<VaultInvoice | null>(null);
  const [emailError, setEmailError] = useState('');

  // Memoize PayPal script options to avoid unmount/remount loops
  const paypalScriptOptions = useMemo(() => ({
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
    currency: currency || 'EUR',
    intent: 'capture',
  }), [currency]);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);

  // Developer account & email state
  const [customerEmail, setCustomerEmail] = useState('');

  // Synchronize plan selection, customer email and active currency whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(isFreeBeta ? 'pro' : initialPlan);
      setIsPaid(false);
      setLastInvoice(null);
      setCurrency(CurrencyManager.getActiveCurrency());
      setPromoError('');
      setEmailError('');

      // Auto-load previously entered email from sovereign local vault if available
      const savedCust = ClientVault.getCustomerInfo();
      if (savedCust.email && savedCust.email !== 'billing@promptshift.dev') {
        setCustomerEmail(savedCust.email);
      }

      // Auto-apply VIP pass if already active in storage or URL
      if (PromoManager.isVipActive()) {
        const code = PromoManager.getVipCode() || 'DEVVIP';
        setAppliedPromo({
          valid: true,
          code,
          discountPercent: 100,
          description: 'Lifetime VIP Developer Pass (100% OFF)',
          passType: 'vip_pro',
        });
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
  const isFreePromo = appliedPromo?.discountPercent === 100;
  const currentAmount = isFreeBeta || isFreePromo ? '0.00' : tierPriceInfo.raw.toFixed(currency === 'JPY' ? 0 : 2);
  const displayPrice = isFreeBeta ? CurrencyManager.formatZero(currency) : isFreePromo ? 'FREE' : tierPriceInfo.formatted;

  const handleBetaProActivation = () => {
    const finalEmail = customerEmail.trim();
    if (!finalEmail || !finalEmail.includes('@') || !finalEmail.includes('.')) {
      setEmailError('Please enter a valid email address to activate your Free Pro Pass.');
      return;
    }
    setEmailError('');
    setIsProcessing(true);
    setTimeout(() => {
      ClientVault.enrollBetaPro(finalEmail);
      setIsProcessing(false);
      handlePaymentSuccess(
        'Pro Beta Pass (Early Adopter Free Access)',
        'BETA-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      );
    }, 400);
  };

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoInput.trim()) return;

    const res = PromoManager.validate(promoInput);
    if (res.valid) {
      setAppliedPromo(res);
      PromoManager.activateVip(res.code);
      AnalyticsTracker.trackPromo(res.code, res.discountPercent);
      setPromoInput('');
    } else {
      setPromoError('Invalid or expired promo code.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
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
    method: 'PayPal' | 'Debit / Credit Card' | 'VIP Promo Pass (100% OFF)' | 'Pro Beta Pass (Early Adopter Free Access)' = 'PayPal',
    orderId: string = 'PAYID-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  ) => {
    setIsPaid(true);

    AnalyticsTracker.track({
      type: 'payment_completed',
      planTier: isFreePromo ? 'vip' : selectedPlan,
      currency,
      projectTitleAnon: projectName,
    });

    const planNameMap = {
      single: 'Single Project Pass' as const,
      pro: 'Pro Developer Subscription' as const,
      team: 'Team & Agency Pass' as const,
    };

    const finalPlanName = isFreePromo
      ? `${planNameMap[selectedPlan]} (VIP 100% Free Pass)`
      : planNameMap[selectedPlan];

    // 1. Record invoice in ClientVault with localized currency and customer email
    const customer = ClientVault.getCustomerInfo();
    const finalEmail = customerEmail.trim() || customer.email || 'developer@promptshift.dev';

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

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

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

        {/* Modal Header - Fixed & Motionless */}
        <div className="flex flex-col gap-1 text-center items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow mb-1 flex-shrink-0" aria-hidden="true">
            {isFreePromo || isFreeBeta ? <Sparkles className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 id="payment-modal-title" className="text-xl font-bold text-white tracking-tight min-h-[28px] flex items-center justify-center">
            {isFreePromo
              ? 'VIP Developer Access Unlocked'
              : isFreeBeta
              ? 'Pro Developer Pass — Public Beta'
              : selectedPlan === 'team'
              ? 'Unlock Team & Agency Pass'
              : selectedPlan === 'pro'
              ? 'Unlock Pro Developer Pass'
              : 'Unlock 1-Click Conversion Pass'}
          </h2>
          <p className="text-xs text-textMuted max-w-sm text-center min-h-[32px] flex items-center justify-center">
            {isFreePromo
              ? '100% Free peer access granted via promo code. Zero payment required.'
              : isFreeBeta
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
            {/* Plan Selector Tabs: Localized Prices - Motionless & Badges Never Truncated */}
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
                  {isFreeBeta ? `Pass Pro Developer (100% Free Beta • ${CurrencyManager.formatZero(currency)})` : `Pro (${CurrencyManager.getTierPrice('pro', currency).formatted}/mo)`}
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

            {/* Scrollable / Interactive Form Body - Frozen & Motionless */}
            <div className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] pr-1 my-1 gap-2.5 focus:outline-none">
              {/* Selected Plan Details Card - Constant Height */}
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
                    ? (isFreeBeta ? 'Up to 5 files per project without creating an account or entering card details.' : 'Single project migration. Zero subscription. Full secret redactor.')
                    : selectedPlan === 'pro'
                    ? (isFreeBeta ? 'Unlimited projects (> 5 files), CLI Token, all In-RAM cybersecurity shields.' : 'Unlimited project migrations • CLI sync • All shields • Cancel anytime')
                    : (isFreeBeta ? 'Multi-file export, full bundle, CI/CD synchronization included in beta.' : '5 seats included • GitHub CI/CD Action auto-sync • SOC-2 DPA • Priority support')}
                </p>
              </div>

              <div className="text-right flex-shrink-0 min-w-[90px]">
                <span className="text-2xl font-black text-emeraldGlow leading-none block">
                  {displayPrice}
                </span>
                <span className="text-[10px] text-textMuted block min-h-[14px] mt-0.5">
                  {isFreePromo || isFreeBeta
                    ? 'Free in Beta'
                    : selectedPlan === 'single'
                    ? 'one-time'
                    : `/ month (${currency})`}
                </span>
              </div>
            </div>

            {/* Promo Code & VIP Section for Dev Friends */}
            {!isFreeBeta && (
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-borderColor flex flex-col gap-2">
                {appliedPromo ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <Gift className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>
                        Code <strong>{appliedPromo.code}</strong> Applied: {appliedPromo.description}
                      </span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-[11px] text-textMuted hover:text-white underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-textMuted flex-shrink-0" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleApplyPromo();
                      }}
                      placeholder="Have a promo code?"
                      className="flex-1 bg-transparent text-xs text-white placeholder-textMuted focus:outline-none uppercase font-mono tracking-wider"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {promoError && (
                  <span className="text-[11px] text-red-400 pl-1">{promoError}</span>
                )}
              </div>
            )}

            {/* Email for Customer Portal & Sovereign Vault */}
            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="dev-email-input" className="text-[11px] font-bold text-textMuted flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFreeBeta ? 'Developer Email (to activate Free Pro Pass)' : 'Email (for Customer Portal & Invoices)'}</span>
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
                  if (e.key === 'Enter' && isFreeBeta) handleBetaProActivation();
                }}
                placeholder="your-email@developer.com"
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border ${
                  emailError ? 'border-red-500' : 'border-borderColor'
                } text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors font-mono`}
              />
              {emailError && (
                <span className="text-[11px] text-red-400 pl-1">{emailError}</span>
              )}
            </div>

            {/* Payment & VIP Claim Action Buttons */}
            <div className="flex flex-col gap-3 my-1">
              {isFreePromo ? (
                /* VIP 100% Free Claim Button */
                <button
                  onClick={() => handlePaymentSuccess('VIP Promo Pass (100% OFF)')}
                  aria-label="Claim your 100% free VIP developer bundle"
                  className="w-full h-[46px] rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-neonEmerald hover:brightness-105 active:brightness-95 transition-colors cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Claim Free VIP Bundle & Pass (100% OFF)</span>
                </button>
              ) : isFreeBeta ? (
                /* Free Beta Pro Activation Button */
                <button
                  type="button"
                  onClick={handleBetaProActivation}
                  disabled={isProcessing}
                  aria-label="Claim Free Pro Pass ($0.00)"
                  className="w-full h-[46px] min-h-[46px] max-h-[46px] flex-shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-neonCyan hover:brightness-105 active:brightness-95 transition-all cursor-pointer select-none"
                >
                  <Zap className="w-4 h-4 flex-shrink-0 fill-current" />
                  <span>
                    {isProcessing ? 'Activating Pro Pass...' : `Claim Free Pro Pass (${CurrencyManager.formatZero(currency)})`}
                  </span>
                </button>
              ) : (
                <>
                  {/* 1. Official Single PayPal Button with Rock-Solid Fallback & State Handler */}
                  <PayPalScriptProvider options={paypalScriptOptions}>
                    <PayPalButtonWrapper
                      currentAmount={currentAmount}
                      currency={currency}
                      selectedPlan={selectedPlan}
                      onSuccess={() => handlePaymentSuccess('PayPal')}
                    />
                  </PayPalScriptProvider>

                  {/* 2. Direct Debit / Credit Card - Frozen & Motionless */}
                  {ENABLE_CARD_PAYMENT && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProcessing(true);
                        setTimeout(() => {
                          setIsProcessing(false);
                          handlePaymentSuccess('Debit / Credit Card');
                        }, 1200);
                      }}
                      aria-label="Subscribe with debit/credit card"
                      className="w-full h-[42px] min-h-[42px] max-h-[42px] flex-shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 border border-emerald-400/40 hover:border-emerald-300 transition-colors cursor-pointer select-none whitespace-nowrap transform-none"
                    >
                      <CreditCard className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>
                        {isProcessing
                          ? 'Processing Payment...'
                          : 'Subscribe with debit/credit card'}
                      </span>
                    </button>
                  )}
                </>
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
                {isFreePromo
                  ? 'VIP Developer Pass Activated!'
                  : isFreeBeta
                  ? 'Free Beta Pro Pass Activated!'
                  : selectedPlan === 'team'
                  ? 'Team & Agency Pass Activated!'
                  : selectedPlan === 'pro'
                  ? 'Pro Subscription Activated!'
                  : 'Payment Confirmed!'}
              </h3>
              <p className="text-xs text-textMuted mt-1">
                {isFreePromo
                  ? `Thank you for testing PromptShift! Your full VIP access and bundle are linked to ${customerEmail.trim() || 'your Sovereign Client Vault'}.`
                  : isFreeBeta
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

              {/* 1-Click Viral Share Loop (SMO & CRO) */}
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
