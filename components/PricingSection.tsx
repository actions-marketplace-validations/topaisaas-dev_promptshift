'use client';

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Shield, Building2, Terminal } from 'lucide-react';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { ClientVault, UserPlanTier } from '@/lib/storage/clientVault';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface PricingSectionProps {
  onSelectPlan: (plan: 'single' | 'pro' | 'team') => void;
  onStartFree: () => void;
  onSelectPro?: () => void;
  hasProject?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  onStartFree,
  onSelectPro,
  hasProject = false,
}) => {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<SupportedCurrency>(() =>
    typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD'
  );
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
    <section id="pricing" aria-labelledby="pricing-heading" className="w-full max-w-7xl mx-auto py-12 flex flex-col gap-8">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isFreeBeta ? 'OPEN PUBLIC BETA • 100% FREE PLANS' : 'TRANSPARENT PRICING & SUBSCRIPTIONS'}</span>
        </div>

        <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isFreeBeta ? '100% Free Public Beta Plans' : 'Flexible Pricing for Solo Devs & Engineering Teams'}
        </h2>

        <p className="text-xs sm:text-sm text-textMuted max-w-xl leading-relaxed">
          {isFreeBeta
            ? 'Test PromptShift freely with zero commitment. Free Starter requires zero account, and Pro Developer access is 100% complimentary during the open public beta.'
            : 'From free small conversions to single repository passes, unlimited Pro subscriptions, and team CI/CD sync.'}
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

      {/* Grid: 2 balanced cards in Free Beta mode (Free Starter + Pro Developer), or 4 distinct tiers in Commercial Paid mode */}
      {isFreeBeta ? (
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Plan 1: Free Starter */}
          <div className="p-8 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Free Starter</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">{CurrencyManager.formatZero(currency)}</span>
                  <span className="text-xs text-textMuted">/ forever (no email required)</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  Ideal for small projects, rule files, and single prompt tests. No email, account or credit card required.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Up to <strong>2 files</strong> per project</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pre-flight diff & AST inspector</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>1-Click clean ZIP download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>In-RAM basic secret check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Zero account, email or card needed</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartFree}
              className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {activePlan === 'free' ? 'Current Plan (Start Free)' : 'Start Free (≤ 2 files)'}
            </button>
          </div>

          {/* Plan 2: Pro Developer (Beta Access) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-cardBg to-cardBg border-2 border-cyanGlow/50 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-neonCyan">
              ★ Open Public Beta — 100% Free
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Pro Developer (Beta Access)</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-white">{CurrencyManager.formatZero(currency)}</span>
                  <span className="text-xs text-textMuted">/ free with developer email</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  Complete multi-platform access for early adopters. Convert large repositories across all ecosystems with zero file limit and zero payment.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-3 text-xs text-white">
                <div className="flex items-center gap-2.5 font-medium">
                  <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span><strong>Unlimited project exports</strong> (&gt; 2 files)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>All 4: <strong>Claude, OpenAI, Cursor & Gemini</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Up to <strong>500+ files</strong> per project</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full <strong>In-RAM Secret Redactor</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>98.5% Certified Parity</strong> AST</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-teal-300 flex-shrink-0" />
                  <span><strong>CLI Token</strong> for terminal workflows</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!hasProject) {
                  if (onSelectPro) {
                    onSelectPro();
                  } else {
                    onStartFree();
                  }
                } else {
                  onSelectPlan('pro');
                }
              }}
              className="w-full mt-8 py-3 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-neonCyan hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {activePlan === 'pro'
                ? 'Pro Pass Active (Beta Member)'
                : !hasProject
                ? 'Upload Project to Claim Pro Pass'
                : 'Claim Free Pro Pass'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full">
          {/* Tier 1: Free Starter */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Free Starter</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">{CurrencyManager.formatZero(currency)}</span>
                  <span className="text-xs text-textMuted">/ forever</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  Ideal for small projects, rule files, and single prompt tests. No email or card required.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Up to <strong>2 files</strong> per project</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pre-flight diff & AST inspector</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>1-Click clean ZIP download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>In-RAM basic secret check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Zero account or card needed</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartFree}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {activePlan === 'free' ? 'Current Plan (Starter)' : 'Start Free'}
            </button>
          </div>

          {/* Tier 2: Single Repository Pass ($1.99) */}
          <div className="p-6 rounded-3xl bg-cardBg border border-emerald-500/40 flex flex-col justify-between shadow-lg hover:border-emerald-500/60 transition-all relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              ★ One-Time Pass
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Complete Repository</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">{singlePrice.formatted}</span>
                  <span className="text-xs text-textMuted">/ project</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  One-time pass for complete repositories. Instant migration with zero recurring subscription.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium text-white">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Complete repository export</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full <strong>In-RAM Secret Redactor</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>98.5% Certified Parity</strong> AST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pre-flight diff visual inspector</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pay-as-you-go, zero commitment</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!hasProject) {
                  onStartFree();
                } else {
                  onSelectPlan('single');
                }
              }}
              className="w-full mt-6 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {!hasProject
                ? `Upload Project First (${singlePrice.formatted})`
                : `Get Single Pass (${singlePrice.formatted})`}
            </button>
          </div>

          {/* Tier 3: Pro Developer Pass */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-cardBg to-cardBg border-2 border-cyanGlow/50 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-neonCyan">
              ★ Most Popular
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Pro Developer</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">{proPrice.formatted}</span>
                  <span className="text-xs text-textMuted">{proPrice.billingSuffix}</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  For active developers porting agents across IDEs and models daily.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-white">
                <div className="flex items-center gap-2 font-medium">
                  <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span><strong>Unlimited project exports</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>All 4: <strong>Claude, OpenAI, Cursor & Gemini</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full <strong>In-RAM Secret Redactor</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-300 flex-shrink-0" />
                  <span><strong>CLI Token</strong> for terminal sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Sovereign local RAM vault history</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('pro')}
              className={`w-full mt-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                activePlan === 'pro'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-none'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-neonCyan hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              }`}
            >
              {activePlan === 'pro' ? 'Current Plan (Pro Active)' : `Subscribe Pro (${proPrice.formatted})`}
            </button>
          </div>

          {/* Tier 4: Team & Agency */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Team & Agency</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">{teamPrice.formatted}</span>
                  <span className="text-xs text-textMuted">{teamPrice.billingSuffix}</span>
                </div>
                <p className="text-xs text-textMuted mt-2 leading-relaxed">
                  For engineering teams, development studios, and agency multi-seat workflows.
                </p>
              </div>

              <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span><strong>5 team seats included</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span><strong>GitHub & GitLab Action CI/CD</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>100% Client-Side WebAssembly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Signed SOC2 & GDPR DPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Priority Slack & Discord support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan('team')}
              disabled={activePlan === 'team'}
              className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                activePlan === 'team'
                  ? 'bg-purple-600/30 text-purple-300 border-purple-400/50 cursor-default shadow-sm'
                  : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border-purple-500/40 cursor-pointer hover:scale-[1.02]'
              }`}
            >
              {activePlan === 'team' ? 'Current Plan (Team Active)' : `Upgrade Team (${teamPrice.formatted})`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
