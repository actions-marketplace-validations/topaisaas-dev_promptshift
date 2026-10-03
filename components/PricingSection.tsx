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
          <span>{isFreeBeta ? 'BÊTA PUBLIQUE OUVERTE • PASS PRO OFFERT' : 'TRANSPARENT PRICING & SUBSCRIPTIONS'}</span>
        </div>

        <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {isFreeBeta ? 'Profitez de la Bêta Publique 100% Gratuite' : 'Flexible Pricing for Solo Devs & Engineering Teams'}
        </h2>

        <p className="text-xs sm:text-sm text-textMuted max-w-xl leading-relaxed">
          {isFreeBeta
            ? 'Testez PromptShift librement. Le Pass Pro est offert à tous les développeurs early adopters en renseignant simplement un email.'
            : 'From free quick-conversions to unlimited Pro passes and enterprise CI/CD sync. Zero hidden fees.'}
        </p>

        {/* Monthly vs Annual Toggle */}
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

      {/* 4 Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Tier 1: Free Starter */}
        <div className="p-6 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Free Starter</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">{currency === 'EUR' ? '0 €' : '$0'}</span>
                <span className="text-xs text-textMuted">/ {isFreeBeta ? 'sans compte' : 'forever'}</span>
              </div>
              <p className="text-xs text-textMuted mt-1">
                {isFreeBeta ? 'Idéal pour tester rapidement un projet (jusqu\'à 5 fichiers) sans email.' : 'Ideal for small projects, rule files, and single prompt tests.'}
              </p>
            </div>

            <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Up to <strong>5 files</strong> per project</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Pre-flight diff inspector</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>1-Click basic ZIP download</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>In-RAM basic secret check</span>
              </div>
            </div>
          </div>

          <button
            onClick={onStartFree}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            {activePlan === 'free' ? 'Current Plan (Free)' : 'Start Free'}
          </button>
        </div>

        {/* Tier 2: Pay-As-You-Go */}
        <div className="p-6 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                {isFreeBeta ? 'Multi-Plateforme' : 'Pay-As-You-Go'}
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">
                  {isFreeBeta ? (currency === 'EUR' ? '0 €' : '$0') : singlePrice.formatted}
                </span>
                <span className="text-xs text-textMuted">
                  {isFreeBeta ? '/ inclus en bêta' : singlePrice.billingSuffix}
                </span>
              </div>
              <p className="text-xs text-textMuted mt-1">
                {isFreeBeta ? 'Export complet des 4 formats IA débloqué pendant la phase de bêta ouverte.' : 'One-time micro-pass for occasional full codebase migrations.'}
              </p>
            </div>

            <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span><strong>Full repository export</strong> (no file limit)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>All 4 formats (Claude, OpenAI, Cursor, Gemini)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Zero recurring subscription</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Full In-RAM Secret Redactor</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('pro')}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black text-white font-bold text-xs border border-borderColor transition-all cursor-pointer"
          >
            {isFreeBeta ? 'Inclus avec le Pass Pro' : (activePlan === 'single' ? 'Current Pass (Active)' : `Single Pass (${singlePrice.formatted})`)}
          </button>
        </div>

        {/* Tier 3: Pro Developer Pass - POPULAR */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-cardBg to-cardBg border-2 border-cyanGlow/50 flex flex-col justify-between shadow-2xl relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-neonCyan">
            {isFreeBeta ? '★ Offert en Bêta' : '★ Most Popular'}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Pro Developer</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">
                  {isFreeBeta ? (currency === 'EUR' ? '0 €' : '$0') : proPrice.formatted}
                </span>
                <span className="text-xs text-textMuted">
                  {isFreeBeta ? '/ offert avec email' : proPrice.billingSuffix}
                </span>
              </div>
              <p className="text-xs text-textMuted mt-1">
                {isFreeBeta
                  ? 'Accès complet offert aux early adopters pour convertir sans restriction de fichiers.'
                  : 'For active developers porting agents across IDEs and models daily.'}
              </p>
            </div>

            <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-white">
              <div className="flex items-center gap-2 font-medium">
                <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span><strong>Unlimited project exports</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Up to <strong>500+ files</strong> per project</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Direct single-file download (Save File)</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                <span><strong>CLI Token</strong> for terminal workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>All In-RAM shields & injection defense</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan('pro')}
            disabled={!isFreeBeta && (activePlan === 'team' || activePlan === 'pro')}
            className={`w-full mt-6 py-2.5 rounded-xl font-black text-xs transition-all ${
              activePlan === 'team'
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default opacity-85 shadow-none'
                : activePlan === 'pro'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-none'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black shadow-neonCyan hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {activePlan === 'team'
              ? 'Included in Team License'
              : activePlan === 'pro'
              ? (isFreeBeta ? 'Pass Pro Actif (Bêta)' : 'Current Plan (Pro Active)')
              : isFreeBeta
              ? 'Activer le Pass Pro Gratuit (0 €)'
              : `Subscribe Pro (${proPrice.formatted})`}
          </button>
        </div>

        {/* Tier 4: Team & Agency */}
        <div className="p-6 rounded-3xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Team & Agency</span>
                {isFreeBeta && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Bientôt
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">
                  {teamPrice.formatted}
                </span>
                <span className="text-xs text-textMuted">
                  {teamPrice.billingSuffix}
                </span>
              </div>
              <p className="text-xs text-textMuted mt-1">
                {isFreeBeta
                  ? 'Pour les studios de développement et équipes. Déployé lors du lancement officiel.'
                  : 'For development studios, AI consultancies, and multi-dev teams.'}
              </p>
            </div>

            <div className="border-t border-borderColor pt-4 flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span><strong>5 team seats included</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span><strong>GitHub & GitLab Action CI/CD</strong> auto-sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>100% Client-Side WebAssembly Mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Signed SOC2 & GDPR DPA</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Priority Slack & Discord support</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isFreeBeta) onSelectPlan('team');
            }}
            disabled={isFreeBeta || activePlan === 'team'}
            className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs border transition-all ${
              activePlan === 'team'
                ? 'bg-purple-600/30 text-purple-300 border-purple-400/50 cursor-default shadow-sm'
                : isFreeBeta
                ? 'bg-slate-900 text-purple-300/60 border-purple-500/20 cursor-default select-none'
                : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border-purple-500/40 cursor-pointer'
            }`}
          >
            {activePlan === 'team'
              ? 'Current Plan (Max Tier Active)'
              : isFreeBeta
              ? 'Disponible au Lancement Payant'
              : `Upgrade to Team (${teamPrice.formatted})`}
          </button>
        </div>
      </div>
    </section>
  );
};
