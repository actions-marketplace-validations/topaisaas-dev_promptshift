'use client';

import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle2, ServerOff, EyeOff, KeyRound } from 'lucide-react';

interface SecurityWhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityWhitepaperModal: React.FC<SecurityWhitepaperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-whitepaper-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="w-full max-w-4xl bg-cardBg border border-borderColor rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="security-whitepaper-title" className="text-xl font-black text-white tracking-tight">
                  Enterprise Security & Sovereign Architecture Whitepaper
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SOC-2 & GDPR READY
                </span>
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                Technical evaluation for Chief Information Security Officers (CISOs), Enterprise IT, and Tech Leads.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close security whitepaper"
            className="p-2 text-textMuted hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1">
              <ServerOff className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zero Persistent Storage</h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              No server hard drives, No S3/GCS buckets for code, No MongoDB/PostgreSQL logs. Transformations occur exclusively in ephemeral volatile RAM and are shredded instantly upon completion.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Zero Model Training</h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Customer instructions, rules, and schemas are never fed to OpenAI, Google, Anthropic, or any LLM training pipeline. The transpiler is deterministic AST mapping.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">In-RAM Secret Sanitization</h3>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Automated regex engine detects and redacts 11+ key formats (OpenAI, Anthropic, AWS, GitHub, Stripe, SSH keys) before bundles are packaged.
            </p>
          </div>
        </div>

        {/* Technical Data Lifecycle Architecture */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-900 border border-borderColor">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>End-to-End Cryptographic Data Lifecycle</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-borderColor flex flex-col gap-1">
              <span className="font-mono text-cyan-400 font-bold">1. Ingest & Prune</span>
              <span className="text-[11px] text-textMuted">Dependency folders (.git, node_modules) stripped client-side in browser RAM (&lt;80ms).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-borderColor flex flex-col gap-1">
              <span className="font-mono text-emerald-400 font-bold">2. AST Transpile</span>
              <span className="text-[11px] text-textMuted">In-RAM syntax parser maps master prompt, rules, tools, and vector context without disk write.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-borderColor flex flex-col gap-1">
              <span className="font-mono text-teal-300 font-bold">3. Sanitization</span>
              <span className="text-[11px] text-textMuted">Magic byte blocking, indirect injection neutralization, zero-width steganography stripped.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-borderColor flex flex-col gap-1">
              <span className="font-mono text-purple-400 font-bold">4. Memory Shred</span>
              <span className="text-[11px] text-textMuted">ZIP streamed back to client browser. RAM buffer marked for immediate garbage collection shredding.</span>
            </div>
          </div>
        </div>

        {/* GDPR Article 28 & Data Processing Agreement */}
        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-slate-950/80 border border-borderColor text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>GDPR Article 28 & Data Processing Agreement (DPA) Compliance</span>
          </div>
          <p className="text-textMuted leading-relaxed">
            Under GDPR (EU 2016/679) Article 28, PromptShift acts as an ephemeral data processor. Because zero customer
            source code is retained, there are zero third-party cloud subprocessors for your repository code.
            Only PCI-DSS Level 1 payment processors (PayPal, Stripe) handle billing metadata.
          </p>
          <div className="flex items-center gap-4 mt-2 text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Standard Contractual Clauses (SCC) Supported
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              EU Sovereign Hosting Available
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-textMuted border-t border-borderColor pt-4">
          <span>Enterprise compliance queries: compliance@promptshift.dev</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Close Whitepaper
          </button>
        </div>
      </div>
    </div>
  );
};
