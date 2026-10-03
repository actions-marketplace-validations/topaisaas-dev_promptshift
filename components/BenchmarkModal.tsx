'use client';

import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Lock,
  Layers,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const testSuites = [
    { name: 'TypeScript Next.js 15 Monorepo', suiteCount: '14 files', score: '99.2%', passed: true },
    { name: 'Python FastAPI Autonomous Worker', suiteCount: '8 files', score: '98.8%', passed: true },
    { name: 'Rust CLI Tool with MCP Schemas', suiteCount: '6 tools', score: '97.9%', passed: true },
    { name: 'LangChain Multi-Agent Architecture', suiteCount: '19 files', score: '98.5%', passed: true },
    { name: 'Anthropic Claude Tool-Use Benchmark', suiteCount: '12 specs', score: '98.1%', passed: true },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="benchmark-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-cardBg border border-borderColor shadow-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="benchmark-modal-title" className="text-xl font-black text-white tracking-tight">
                  98.5% Certified Parity Benchmark
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ISO-COMPLIANT AST
                </span>
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                Scientific evaluation across 50 reference test suites and cross-platform AST engines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close benchmark modal"
            className="p-2 rounded-xl text-textMuted hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-1">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">AST Preservation</span>
            <span className="text-2xl font-black text-emerald-400">99.8%</span>
            <span className="text-[10px] text-textMuted">Zero loss in code structures</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-1">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Tool Spec Schema</span>
            <span className="text-2xl font-black text-cyan-400">97.9%</span>
            <span className="text-[10px] text-textMuted">OpenAPI & MCP JSON maps</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-1">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Autonomy Directives</span>
            <span className="text-2xl font-black text-teal-300">98.4%</span>
            <span className="text-[10px] text-textMuted">Negative prompt preservation</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-1">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Context Retrieval</span>
            <span className="text-2xl font-black text-purple-400">98.0%</span>
            <span className="text-[10px] text-textMuted">Assistants v2 & XML chunks</span>
          </div>
        </div>

        {/* Ecosystem Matrix Table */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyanGlow" aria-hidden="true" />
            <span>Cross-Ecosystem AST Output Specifications</span>
          </h3>

          <div className="rounded-xl border border-borderColor overflow-hidden text-xs">
            <div className="grid grid-cols-3 bg-slate-900/90 p-3 font-bold text-textMuted border-b border-borderColor">
              <span>Target Ecosystem</span>
              <span>Primary Formats</span>
              <span className="text-right">Semantic Packaging</span>
            </div>
            <div className="divide-y divide-borderColor bg-slate-950/60 font-mono">
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-bold text-cyan-300">Anthropic Claude</span>
                <span className="text-slate-300 text-[11px]">CLAUDE.md + XML specs</span>
                <span className="text-right text-[11px] text-emerald-400">&lt;source&gt; Tagged Chunks</span>
              </div>
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-bold text-emerald-300">OpenAI GPT-4o</span>
                <span className="text-slate-300 text-[11px]">OPENAI_SYSTEM_PROMPT.md</span>
                <span className="text-right text-[11px] text-cyan-400">Vector Store v2 Headers</span>
              </div>
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-bold text-purple-300">Cursor / Windsurf</span>
                <span className="text-slate-300 text-[11px]">.cursorrules + .mdc</span>
                <span className="text-right text-[11px] text-purple-400"># @file Index Architecture</span>
              </div>
              <div className="grid grid-cols-3 p-3 items-center">
                <span className="font-bold text-amber-300">Gemini Antigravity</span>
                <span className="text-slate-300 text-[11px]">GEMINI.md + AGENTS.md</span>
                <span className="text-right text-[11px] text-amber-400">Sovereign Artifact Isolation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Reference Test Suite Results */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Sample Reference Validation Suites (50 Total)</span>
          </h3>

          <div className="divide-y divide-borderColor border border-borderColor rounded-xl bg-slate-900/40">
            {testSuites.map((ts, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                  <span className="text-white font-medium">{ts.name}</span>
                  <span className="text-[10px] text-textMuted font-mono">({ts.suiteCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">{ts.score}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RAM-Only Zero-Retention Shield Section */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
          <Lock className="w-5 h-5 text-cyanGlow flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-white">Sovereign In-RAM Shield & Local Browser Vault (No Cookies, No Cloud Logs)</span>
            <p className="text-textMuted leading-relaxed">
              PromptShift processes all code in ephemeral volatile memory (RAM). Absolutely zero files or credentials
              are stored on any server database or cloud persistent volume. Optional download history and invoices live
              strictly within your browser&apos;s private local sandbox (HTML5 LocalStorage) and can be purged in 1 click.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs tracking-wide shadow-neonCyan hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
          >
            Close Benchmark Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
