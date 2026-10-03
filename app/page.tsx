'use client';

import React, { useState, useEffect } from 'react';
import { Dropzone } from '@/components/Dropzone';
import { DiffInspector } from '@/components/DiffInspector';
import { TreeExplorer, TreeFileItem } from '@/components/TreeExplorer';
import { PaymentModal } from '@/components/PaymentModal';
import { PricingSection } from '@/components/PricingSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { UniversalTranspiler, TranspileResult } from '@/lib/converter/universalTranspiler';
import { ClientVault, UserPlanTier } from '@/lib/storage/clientVault';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { PromoManager } from '@/lib/promo/promoManager';
import { MonetizationManager } from '@/lib/config/monetizationConfig';
import Link from 'next/link';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { Zap, ShieldCheck, ArrowRightLeft, Sparkles, Layers, Lock } from 'lucide-react';
import JSZip from 'jszip';

export default function HomePage() {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [project, setProject] = useState<CanonicalProject | null>(null);
  const [transpileResult, setTranspileResult] = useState<TranspileResult | null>(null);
  const [currentTargetPlatform, setCurrentTargetPlatform] = useState<'claude' | 'openai' | 'cursor' | 'gemini'>('claude');
  const [selectedFileItem, setSelectedFileItem] = useState<{
    name: string;
    category?: string;
    sourceCode: string;
    targetCode: string;
    sourceTitle: string;
    targetTitle: string;
    parityScore?: number;
    parityLabel?: string;
    secretsCount?: number;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'single' | 'pro' | 'team'>('pro');
  const [zipBase64, setZipBase64] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'EUR');
  const [isVip, setIsVip] = useState(false);
  const [activePlan, setActivePlan] = useState<UserPlanTier>('free');

  useEffect(() => {
    CurrencyManager.initFromIp().then((curr) => {
      setCurrency(curr);
    });
    setActivePlan(ClientVault.getActivePlan());
    setIsVip(PromoManager.isVipActive());
    AnalyticsTracker.trackPageView('/', undefined, CurrencyManager.getActiveCurrency());

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    const vipHandler = () => setIsVip(true);
    const planHandler = (e: Event) => {
      const custom = e as CustomEvent<UserPlanTier>;
      if (custom.detail) setActivePlan(custom.detail);
      else setActivePlan(ClientVault.getActivePlan());
    };

    window.addEventListener('promptshift_currency_changed', handler);
    window.addEventListener('promptshift_vip_activated', vipHandler);
    window.addEventListener('promptshift_plan_changed', planHandler);

    return () => {
      window.removeEventListener('promptshift_currency_changed', handler);
      window.removeEventListener('promptshift_vip_activated', vipHandler);
      window.removeEventListener('promptshift_plan_changed', planHandler);
    };
  }, []);

  const totalFileCount = project ? project.knowledge_base.length + project.rules.length + 1 : 0;
  const hasProAccess = isVip || activePlan === 'pro' || activePlan === 'team';
  const isFreeTier = hasProAccess || totalFileCount <= MonetizationManager.getFreeLimit();

  const handleProjectReady = async (
    loadedProject: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini'
  ) => {
    setProject(loadedProject);
    setCurrentTargetPlatform(targetPlatform);
    setSelectedFileItem(null);

    const fileCount = loadedProject.knowledge_base.length + loadedProject.rules.length + 1;
    const sizeBytes = loadedProject.knowledge_base.reduce((acc, f) => acc + (f.size_bytes || 0), 0) + 2048;

    AnalyticsTracker.trackProjectUpload({
      projectTitle: loadedProject.metadata.title,
      fileCount,
      sizeBytes,
      sourcePlatform: loadedProject.metadata.source_platform || 'gemini',
    });

    let finalResult: TranspileResult | null = null;

    // Call API or local transpiler
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: loadedProject, targetPlatform }),
      });

      if (res.ok) {
        const data = await res.json();
        finalResult = data.transpileResult;
        setTranspileResult(data.transpileResult);
        setZipBase64(data.zipBase64);
      } else {
        // Fallback to local in-browser transpilation
        const localResult = UniversalTranspiler.transpile(loadedProject, targetPlatform);
        finalResult = localResult;
        setTranspileResult(localResult);
        const zip = new JSZip();
        for (const [fname, content] of Object.entries(localResult.files)) {
          zip.file(fname, content);
        }
        const b64 = await zip.generateAsync({ type: 'base64' });
        setZipBase64(b64);
      }
    } catch {
      const localResult = UniversalTranspiler.transpile(loadedProject, targetPlatform);
      finalResult = localResult;
      setTranspileResult(localResult);
      const zip = new JSZip();
      for (const [fname, content] of Object.entries(localResult.files)) {
        zip.file(fname, content);
      }
      const b64 = await zip.generateAsync({ type: 'base64' });
      setZipBase64(b64);
    }

    if (finalResult) {
      AnalyticsTracker.trackConversion({
        projectTitle: loadedProject.metadata.title,
        sourcePlatform: loadedProject.metadata.source_platform || 'gemini',
        targetPlatform,
        fileCount,
        sizeBytes,
        parityScore: finalResult.parityScore || 98.5,
        isFreeTier: isVip || fileCount <= 5,
        planTier: isVip ? 'vip' : fileCount <= 5 ? 'free' : 'single',
        currency,
        secretsCount: finalResult.alerts ? finalResult.alerts.length : 0,
      });
    }
  };

  const handleTargetSwitch = async (newPlatform: 'claude' | 'openai' | 'cursor' | 'gemini') => {
    setCurrentTargetPlatform(newPlatform);
    if (!project) return;

    let finalResult: TranspileResult | null = null;
    const fileCount = project.knowledge_base.length + project.rules.length + 1;
    const sizeBytes = project.knowledge_base.reduce((acc, f) => acc + (f.size_bytes || 0), 0) + 2048;

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, targetPlatform: newPlatform }),
      });
      if (res.ok) {
        const data = await res.json();
        finalResult = data.transpileResult;
        setTranspileResult(data.transpileResult);
        setZipBase64(data.zipBase64);
      } else {
        const local = UniversalTranspiler.transpile(project, newPlatform);
        finalResult = local;
        setTranspileResult(local);
        const zip = new JSZip();
        for (const [fname, content] of Object.entries(local.files)) {
          zip.file(fname, content);
        }
        const b64 = await zip.generateAsync({ type: 'base64' });
        setZipBase64(b64);
      }
    } catch {
      const local = UniversalTranspiler.transpile(project, newPlatform);
      finalResult = local;
      setTranspileResult(local);
      const zip = new JSZip();
      for (const [fname, content] of Object.entries(local.files)) {
        zip.file(fname, content);
      }
      const b64 = await zip.generateAsync({ type: 'base64' });
      setZipBase64(b64);
    }

    if (finalResult) {
      AnalyticsTracker.trackConversion({
        projectTitle: project.metadata.title,
        sourcePlatform: project.metadata.source_platform || 'gemini',
        targetPlatform: newPlatform,
        fileCount,
        sizeBytes,
        parityScore: finalResult.parityScore || 98.5,
        isFreeTier: isVip || fileCount <= 5,
        planTier: isVip ? 'vip' : fileCount <= 5 ? 'free' : 'single',
        currency,
        secretsCount: finalResult.alerts ? finalResult.alerts.length : 0,
      });
    }

    if (selectedFileItem) {
      const fileDiff = UniversalTranspiler.getFileDiff(
        project,
        newPlatform,
        selectedFileItem.name,
        selectedFileItem.sourceCode,
        selectedFileItem.category
      );
      setSelectedFileItem({
        ...selectedFileItem,
        ...fileDiff,
      });
    }
  };

  const handleFreeDownload = () => {
    if (!zipBase64 || !transpileResult) return;

    // Automatically record in sovereign local vault
    ClientVault.saveConversion({
      projectName: transpileResult.projectName,
      sourcePlatform: transpileResult.sourcePlatform,
      targetPlatform: currentTargetPlatform,
      fileCount: totalFileCount,
      parityScore: transpileResult.parityScore,
      zipBase64,
      status: 'COMPLETED',
    });

    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${zipBase64}`;
    link.download = `${transpileResult.projectName}_${currentTargetPlatform}_bundle.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectFile = (file: TreeFileItem) => {
    if (!project) return;
    const fileDiff = UniversalTranspiler.getFileDiff(
      project,
      currentTargetPlatform,
      file.name,
      file.content,
      file.category
    );
    setSelectedFileItem({
      name: file.name,
      category: file.category,
      ...fileDiff,
    });
  };

  return (
    <div className="flex flex-col items-center gap-12 py-6">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyanGlow text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isVip
              ? 'VIP DEV PASS ACTIVE • 100% FREE FULL CODEBASES'
              : isFreeBeta
              ? 'BÊTA PUBLIQUE OUVERTE • PASS PRO 100% OFFERT (AVEC EMAIL)'
              : `FREE FOR UP TO 5 FILES • ${CurrencyManager.getTierPrice('single', currency).formatted} FULL REPOSITORIES`}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Shift AI Projects between{' '}
          <span className="bg-gradient-to-r from-cyanGlow via-teal-300 to-emeraldGlow bg-clip-text text-transparent">
            Gemini, Claude & OpenAI
          </span>{' '}
          in 1 Click.
        </h1>

        <p className="text-sm sm:text-base text-textMuted max-w-2xl leading-relaxed">
          The sovereign, zero-retention bridge for AI coding assistants. Preserve 100% of your rules, master prompts,
          tools, and autonomy directives with verified semantic fidelity.
          <span className="text-emerald-400 font-semibold block mt-1.5">
            {isVip
              ? 'VIP Developer Access: 100% Free for unlimited repositories & all file counts.'
              : isFreeBeta
              ? '100% Gratuit jusqu\'à 5 fichiers sans inscription • Débloquez l\'accès Pro illimité en renseignant simplement votre email.'
              : `100% Free for projects up to 5 files • ${CurrencyManager.getTierPrice('single', currency).formatted} one-time pass for full codebases.`}
          </span>
        </p>
      </section>

      {/* Dropzone Area with ErrorBoundary */}
      <ErrorBoundary
        fallbackTitle="Upload & Extraction Shield Activated"
        onReset={() => {
          setProject(null);
          setTranspileResult(null);
          setSelectedFileItem(null);
        }}
      >
        <Dropzone onProjectReady={handleProjectReady} />
      </ErrorBoundary>

      {/* Live Diff & Tree Inspector if project is loaded */}
      {transpileResult && project && (
        <ErrorBoundary
          fallbackTitle="AST Pre-Flight Inspector Shield Activated"
          onReset={() => {
            setSelectedFileItem(null);
          }}
        >
          <div className="w-full flex flex-col gap-6 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Pre-Flight Diff Inspector</h2>
              <p className="text-xs text-textMuted mt-1">Review AST transpilation before downloading your bundle.</p>
            </div>

            {/* Target Ecosystem Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cardBg border border-borderColor w-full max-w-6xl mx-auto shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emeraldGlow animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Target AI Destination:
                </span>
                <span className="text-[11px] text-textMuted hidden sm:inline">
                  (Clicking switches format & regenerates ZIP in real time)
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-borderColor" role="group" aria-label="Select target AI ecosystem">
                {(['claude', 'openai', 'cursor', 'gemini'] as const).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleTargetSwitch(platform)}
                    aria-pressed={currentTargetPlatform === platform}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                      currentTargetPlatform === platform
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-neonCyan scale-105'
                        : 'text-textMuted hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto items-start">
              <div className="lg:col-span-1">
                <TreeExplorer
                  project={project}
                  activeFileName={selectedFileItem?.name}
                  onSelectFile={handleSelectFile}
                />
              </div>
              <div className="lg:col-span-2">
                <DiffInspector
                  result={transpileResult}
                  fileCount={totalFileCount}
                  isFree={isFreeTier}
                  onFreeDownload={handleFreeDownload}
                  activeFile={selectedFileItem || undefined}
                  onExportRequest={() => {
                    setPaymentPlan('single');
                    setIsPaymentModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}

      {/* Feature Value Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-8">
        <div className="p-6 rounded-2xl bg-cardBg border border-borderColor flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Full Bi-Directional Parity</h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Convert GEMINI.md to CLAUDE.md XML and .cursorrules without losing autonomy policies or prompt constraints.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-cardBg border border-borderColor flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emeraldGlow/30 flex items-center justify-center text-emeraldGlow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">In-RAM Cybersecurity Shields</h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Automatic secret redactor for API keys, zero-width steganography neutralization, and binary MZ magic byte blocking.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-cardBg border border-borderColor flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Sub-Second RAM Pruning</h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Heavy 2.5 GB dependency folders (node_modules, .git) are pruned client-side in &lt; 80ms before transmission.
          </p>
        </div>
      </section>

      {/* Sovereign Architecture & Storage Transparency Section */}
      <section className="w-full max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-borderColor flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow flex-shrink-0">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                How Sovereign Local Storage Works (Zero Cookies • Zero Server Logs)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                TRANSPARENCY GUARANTEE
              </span>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              When you use PromptShift, your source code is processed <strong>strictly in volatile RAM</strong>. We do NOT store your files on any cloud database or server disk.
              Your past conversion history and receipts live exclusively inside your browser&apos;s isolated <strong>HTML5 LocalStorage sandbox</strong> on your machine.
              We never use tracking cookies, and you can purge this vault at any time in 1 click from your Customer Portal.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>0 Bytes Saved on Server</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>No Cross-Site Cookies</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-300">
            <ShieldCheck className="w-4 h-4" />
            <span>1-Click Local Data Purge</span>
          </div>
        </div>
      </section>

      {/* Dedicated Pricing & Subscription Section */}
      <PricingSection
        onSelectPlan={(plan) => {
          setPaymentPlan(plan);
          setIsPaymentModalOpen(true);
        }}
        onStartFree={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Payment / Export & Subscription Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        projectName={transpileResult ? transpileResult.projectName : 'Universal AI Project'}
        zipBase64={zipBase64}
        initialPlan={paymentPlan}
      />

      {/* Discreet Footer with Admin Command Center link */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted mt-12">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">PromptShift.dev</span>
          <span>•</span>
          <span>Universal 1-Click AI Agent Bridge</span>
          <span>•</span>
          <span>Zero Server Logs</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Admin Command Center</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
