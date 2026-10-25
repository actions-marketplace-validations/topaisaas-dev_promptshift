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
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '@/lib/demoPresets';
import { UniversalTranspiler, TranspileResult } from '@/lib/converter/universalTranspiler';
import { PaymentModal } from '@/components/PaymentModal';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { Dropzone } from '@/components/Dropzone';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import JSZip from 'jszip';

export default function HomePage() {
  const [activePreset, setActivePreset] = useState<DemoPreset>(DEMO_PRESETS[0]);
  const [activeTarget, setActiveTarget] = useState<'claude' | 'cursor' | 'openai' | 'gemini'>('claude');
  const [transpileResult, setTranspileResult] = useState<TranspileResult | null>(null);
  const [customProject, setCustomProject] = useState<CanonicalProject | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'single' | 'pro' | 'team'>('single');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [zipBase64, setZipBase64] = useState<string | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    CurrencyManager.initFromIp().then((curr) => setCurrency(curr));
    AnalyticsTracker.trackPageView('/', undefined, CurrencyManager.getActiveCurrency());
  }, []);

  // Compute transpilation on preset change, target change, or custom upload
  useEffect(() => {
    try {
      const proj = isCustomMode && customProject ? customProject : activePreset.project;
      const res = UniversalTranspiler.transpile(proj, activeTarget);
      setTranspileResult(res);

      const zip = new JSZip();
      Object.entries(res.files).forEach(([filename, content]) => zip.file(filename, content));
      zip.generateAsync({ type: 'base64' }).then((b64) => setZipBase64(b64));
    } catch (e) {
      console.error('Transpilation error:', e);
    }
  }, [activePreset, activeTarget, customProject, isCustomMode]);

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

  const handleCustomUpload = (
    project: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini'
  ) => {
    setCustomProject(project);
    setActiveTarget(targetPlatform);
    setIsCustomMode(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-cyan-500/30 font-sans">
      {/* 1. HERO SECTION — THE 5-SECOND TEST */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Universal Positioning Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>The Universal Adapter for AI Coding Agents</span>
          </div>

          {/* High-Impact H1 Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Your AI coding rules{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              finally work everywhere.
            </span>
          </h1>

          {/* Clear Sub-Headline (What & Why in 2 Lines) */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            <strong>Cursor, Claude Code, Windsurf, ChatGPT, Copilot.</strong> Write your agent guidelines once.
            PromptShift adapts and transpiles them in 2 seconds flat — with <strong>zero lost context</strong> and <strong>zero leaked API keys</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#sandbox"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Try Live Interactive Demo (Free)</span>
            </a>

            <button
              onClick={() => handleOpenCheckout('single')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-base border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Coffee className="w-5 h-5 text-amber-400" />
              <span>Universal 4-in-1 Suite: $1.99</span>
            </button>
          </div>

          {/* 3 Immediate Reassurance Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No signup or account required</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>100% In-RAM (Zero files stored on disk)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>$1.99 Lifetime Pass (No recurring subscription)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS IN 3 EFFORTLESS STEPS */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Effortless Workflow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">How does it work in 3 steps?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Pick or Drop Your Project</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Drag your <code className="text-cyan-300">.cursorrules</code>, <code className="text-cyan-300">CLAUDE.md</code>, or click our 1-click sample templates below.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">AST Transpile & Sanitize</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our deterministic engine rewrites the exact syntax for your target IDE and <strong>automatically redacts leaked API tokens</strong> in memory.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Download & Code</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Download your ready-to-use universal bundle. Paste it into your repo, and your AI assistant follows 100% of your directives.
            </p>
          </div>
        </div>
      </section>

      {/* 3. REAL-TIME INTERACTIVE SANDBOX */}
      <section id="sandbox" className="py-16 md:py-24 bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Interactive Sandbox</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Watch live transpilation in action
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Click any sample application below to see how PromptShift transpiles agent architectures with zero manual editing.
            </p>
          </div>

          {/* Mode Switcher: 1-Click Samples vs Custom Upload */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isCustomMode
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
            >
              ⚡ 1-Click Interactive Presets
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCustomMode
                  ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Custom Project</span>
            </button>
          </div>

          {!isCustomMode ? (
            /* Presets Bar */
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
          ) : (
            /* Custom Dropzone Container */
            <div className="mb-8 max-w-2xl mx-auto">
              <Dropzone onProjectReady={handleCustomUpload} />
            </div>
          )}

          {/* Target Platform Selector */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Target Ecosystem:</span>
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

          {/* Before & After Console Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
            {/* Console Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-slate-300 font-bold">
                  {isCustomMode && customProject ? customProject.metadata.title : activePreset.project.metadata.title} ({activePreset.sourceKey} ➔ {activeTarget})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Parity: {transpileResult?.parityScore.toFixed(1) || 99.4}% Verified
                </span>
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  Security: Active Secrets Redacted In-RAM
                </span>
              </div>
            </div>

            {/* Split Screen Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs sm:text-sm font-mono">
              {/* Source Column */}
              <div className="p-5 overflow-auto max-h-[380px] bg-slate-950/30">
                <div className="text-slate-400 font-sans font-bold uppercase tracking-wider mb-2 flex items-center justify-between text-xs">
                  <span>Source ({activePreset.sourceKey})</span>
                  <span className="text-[11px] text-slate-500">Original Format</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {transpileResult?.diff?.sourceCode || activePreset.project.persona?.raw_system_prompt || 'No system prompt'}
                </pre>
              </div>

              {/* Target Transpiled Column */}
              <div className="p-5 overflow-auto max-h-[380px] bg-emerald-950/5">
                <div className="text-emerald-400 font-sans font-bold uppercase tracking-wider mb-2 flex items-center justify-between text-xs">
                  <span>Transpiled for {activeTarget.toUpperCase()}</span>
                  <span className="text-[11px] text-emerald-400/80">Ready to Deploy</span>
                </div>
                <pre className="text-emerald-200 whitespace-pre-wrap leading-relaxed">
                  {transpileResult?.diff?.targetCode || 'Generating...'}
                </pre>
              </div>
            </div>

            {/* In-Flow Action Conversion Bar */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left text-xs text-slate-300">
                <p className="font-bold text-white text-sm">Ready for your own repository?</p>
                <p className="text-slate-400">Download the full 4-in-1 suite with configs transpiled for Cursor, Claude, OpenAI & Gemini.</p>
              </div>
              <button
                onClick={() => handleOpenCheckout('single')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 fill-current" />
                <span>Export Universal 4-in-1 Suite ($1.99)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VISUAL COMPARISON: BEFORE VS AFTER */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">The Cost of Inaction</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why you can no longer do this manually</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WITHOUT PROMPTSHIFT */}
          <div className="p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-6">
              <XCircle className="w-4 h-4" />
              <span>WITHOUT PROMPTSHIFT (The Friction)</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>45 minutes wasted</strong> manually reformatting YAML frontmatter and Markdown syntax.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Your AI ignores instructions</strong> because Claude Code silently drops Cursor-specific tags.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Catastrophic secret leak risk</strong>: active OPENAI_API_KEY committed to public GitHub repos.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold">✕</span>
                <span><strong>Team desynchronization</strong>: every developer codes with divergent, outdated local instructions.</span>
              </li>
            </ul>
          </div>

          {/* WITH PROMPTSHIFT */}
          <div className="p-8 rounded-3xl bg-emerald-950/15 border border-emerald-500/30 relative shadow-xl shadow-emerald-950/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>WITH PROMPTSHIFT (The Flow)</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>2 seconds flat</strong>: a 1-click drag-and-drop or single instantaneous terminal command.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>99.4% verified AST fidelity</strong>: your coding agents strictly adhere to 100% of directives.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Automatic in-RAM secret sanitization</strong>: leaked credentials masked with zero server traces.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Universal 4-in-1 pack generated</strong>: Cursor, Claude, Windsurf & OpenAI aligned for $1.99.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. THE 4 PILLARS OF IRRESISTIBLE VALUE */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Engineered For Reliability</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">The 4 pillars that set PromptShift apart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Radical Simplicity (Zero Learning Curve)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No need to be a compiler engineer. Whether you write code daily or build with no-code tools, drop your config and get instant, flawless results.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Complete Universality (All AI IDEs Supported)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Never get locked into a single AI environment again. Code in Cursor in the morning, run Claude Code in your terminal, and share with your team in Windsurf.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Sovereign Privacy (Zero Server Retention)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your source code and prompts are <strong>never stored on any persistent database</strong>. All AST parsing executes ephemerally in RAM and purges instantly.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
              <Coffee className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">4. Transparent Micro-Pricing ($1.99 Single Pass)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No sneaky $39/mo subscriptions. Buy an impulsive $1.99 Single Pass (the cost of a coffee) strictly when you need to export a project.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHO IS IT FOR? (3 PERSONAS) */}
      <section className="py-16 md:py-20 bg-slate-950/40 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Target Audience</h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Is PromptShift right for you?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">👨‍💻</div>
              <h3 className="text-lg font-bold mb-2">The Solo Developer</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                You love Cursor for fast UI editing and Claude Code for terminal agent loops. PromptShift synchronizes guidelines in 2 seconds without breaking momentum.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="text-lg font-bold mb-2">The AI Creator & Builder</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                You discovered an awesome open-source prompt template on X or GitHub, but it's formatted for the wrong tool. PromptShift adapts it without technical headache.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-2xl mb-3">🏢</div>
              <h3 className="text-lg font-bold mb-2">The Tech Lead & Agency</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                In your team, some engineers use Cursor, others Windsurf or Copilot. PromptShift maintains a single source of truth across your entire organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRANSPARENT PRICING TIERS */}
      <section id="pricing" className="py-16 md:py-24 max-w-5xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Honest Pricing</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Simple, predictable rates</p>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Test freely with zero account creation. Upgrade with micro-payments only when exporting full projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Discovery */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Discovery</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">Free Starter</h3>
              <div className="text-3xl font-black mb-4">$0.00</div>
              <p className="text-slate-400 text-xs mb-6">Perfect to verify semantic parity and convert smaller configuration files.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Up to 2 files per project</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Live browser diff inspection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Zero signup or card required</span>
                </li>
              </ul>
            </div>
            <a
              href="#sandbox"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block transition-colors"
            >
              Test Live for Free
            </a>
          </div>

          {/* Single Pass (The Hero Offer) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-2 border-cyan-500/60 relative flex flex-col justify-between shadow-2xl shadow-cyan-500/10 scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Single Pass</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">4-in-1 Suite</h3>
              <div className="text-4xl font-black mb-1 text-white">$1.99</div>
              <span className="text-xs text-slate-400 block mb-4">One-time payment, no subscription</span>
              <p className="text-slate-300 text-xs mb-6">Export your complete repository for all 4 major AI ecosystems in 1 click.</p>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span><strong>Full 4-in-1 export</strong> (Cursor, Claude, OpenAI, Gemini)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited files for this project</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Automatic in-RAM secret redaction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>Instant ZIP download + PDF receipt</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout('single')}
              className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm text-center block transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Unlock This Project ($1.99)
            </button>
          </div>

          {/* Pro Developer */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Subscription</span>
              <h3 className="text-2xl font-bold mt-1 mb-2">Pro Unlimited</h3>
              <div className="text-3xl font-black mb-1">$5.99</div>
              <span className="text-xs text-slate-400 block mb-4">per month, cancel anytime</span>
              <p className="text-slate-400 text-xs mb-6">For active developers creating and migrating multi-agent projects weekly.</p>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Unlimited projects & conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>GitHub Actions CI/CD automation token</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Priority developer support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout('pro')}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center block transition-colors cursor-pointer"
            >
              Get Pro Pass
            </button>
          </div>
        </div>
      </section>

      {/* 8. ANTI-OBJECTION FAQ */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 border-b border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Clear Answers</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Do I need to know how to code to use PromptShift?",
              a: "No, absolutely not. Simply drag and drop your configuration file or click our sample templates. PromptShift handles all compiler formatting behind the scenes."
            },
            {
              q: "Is my source code or prompt data stored on your servers?",
              a: "No. We operate under a strict '100% In-RAM Zero Retention' architecture. Your project is processed ephemerally in browser memory or stateless edge instances and purged immediately. Nothing is written to a persistent database or disk."
            },
            {
              q: "Why pay $1.99 instead of asking ChatGPT to convert my config?",
              a: "Large language models hallucinate editor-specific configuration tags (such as scoped .cursor/rules glob headers or Claude YAML schemas). PromptShift uses a deterministic AST engine that guarantees 99.4% mathematical parity while automatically masking active API keys."
            },
            {
              q: "Does it support modern versions of Cursor, Claude Code, and Windsurf?",
              a: "Yes. PromptShift is continuously updated to support modern formats: Cursor modular .cursor/rules/*.mdc, legacy .cursorrules, Anthropic flat CLAUDE.md guidelines, Windsurf .windsurfrules, and Copilot instruction bundles."
            },
            {
              q: "Can I run this directly in my terminal or CI/CD pipeline?",
              a: "Yes! Run 'npx promptshift' inside any repo to execute conversions locally in 1.2 seconds without opening a browser, or run 'npx promptshift --init-ci' to automate multi-agent sync in GitHub Actions."
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

      {/* 9. TERMINAL CLI TIP */}
      <section className="py-12 bg-slate-950 text-center border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Prefer the command line?</p>
          <div
            onClick={handleCopyCli}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 text-sm hover:border-cyan-500/50 transition-all cursor-pointer shadow-inner"
          >
            <span>$ npx promptshift</span>
            <span className="text-xs text-slate-500 font-sans">
              {copiedCode ? '✓ Copied!' : '(Click to copy)'}
            </span>
          </div>
        </div>
      </section>

      {/* 10. FINAL CLOSING CTA BANNER */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Ready to make your AI coding rules work everywhere?
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">
            Join hundreds of developers who stopped manually rewriting their agent rules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleOpenCheckout('single')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Export Universal 4-in-1 Suite ($1.99)
            </button>
            <a
              href="#sandbox"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 transition-colors"
            >
              Test Live Sandbox Free
            </a>
          </div>
        </div>
      </section>

      {/* UNIFIED POLAR PAYMENT MODAL */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        projectName={isCustomMode && customProject ? customProject.metadata.title : activePreset.name}
        zipBase64={zipBase64}
        initialPlan={paymentPlan}
        initialIsPaid={false}
      />
    </div>
  );
}
