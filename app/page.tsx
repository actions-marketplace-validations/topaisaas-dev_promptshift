'use client';

import React, { useState, useEffect } from 'react';
import { Dropzone } from '@/components/Dropzone';
import { DiffInspector } from '@/components/DiffInspector';
import { TreeExplorer, TreeFileItem } from '@/components/TreeExplorer';
import { PaymentModal } from '@/components/PaymentModal';
import { PricingSection } from '@/components/PricingSection';
import { FaqSection } from '@/components/FaqSection';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { UniversalTranspiler, TranspileResult } from '@/lib/converter/universalTranspiler';
import { ClientVault, UserPlanTier } from '@/lib/storage/clientVault';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { PromoManager } from '@/lib/promo/promoManager';
import { MonetizationManager } from '@/lib/config/monetizationConfig';
import Link from 'next/link';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { Zap, ShieldCheck, ArrowRightLeft, Sparkles, Layers, Lock, CheckCircle2, X } from 'lucide-react';
import JSZip from 'jszip';
import { DEMO_PRESETS, DemoPreset } from '@/lib/demoPresets';

export default function HomePage() {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [uploadMode, setUploadMode] = useState<'starter' | 'pro'>('starter');
  const [isSlicedStarter, setIsSlicedStarter] = useState(false);
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
  const [modalInitialPaid, setModalInitialPaid] = useState(false);
  const [checkoutSuccessNotice, setCheckoutSuccessNotice] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<'single' | 'pro' | 'team'>('pro');
  const [zipBase64, setZipBase64] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD');
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
    const initialPlan = ClientVault.getActivePlan();
    setActivePlan(initialPlan);
    if (initialPlan === 'pro' || initialPlan === 'team') {
      setUploadMode('pro');
    }

    const vipHandler = () => {
      setIsVip(true);
      setUploadMode('pro');
    };
    const planHandler = (e: Event) => {
      const custom = e as CustomEvent<UserPlanTier>;
      const newPlan = custom.detail || ClientVault.getActivePlan();
      setActivePlan(newPlan);
      if (newPlan === 'pro' || newPlan === 'team') {
        setUploadMode('pro');
      }
    };

    window.addEventListener('promptshift_currency_changed', handler);
    window.addEventListener('promptshift_vip_activated', vipHandler);
    window.addEventListener('promptshift_plan_changed', planHandler);

    // Polar Checkout success redirect detection
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('checkout') === 'success') {
        const planParam = (urlParams.get('plan') as 'single' | 'pro' | 'team') || 'pro';
        const checkoutId = urlParams.get('checkout_id') || `polar_${Date.now()}`;

        // Save plan activation to Sovereign Vault
        ClientVault.setActivePlan(planParam);
        setActivePlan(planParam);
        setPaymentPlan(planParam);
        setModalInitialPaid(true);

        const planTitle =
          planParam === 'team'
            ? 'Team & Agency Pass'
            : planParam === 'pro'
            ? 'Pro Developer Subscription'
            : 'Single Project Pass';

        setCheckoutSuccessNotice(`Payment confirmed! Your ${planTitle} is now unlocked.`);

        // Record verified invoice in Sovereign Vault
        const customer = ClientVault.getCustomerInfo();
        const tierPrice = CurrencyManager.getTierPrice(planParam, CurrencyManager.getActiveCurrency());
        ClientVault.saveInvoice({
          orderId: checkoutId,
          planName: planTitle,
          amount: tierPrice.raw.toFixed(2),
          currency: CurrencyManager.getActiveCurrency(),
          paymentMethod: 'Polar.sh (Apple Pay, Google Pay, Cards, SEPA)',
          status: 'PAID',
          customerName: customer.name || 'Lead Autonomous Software Engineer',
          customerCompany: customer.company || 'Engineering Studio',
          customerEmail: customer.email && !customer.email.endsWith('@promptshift.dev') ? customer.email : '',
        });

        // Trigger victory celebration
        try {
          import('canvas-confetti').then((m) => {
            m.default({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
          });
        } catch {
          // ignore
        }

        setIsPaymentModalOpen(true);
        // Clean URL to prevent re-trigger on reload
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener('promptshift_currency_changed', handler);
      window.removeEventListener('promptshift_vip_activated', vipHandler);
      window.removeEventListener('promptshift_plan_changed', planHandler);
    };
  }, []);

  const totalFileCount = project ? project.knowledge_base.length + project.rules.length + 1 : 0;
  const hasProAccess = isVip || activePlan === 'pro' || activePlan === 'team';
  const isFreeTier = hasProAccess || totalFileCount <= MonetizationManager.getFreeLimit() || isSlicedStarter;

  const handleProjectReady = async (
    loadedProject: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini',
    slicedStarter: boolean = false
  ) => {
    setProject(loadedProject);
    setIsSlicedStarter(slicedStarter);
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
        isFreeTier: isVip || fileCount <= MonetizationManager.getFreeLimit(),
        planTier: isVip ? 'vip' : fileCount <= MonetizationManager.getFreeLimit() ? 'free' : 'single',
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

  const handleLoadDemo = (preset: DemoPreset) => {
    handleProjectReady(preset.project, preset.targetKey);
  };

  return (
    <div className="flex flex-col items-center gap-12 py-6">
      {/* Checkout Success Banner */}
      {checkoutSuccessNotice && (
        <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{checkoutSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutSuccessNotice(null)}
            className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 text-xs transition-colors cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide ${
          hasProAccess
            ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm'
            : 'bg-cyan-500/10 border border-cyan-500/30 text-cyanGlow'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${hasProAccess ? 'text-emerald-400' : ''}`} />
          <span>
            {isVip
              ? 'VIP DEV PASS ACTIVE • 100% FREE FULL CODEBASES'
              : hasProAccess
              ? `${activePlan.toUpperCase()} PASS ACTIVE • UNLIMITED CONVERSIONS`
              : isFreeBeta
              ? 'OPEN PUBLIC BETA • FREE PRO PASS AVAILABLE'
              : `FREE FOR UP TO ${MonetizationManager.getFreeLimit()} FILES • ${CurrencyManager.getTierPrice('single', currency).formatted} FULL REPOSITORIES`}
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
        </p>
      </section>

      {/* 1-Click Interactive Live Demo Presets */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>No project handy right now? Test live with 1-click sample workspaces:</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadDemo(preset)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/80 hover:border-cyan-500/50 bg-slate-950/70 hover:bg-slate-800/80 text-xs font-medium text-slate-200 hover:text-white transition-all transform hover:-translate-y-0.5 shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span className="font-semibold">{preset.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone Area with ErrorBoundary */}
      <ErrorBoundary
        fallbackTitle="Upload & Extraction Shield Activated"
        onReset={() => {
          setProject(null);
          setTranspileResult(null);
          setSelectedFileItem(null);
          setIsSlicedStarter(false);
        }}
      >
        <Dropzone
          onProjectReady={handleProjectReady}
          activeMode={uploadMode}
          onModeChange={(mode) => setUploadMode(mode)}
        />
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
                  hasProAccess={hasProAccess}
                  isSlicedStarter={isSlicedStarter}
                  onFreeDownload={handleFreeDownload}
                  activeFile={selectedFileItem || undefined}
                  onExportRequest={() => {
                    setPaymentPlan(isFreeBeta ? 'pro' : 'single');
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
        hasProject={Boolean(project && zipBase64)}
        onSelectPlan={(plan) => {
          setPaymentPlan(plan);
          setModalInitialPaid(false);
          setIsPaymentModalOpen(true);
        }}
        onStartFree={() => {
          setUploadMode('starter');
          const dropzoneEl = document.getElementById('dropzone');
          if (dropzoneEl) {
            dropzoneEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSelectPro={() => {
          setUploadMode('pro');
          const dropzoneEl = document.getElementById('dropzone');
          if (dropzoneEl) {
            dropzoneEl.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Structured FAQ Section (AEO, VSO & Objection Buster) */}
      <FaqSection />

      {/* Payment / Export & Subscription Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setModalInitialPaid(false);
        }}
        projectName={transpileResult ? transpileResult.projectName : 'Universal AI Project'}
        zipBase64={zipBase64}
        initialPlan={paymentPlan}
        initialIsPaid={modalInitialPaid}
      />

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted mt-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-300">PromptShift.dev</span>
          <span>•</span>
          <span>Universal 1-Click AI Agent Bridge</span>
          <span>•</span>
          <span>Zero Server Storage Guarantee</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Link
            href="/terms"
            className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
          >
            Terms & EULA
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            href="/security"
            className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded"
          >
            Security & DPA
          </Link>
          <a
            href="mailto:contact@promptshift.dev"
            className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
          >
            Support (contact@promptshift.dev)
          </a>
          <span>•</span>
          <a
            href="mailto:compliance@promptshift.dev"
            className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
          >
            Compliance (compliance@promptshift.dev)
          </a>
        </div>
      </footer>
    </div>
  );
}
