'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Lock,
  Cpu,
  Sparkles,
  FileCode,
  Eye,
  Gift,
  Zap,
} from 'lucide-react';
import { TranspileResult } from '@/lib/converter/universalTranspiler';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { PromoManager } from '@/lib/promo/promoManager';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface DiffInspectorProps {
  result: TranspileResult;
  fileCount?: number;
  isFree?: boolean;
  onFreeDownload?: () => void;
  activeFile?: {
    name: string;
    sourceCode: string;
    targetCode: string;
    sourceTitle: string;
    targetTitle: string;
    parityScore?: number;
    parityLabel?: string;
    secretsCount?: number;
  };
  onExportRequest: () => void;
}

export const DiffInspector: React.FC<DiffInspectorProps> = ({
  result,
  fileCount = 1,
  isFree = false,
  onFreeDownload,
  activeFile,
  onExportRequest,
}) => {
  const [copiedSide, setCopiedSide] = useState<'source' | 'target' | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    setCurrency(CurrencyManager.getActiveCurrency());
    setIsVip(PromoManager.isVipActive());

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    const vipHandler = () => setIsVip(true);

    window.addEventListener('promptshift_currency_changed', handler);
    window.addEventListener('promptshift_vip_activated', vipHandler);

    return () => {
      window.removeEventListener('promptshift_currency_changed', handler);
      window.removeEventListener('promptshift_vip_activated', vipHandler);
    };
  }, []);

  const sourceTitle = activeFile?.sourceTitle || result.diff.sourceTitle;
  const sourceCode = activeFile?.sourceCode || result.diff.sourceCode;
  const targetTitle = activeFile?.targetTitle || result.diff.targetTitle;
  const targetCode = activeFile?.targetCode || result.diff.targetCode;

  const parityScore = activeFile?.parityScore !== undefined ? activeFile.parityScore : result.parityScore;
  const parityLabel = activeFile?.parityLabel || 'PARITY';
  const secretsCount = activeFile?.secretsCount !== undefined ? activeFile.secretsCount : result.alerts.length;

  const activeFileName = activeFile?.name || 'master_instructions';

  const handleCopy = (text: string, side: 'source' | 'target') => {
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    const label = side === 'source' ? 'Source file code' : 'Converted file code';
    setStatusAnnouncement(`${label} copied to clipboard.`);
    setTimeout(() => {
      setCopiedSide(null);
      setStatusAnnouncement('');
    }, 2500);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([targetCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Derive clean output filename
    let downloadName = activeFileName.split('/').pop() || 'converted_file.txt';
    if (activeFileName.endsWith('GEMINI.md') && result.targetPlatform === 'claude') {
      downloadName = 'CLAUDE.md';
    } else if (activeFileName.endsWith('GEMINI.md') && result.targetPlatform === 'cursor') {
      downloadName = '.cursorrules';
    } else if (activeFileName.endsWith('GEMINI.md') && result.targetPlatform === 'openai') {
      downloadName = 'OPENAI_SYSTEM_PROMPT.md';
    }
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusAnnouncement(`File ${downloadName} downloaded.`);
  };

  const sourceLines = sourceCode.split('\n').length;
  const targetLines = targetCode.split('\n').length;

  return (
    <section aria-label="Pre-Flight Code Diff and Transpilation Viewer" className="w-full flex flex-col gap-6">
      {/* Screen reader live announcement for status changes */}
      <div aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cardBg border border-borderColor shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyanGlow" aria-hidden="true">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">{result.projectName}</h2>
              {activeFile && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeFile.name}
                </span>
              )}
            </div>
            <span className="text-xs text-textMuted font-mono">
              Ecosystem Shift: {result.sourcePlatform.toUpperCase()} ➔ {result.targetPlatform.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3" role="status" aria-label="Security and parity status">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{parityLabel} {parityScore}% CERTIFIED</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
            <span>RAM-ONLY ZERO RETENTION</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>{secretsCount} SECRETS REDACTED</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Diff Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-cardBg border border-borderColor overflow-hidden shadow-2xl">
        {/* Source Panel */}
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-borderColor">
          <div className="px-5 py-3.5 bg-slate-900/80 border-b border-borderColor flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                SOURCE
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyanGlow">
                {sourceTitle}
              </span>
              <span className="text-[10px] text-textMuted font-mono">({sourceLines} lines)</span>
            </div>
            <button
              onClick={() => handleCopy(sourceCode, 'source')}
              aria-label={`Copy source code of ${sourceTitle}`}
              className="flex items-center gap-1.5 text-xs text-textMuted hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
            >
              {copiedSide === 'source' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre
            tabIndex={0}
            aria-label={`Source file code: ${sourceTitle}`}
            className="p-5 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[500px] bg-[#070b12] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <code>{sourceCode}</code>
          </pre>
        </div>

        {/* Target Panel */}
        <div className="flex flex-col">
          <div className="px-5 py-3.5 bg-slate-900/80 border-b border-borderColor flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CONVERTED
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emeraldGlow">
                {targetTitle}
              </span>
              <span className="text-[10px] text-textMuted font-mono">({targetLines} lines)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadSingleFile}
                aria-label={`Download single file: ${activeFileName}`}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none transition-all"
                title="Download this file only"
              >
                <Download className="w-3 h-3" aria-hidden="true" />
                <span>Save File</span>
              </button>

              <button
                onClick={() => handleCopy(targetCode, 'target')}
                aria-label={`Copy converted code of ${targetTitle}`}
                className="flex items-center gap-1.5 text-xs text-textMuted hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
              >
                {copiedSide === 'target' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <pre
            tabIndex={0}
            aria-label={`Converted file code: ${targetTitle}`}
            className="p-5 font-mono text-xs text-emerald-300/90 leading-relaxed overflow-x-auto max-h-[500px] bg-[#070b12] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <code>{targetCode}</code>
          </pre>
        </div>
      </div>

      {/* Bottom Action Footer with Agent Simulation & Free Tier Detection */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-cardBg border border-borderColor shadow-lg">
        <div className="flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Agent Simulation Preview ({result.targetPlatform.toUpperCase()})
            </span>
            {isFree ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FREE TIER (≤ 5 FILES)
              </span>
            ) : isVip ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-400" />
                <span>VIP PASS ACTIVE (100% FREE)</span>
              </span>
            ) : MonetizationManager.isFreeBeta() ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRO BETA ACCESS ({fileCount} FILES • {CurrencyManager.formatZero(currency)})
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRO REPOSITORY ({fileCount} FILES)
              </span>
            )}
          </div>
          <p className="text-xs text-textMuted italic">
            "Hello! I am your dedicated pair programmer, configured with strict {result.targetPlatform} directives and proactive execution."
          </p>
        </div>

        {isFree || isVip ? (
          <button
            onClick={onFreeDownload}
            aria-label={`Download full free bundle of ${fileCount} files`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-sm tracking-wide shadow-neonEmerald hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none transition-all"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>
              {isVip
                ? `Download VIP Bundle (100% FREE • ${fileCount} Files)`
                : `Download Free Bundle (${fileCount}/5 Files)`}
            </span>
          </button>
        ) : MonetizationManager.isFreeBeta() ? (
          <button
            onClick={onExportRequest}
            aria-label={`Claim Free Pro Pass for ${fileCount} files`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 text-black font-black text-sm tracking-wide shadow-neonCyan hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 flex-shrink-0 fill-current" />
            <span>Claim Free Pro Bundle ({fileCount} Files • {CurrencyManager.formatZero(currency)})</span>
          </button>
        ) : (
          <button
            onClick={onExportRequest}
            aria-label={`Export complete repository bundle for ${CurrencyManager.getTierPrice('single', currency).formatted}`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-sm tracking-wide shadow-neonCyan hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export 1-Click Bundle ({CurrencyManager.getTierPrice('single', currency).formatted})</span>
          </button>
        )}
      </div>
    </section>
  );
};
