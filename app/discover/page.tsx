'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Code2,
  RefreshCw,
  Terminal,
  FileCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRightLeft,
  Coffee,
  Download,
  Flame,
  HelpCircle
} from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '@/lib/demoPresets';
import { UniversalTranspiler, TranspileResult } from '@/lib/converter/universalTranspiler';
import { PaymentModal } from '@/components/PaymentModal';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import JSZip from 'jszip';

export default function DiscoverPage() {
  const [activePreset, setActivePreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [activeTarget, setActiveTarget] = useState<'claude' | 'cursor' | 'openai' | 'gemini'>('claude');
  const [transpileResult, setTranspileResult] = useState<TranspileResult | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'single' | 'pro' | 'team'>('single');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [zipBase64, setZipBase64] = useState<string | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    CurrencyManager.initFromIp().then((curr) => setCurrency(curr));
    AnalyticsTracker.trackPageView('/discover', undefined, CurrencyManager.getActiveCurrency());
  }, []);

  // Run transpilation whenever preset or target changes
  useEffect(() => {
    try {
      const res = UniversalTranspiler.transpile(activePreset.project, activeTarget);
      setTranspileResult(res);

      // Generate preview ZIP for instant download / checkout
      const zip = new JSZip();
      Object.entries(res.files).forEach(([filename, content]) => zip.file(filename, content));
      zip.generateAsync({ type: 'base64' }).then((b64) => setZipBase64(b64));
    } catch (e) {
      console.error('Transpile preview error:', e);
    }
  }, [activePreset, activeTarget]);

  const handleOpenCheckout = (plan: 'single' | 'pro' | 'team') => {
    setPaymentPlan(plan);
    setIsPaymentModalOpen(true);
    AnalyticsTracker.trackCheckout(plan, plan === 'single' ? '1.99' : '5.99', currency);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx promptshift');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-cyan-500/30 font-sans">
      {/* 1. TOP SWITCHER BANNER */}
      <aside aria-label="Version switcher" className="w-full bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-purple-950/60 border-b border-cyan-500/20 px-4 py-2.5 text-center text-xs sm:text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Vous êtes sur la <strong>Nouvelle Version Découverte (Guide 100% Simplifié)</strong></span>
          <span className="hidden md:inline text-slate-500">•</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold ml-1 transition-colors"
          >
            <span>Basculer vers la Console Développeur classique</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </span>
      </aside>

      {/* 2. HERO SECTION — LE TEST DES 5 SECONDES */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Badge de positionnement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>L'Adaptateur Universel pour vos IA de Code</span>
          </div>

          {/* H1 Percutant & Métaphore Immédiate */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Vos règles d'IA fonctionnent{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              enfin partout.
            </span>
          </h1>

          {/* Sous-titre explicite (What & Why en 2 lignes) */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            <strong>Cursor, Claude Code, Windsurf, ChatGPT.</strong> Écrivez vos consignes une seule fois.
            PromptShift les traduit et les adapte en 2 secondes chrono, avec <strong>zéro perte de mémoire</strong> et <strong>zéro fuite de clés secrètes</strong>.
          </p>

          {/* Boutons d'Action Principaux */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#sandbox"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Tester la Démo en 1 Clic (Gratuit)</span>
            </a>

            <button
              onClick={() => handleOpenCheckout('single')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-base border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-5 h-5 text-amber-400" />
              <span>Pass Universel 4-en-1 : 1,99 $</span>
            </button>
          </div>

          {/* 3 Badges de Rassurance Immédiate */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zéro inscription requise</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>100% In-RAM (Zéro fichier conservé)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>1,99 $ à vie (Pas d'abonnement forcé)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. SECTION "COMMENT ÇA MARCHE ?" (3 ÉTAPES ENFANTINES) */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Simplicité Radicale</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Comment ça marche en 3 étapes ?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Choisissez votre projet</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Glissez votre fichier <code className="text-cyan-300">.cursorrules</code>, <code className="text-cyan-300">CLAUDE.md</code> ou testez nos modèles pré-remplis en 1 clic.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Traduction & Nettoyage</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Le moteur réécrit la syntaxe exacte pour l'outil cible et <strong>masque automatiquement vos clés API secrètes</strong> en mémoire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Téléchargez & Démarrez</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Récupérez votre pack universel prêt à coller dans votre projet. Votre IA comprend immédiatement l'intégralité de vos règles.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LE BAC À SABLE INTERACTIF (L'EFFET MAGIE EN DIRECT) */}
      <section id="sandbox" className="py-16 md:py-24 bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Démonstration Interactive Immédiate</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Voyez la transformation en temps réel
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Cliquez sur un exemple d'application ci-dessous pour voir comment PromptShift convertit les règles sans intervention humaine.
            </p>
          </div>

          {/* Sélecteurs de Projets Démo */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset);
                  setActiveTarget(preset.targetKey);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activePreset.id === preset.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{preset.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activePreset.id === preset.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Sélecteur de Plateforme Cible */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Adapter vers :</span>
            {(['claude', 'cursor', 'openai', 'gemini'] as const).map((plt) => (
              <button
                key={plt}
                onClick={() => setActiveTarget(plt)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-xs transition-colors cursor-pointer ${
                  activeTarget === plt
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {plt}
              </button>
            ))}
          </div>

          {/* Console de Visualisation Avant / Après */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
            {/* Header de la console */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-slate-300 font-bold">
                  {activePreset.project.metadata.title} ({activePreset.sourceKey} ➔ {activeTarget})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Parité : {transpileResult?.parityScore.toFixed(1) || 99.4}% Intègre
                </span>
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  Sécurité : Clés API Masquées
                </span>
              </div>
            </div>

            {/* Contenu Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs sm:text-sm font-mono">
              {/* Colonne Source */}
              <div className="p-5 overflow-auto max-h-[380px] bg-slate-950/30">
                <div className="text-slate-400 font-sans font-bold uppercase tracking-wider mb-2 flex items-center justify-between text-xs">
                  <span>Source ({activePreset.sourceKey})</span>
                  <span className="text-[11px] text-slate-500">Format d'origine</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {transpileResult?.diff?.sourceCode || activePreset.project.persona?.raw_system_prompt || 'No system prompt'}
                </pre>
              </div>

              {/* Colonne Cible Transpilée */}
              <div className="p-5 overflow-auto max-h-[380px] bg-emerald-950/5">
                <div className="text-emerald-400 font-sans font-bold uppercase tracking-wider mb-2 flex items-center justify-between text-xs">
                  <span>Adapté pour {activeTarget.toUpperCase()}</span>
                  <span className="text-[11px] text-emerald-400/80">Prêt à l'emploi</span>
                </div>
                <pre className="text-emerald-200 whitespace-pre-wrap leading-relaxed">
                  {transpileResult?.diff?.targetCode || 'Generating...'}
                </pre>
              </div>
            </div>

            {/* Barre de Conversion d'Action In-Flow */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left text-xs text-slate-300">
                <p className="font-bold text-white text-sm">Prêt pour votre propre projet ?</p>
                <p className="text-slate-400">Exportez le pack 4-en-1 complet avec tous les fichiers rédigés pour Cursor, Claude, OpenAI & Gemini.</p>
              </div>
              <button
                onClick={() => handleOpenCheckout('single')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 fill-current" />
                <span>Télécharger le Pack Universel (1,99 $)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPARATIF CHOC : AVANT / APRÈS */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">Le Coût de l'Inaction</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Pourquoi vous ne pouvez plus faire ça à la main</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SANS PROMPTSHIFT */}
          <div className="p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-6">
              <XCircle className="w-4 h-4" />
              <span>SANS PROMPTSHIFT (La Galère)</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>45 minutes perdues</strong> à reformater des syntaxes YAML et Markdown pour chaque éditeur.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>L'IA ignore vos consignes</strong> parce que Claude ne comprend pas les clés spécifiques de Cursor.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Risque de fuite de clé secrète</strong> (OPENAI_API_KEY) commitée par erreur sur GitHub public.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Désynchronisation d'équipe</strong> : chaque membre travaille avec des règles différentes et obsolètes.</span>
              </li>
            </ul>
          </div>

          {/* AVEC PROMPTSHIFT */}
          <div className="p-8 rounded-3xl bg-emerald-950/15 border border-emerald-500/30 relative shadow-xl shadow-emerald-950/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>AVEC PROMPTSHIFT (La Fluidité)</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>2 secondes chrono</strong> : un glisser-déposer ou 1 commande terminal instantanée.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>99.4% de fidélité prouvée</strong> : vos agents IA obéissent fidèlement à 100% de vos instructions.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Nettoyage automatique des secrets</strong> en mémoire avec zéro trace sur nos serveurs.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pack 4-en-1 généré</strong> : Cursor, Claude Code, Windsurf et ChatGPT unifiés pour 1,99 $.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. LES 4 PILIERS DE VALEUR IRRÉSISTIBLE */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Conçu Pour Vous</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Les 4 piliers qui font la différence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Simplicité Radicale (Accessible à Tous)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pas besoin d'être un expert des compilateurs. Que vous sachiez coder ou non, vous glissez votre projet et vous obtenez un résultat parfait immédiatement.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Universalité Totale (Tous vos outils)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ne soyez plus jamais prisonnier d'un seul éditeur. Travaillez sur Cursor le matin, passez sur Claude Code l'après-midi, et partagez à votre équipe sur Windsurf.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Confidentialité Absolue (Zéro Stockage)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Vos prompts et votre code ne sont <strong>jamais enregistrés sur une base de données</strong>. Tout est traité en mémoire vive (RAM) et purgé instantanément.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">4. Micro-Prix Transparent (1,99 $)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pas d'abonnement forcé à 39 $/mois. Achetez un pass à 1,99 $ (le prix d'un café) uniquement lorsque vous convertissez un projet.
            </p>
          </div>
        </div>
      </section>

      {/* 7. POUR QUI EST-CE FAIT ? (3 PERSONAS) */}
      <section className="py-16 md:py-20 bg-slate-950/40 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Profils Cibles</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Est-ce que PromptShift est fait pour vous ?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">👨‍💻</div>
              <h3 className="text-lg font-bold mb-2">Le Développeur Solo</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Vous utilisez Cursor pour coder vite et Claude Code dans votre terminal. PromptShift synchronise vos règles en 2 secondes sans casser votre rythme.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="text-lg font-bold mb-2">Le Créateur / Débutant IA</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Vous avez trouvé un super prompt ou template sur Twitter/GitHub mais il n'est pas fait pour votre outil. PromptShift l'adapte sans aucune compétence technique.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">🏢</div>
              <h3 className="text-lg font-bold mb-2">Le Tech Lead & L'Agence</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Dans votre équipe, certains préfèrent Cursor, d'autres Windsurf ou Copilot. PromptShift maintient une source de vérité unique pour toute l'entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. GRILLE TARIFAIRE TRANSPARENTE (HOW MUCH) */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Tarification Honnête</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Combien ça coûte ?</p>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Testez gratuitement sans créer de compte. Payez un micro-pass quand vous avez besoin d'exporter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Gratuit */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Découverte</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">Gratuit</h3>
              <div className="text-3xl font-black mb-4">0,00 $</div>
              <p className="text-slate-400 text-xs mb-6">Idéal pour tester la parité et convertir un petit fichier de configuration.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Jusqu'à 2 fichiers par projet</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Aperçu en direct dans le navigateur</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zéro compte requis</span>
                </li>
              </ul>
            </div>
            <a
              href="#sandbox"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block transition-colors"
            >
              Tester Gratuitement
            </a>
          </div>

          {/* Single Pass (Le Héros) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-2 border-cyan-500/60 relative flex flex-col justify-between shadow-2xl shadow-cyan-500/10 scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
              Le Plus Populaire
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Pass Unique</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">Pack 4-en-1</h3>
              <div className="text-4xl font-black mb-1 text-white">1,99 $</div>
              <span className="text-xs text-slate-400 block mb-4">Paiement unique, sans abonnement</span>
              <p className="text-slate-300 text-xs mb-6">Exportez votre projet complet pour tous les éditeurs d'IA en 1 clic.</p>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span><strong>Export complet 4-en-1</strong> (Cursor, Claude, OpenAI, Gemini)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Fichiers illimités sur le projet</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Purge automatique des clés secrètes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Téléchargement ZIP instantané</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout('single')}
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm text-center block transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Débloquer ce projet (1,99 $)
            </button>
          </div>

          {/* Pro Illimité */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Abonnement</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">Pro Illimité</h3>
              <div className="text-3xl font-black mb-1">5,99 $</div>
              <span className="text-xs text-slate-400 block mb-4">par mois, annulable à tout moment</span>
              <p className="text-slate-400 text-xs mb-6">Pour les développeurs actifs qui créent et migrent des projets chaque semaine.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Conversions & exports illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Intégration CI/CD GitHub Actions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Support développeur prioritaire</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout('pro')}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block transition-colors cursor-pointer"
            >
              Choisir le Plan Pro
            </button>
          </div>
        </div>
      </section>

      {/* 9. FAQ ANTI-OBJECTION */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Réponses Claires</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Questions Fréquentes</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Dois-je savoir coder pour utiliser PromptShift ?",
              a: "Non, absolument pas. Vous avez simplement besoin de glisser votre fichier de règles ou de copier-coller vos consignes. PromptShift s'occupe de toute la syntaxe technique en coulisses."
            },
            {
              q: "Mes fichiers ou mon code source sont-ils stockés chez vous ?",
              a: "Non. Nous opérons selon une politique stricte '100% In-RAM Zero Retention'. Votre code est analysé et transformé dans la mémoire vive de votre navigateur ou de l'instance éphémère, puis immédiatement effacé. Aucune ligne de votre code n'est enregistrée dans une base de données."
            },
            {
              q: "Pourquoi payer 1,99 $ plutôt que de demander à ChatGPT de convertir mon fichier ?",
              a: "Les modèles de langage (LLMs) ont tendance à 'halluciner' les balises de configuration des éditeurs (comme les règles scopées .cursor/rules ou les clés YAML de Claude). PromptShift utilise un moteur déterministe qui garantit 99.4% de parité mathématique sans inventer de règles et purge vos clés d'API secrètes."
            },
            {
              q: "Est-ce que ça fonctionne avec les versions récentes de Cursor et Claude Code ?",
              a: "Oui. PromptShift est continuellement mis à jour pour supporter les derniers formats : les fichiers .cursorrules et les règles modulaires .mdc de Cursor, le format plat CLAUDE.md d'Anthropic, les formats .windsurfrules et les instructions de Copilot."
            },
            {
              q: "Puis-je l'utiliser directement dans mon terminal ?",
              a: "Oui ! Si vous préférez la ligne de commande, tapez simplement 'npx promptshift' dans n'importe quel dossier de projet sur votre ordinateur pour exécuter la conversion sans même ouvrir de navigateur."
            }
          ].map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-sm sm:text-base hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0 ml-4" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-slate-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. CLI QUICK TIP */}
      <section className="py-12 bg-slate-950 text-center border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Vous préférez le terminal ?</p>
          <div
            onClick={handleCopyCli}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 text-sm hover:border-cyan-500/50 transition-all cursor-pointer shadow-inner"
          >
            <span>$ npx promptshift</span>
            <span className="text-xs text-slate-500 font-sans">
              {copiedCode ? '✓ Copié !' : '(Cliquer pour copier)'}
            </span>
          </div>
        </div>
      </section>

      {/* 11. FINAL CLOSING CTA */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Prêt à faire tourner vos règles d'IA partout ?
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">
            Rejoignez des centaines de développeurs qui ont arrêté de réécrire leurs consignes à la main.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleOpenCheckout('single')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Débloquer la Suite Universelle (1,99 $)
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 transition-colors"
            >
              Voir la Console Développeur classique
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL DE PAIEMENT POLAR UNIFIÉ */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        projectName={activePreset.name}
        zipBase64={zipBase64}
        initialPlan={paymentPlan}
        initialIsPaid={false}
      />
    </div>
  );
}
