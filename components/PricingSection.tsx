'use client';

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Shield, Building2, Terminal } from 'lucide-react';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { ClientVault, UserPlanTier } from '@/lib/storage/clientVault';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface PricingSectionProps {
  onSelectPlan: (plan: 'single' | 'pro' | 'team') => void;
  onStartFree: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan, onStartFree }) => {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'EUR');
  const [activePlan, setActivePlan] = useState<UserPlanTier>('free');

  useEffect(() => {
    CurrencyManager.initFromIp().then((curr) => {
      setCurrency(curr);
    });
    setActivePlan(ClientVault.getActivePlan());

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };

    const planHandler = (e: Event) => {
      const custom = e as CustomEvent<UserPlanTier>;
      if (custom.detail) setActivePlan(custom.detail);
      else setActivePlan(ClientVault.getActivePlan());
    };

    window.addEventListener('promptshift_currency_changed', handler);
    window.addEventListener('promptshift_plan_changed', planHandler);

    return () => {
      window.removeEventListener('promptshift_currency_changed', handler);
      window.removeEventListener('promptshift_plan_changed', planHandler);
    };
  }, []);

  const singlePrice = CurrencyManager.getTierPrice('single', currency, billingCycle);
  const proPrice = CurrencyManager.getTierPrice('pro', currency, billingCycle);
  const teamPrice = CurrencyManager.getTierPrice('team', currency, billingCycle);

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="w-full max-w-6xl mx-auto py-12 flex flex-col gap-8">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isFreeBeta ? 'OPEN PUBLIC BETA • FREE PRO PASS AVAILABLE' : 'TRANSPARENT PRICING & SUBSCRIPTIONS'}</span>
        </div>

        <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isFreeBeta ? 'Enjoy 100% Free Public Beta Access' : 'Flexible Pricing for Solo Devs & Engineering Teams'}
        </h2>

        <p className="text-xs sm:text-sm text-textMuted max-w-xl leading-relaxed">
          {isFreeBeta
            ? 'Test PromptShift freely with zero commitment. Unlock full multi-platform Pro access simply by saving your developer email.'
            : 'From free quick-conversions to unlimited Pro passes and enterprise CI/CD sync. Zero hidden fees.'}
        </p>

        {/* Monthly vs Annual Toggle (Only for commercial paid mode) */}
        {!isFreeBeta && (
          <div className="flex items-center gap-3 p-1 rounded-2xl bg-slate-900 border border-borderColor mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-textMuted hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-neonCyan'
                  : 'text-textMuted hover:text-white'
              }`}
            >
              <span>Annual Pass</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-black font-black uppercase">
                Save 30%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: 2 clean cards in Free Beta mode (Starter & Pro Developer), or 3 tiers in commercial mode */}
      <div className={`grid grid-cols-1 ${isFreeBeta ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8 items-stretch w-full`}>
        {/* Tier 1: Free Starter */}
        <div className="p-7 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Free Starter</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-white">{currency === 'EUR' ? '0 €' : '$0'}</span>
                <span className="text-xs text-textMuted">/ forever</span>
              </div>
              <p className="text-xs text-textMuted mt-2 leading-relaxed">
                Ideal for small projects, rule files, and single prompt tests. No email or signup required.
              </p>
            </div>

            <div className="border-t border-borderColor pt-5 flex flex-col gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Up to <strong>5 files</strong> per project</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Pre-flight diff & AST inspector</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>1-Click clean ZIP download</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>In-RAM basic secret check</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero account or credit card needed</span>
              </div>
            </div>
          </div>

          <button
            onClick={onStartFree}
            className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {activePlan === 'free' ? 'Current Plan (Free Starter)' : 'Start Free'}
          </button>
        </div>

        {/* Tier 2: Pro Developer Pass (Merged with Multi-Platform benefits) */}
        <div className="p-7 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-cardBg to-cardBg border-2 border-cyanGlow/50 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-neonCyan">
            {isFreeBeta ? '★ Open Beta — 100% Free' : '★ Most Popular'}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Pro Developer</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-white">
                  {isFreeBeta ? (currency === 'EUR' ? '0 €' : '$0') : proPrice.formatted}
                </span>
                <span className="text-xs text-textMuted">
                  {isFreeBeta ? '/ free with email' : proPrice.billingSuffix}
                </span>
              </div>
              <p className="text-xs text-textMuted mt-2 leading-relaxed">
                {isFreeBeta
                  ? 'Complete multi-platform access for early adopters. Convert large repositories across all ecosystems with zero file limit.'
                  : 'For active developers porting agents across IDEs and models daily.'}
              </p>
            </div>

            <div className="border-t border-borderColor pt-5 flex flex-col gap-3 text-xs text-white">
              <div className="flex items-center gap-2.5 font-medium">
                <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span><strong>Unlimited project exports</strong> (no file limit)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>All 4 formats: <strong>Claude, OpenAI, Cursor & Gemini</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Up to <strong>500+ files</strong> per project</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full <strong>In-RAM Secret Redactor</strong> (15+ token patterns)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>98.5% Certified Parity</strong> AST transpiler</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span><strong>CLI Token</strong> for terminal workflows</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('pro')}
            className={`w-full mt-8 py-3 rounded-xl font-black text-xs transition-all ${
              activePlan === 'pro' && !isFreeBeta
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-none'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-neonCyan hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            }`}
          >
            {activePlan === 'pro'
              ? (isFreeBeta ? 'Pro Pass Active (Beta Member)' : 'Current Plan (Pro Active)')
              : isFreeBeta
              ? 'Claim Free Pro Pass (0 €)'
              : `Subscribe Pro (${proPrice.formatted})`}
          </button>
        </div>

        {/* Commercial Team Tier (Only rendered when isFreeBeta is false) */}
        {!isFreeBeta && (
          <div className="p-7 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Team & Agency</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">{teamPrice.formatted}</span>
                  <span className="text-xs text-textMuted">{teamPrice.billingSuffix}</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  For engineering teams, development studios, and agency multi-seat workflows.
                </p>
              </div>

              <div className="border-t border-borderColor pt-5 flex flex-col gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span><strong>5 team seats included</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span><strong>GitHub & GitLab Action CI/CD</strong> auto-sync</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>100% Client-Side WebAssembly Mode</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Signed SOC2 & GDPR DPA</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Priority Slack & Discord support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('team')}
              disabled={activePlan === 'team'}
              className={`w-full mt-8 py-3 rounded-xl font-bold text-xs border transition-all ${
                activePlan === 'team'
                  ? 'bg-purple-600/30 text-purple-300 border-purple-400/50 cursor-default shadow-sm'
                  : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border-purple-500/40 cursor-pointer hover:scale-[1.02]'
              }`}
            >
              {activePlan === 'team' ? 'Current Plan (Team Active)' : `Upgrade to Team (${teamPrice.formatted})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
