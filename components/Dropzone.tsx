'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FolderUp,
  FileCode2,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ClientPruner, ScannedFile } from '@/lib/pruner';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { SecurityGuards } from '@/lib/converter/securityGuards';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { MonetizationManager } from '@/lib/config/monetizationConfig';
import JSZip from 'jszip';

interface DropzoneProps {
  onProjectReady: (
    project: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini',
    isSlicedStarter?: boolean
  ) => void;
  activeMode?: 'starter' | 'pro';
  onModeChange?: (mode: 'starter' | 'pro') => void;
}

interface OverlimitState {
  projectName: string;
  masterPrompt: string;
  rulesList: { name: string; content: string }[];
  knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[];
  rawBytes: number;
  prunedBytes: number;
  totalCount: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onProjectReady,
  activeMode = 'starter',
  onModeChange,
}) => {
  const [currentMode, setCurrentMode] = useState<'starter' | 'pro'>(activeMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pruningStats, setPruningStats] = useState<{ rawBytes: number; prunedBytes: number; fileCount: number } | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<'claude' | 'openai' | 'cursor' | 'gemini'>('claude');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overlimitState, setOverlimitState] = useState<OverlimitState | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>(() =>
    typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD'
  );
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const freeLimit = MonetizationManager.getFreeLimit();

  useEffect(() => {
    if (activeMode) setCurrentMode(activeMode);
  }, [activeMode]);

  useEffect(() => {
    setCurrency(CurrencyManager.getActiveCurrency());
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    window.addEventListener('promptshift_currency_changed', handler);
    return () => window.removeEventListener('promptshift_currency_changed', handler);
  }, []);

  const singlePrice = CurrencyManager.getTierPrice('single', currency);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleModeSwitch = (mode: 'starter' | 'pro') => {
    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
    if (overlimitState) {
      if (mode === 'pro') {
        // Automatically unlock all files
        finalizeProject(
          overlimitState.projectName,
          overlimitState.masterPrompt,
          overlimitState.rulesList,
          overlimitState.knowledgeBase,
          false
        );
        setOverlimitState(null);
      }
    }
  };

  const buildCanonicalProject = (
    projectName: string,
    masterPrompt: string,
    rulesList: { name: string; content: string }[],
    knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[]
  ): CanonicalProject => {
    return {
      metadata: {
        id: `proj-${Date.now()}`,
        title: projectName,
        description: `Migrated via PromptShift (promptshift.dev)`,
        source_platform: masterPrompt.includes('CLAUDE')
          ? 'claude'
          : masterPrompt.includes('cursor')
          ? 'cursor'
          : 'antigravity',
        version: '1.0.0',
      },
      persona: {
        role: `Dedicated pair programming agent for ${projectName}`,
        raw_system_prompt: masterPrompt || '# Project Instructions\nAct proactively with full autonomy.',
        instructions: [],
        constraints: [],
        autonomy_clause: masterPrompt.includes('ET BEN BRAVO!')
          ? "Unconditional autonomy active until: 'ET BEN BRAVO!'"
          : undefined,
      },
      rules: rulesList.map((r) => ({
        name: r.name,
        content: r.content,
        scope: 'workspace',
        trigger: 'always_on',
      })),
      knowledge_base: knowledgeBase,
      tools: [],
      security: {
        permission_mode: 'full_autonomy',
        allow_grants: ['*'],
        deny_grants: [],
      },
    };
  };

  const finalizeProject = (
    projectName: string,
    masterPrompt: string,
    rulesList: { name: string; content: string }[],
    knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[],
    isSlicedStarter: boolean = false
  ) => {
    const canonical = buildCanonicalProject(projectName, masterPrompt, rulesList, knowledgeBase);
    onProjectReady(canonical, targetPlatform, isSlicedStarter);
  };

  const processFileList = async (files: File[]) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setOverlimitState(null);

    let rawTotalBytes = 0;
    let prunedTotalBytes = 0;
    const scannedFiles: ScannedFile[] = [];

    let masterPrompt = '';
    const rulesList: { name: string; content: string }[] = [];
    const knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[] = [];

    try {
      for (const file of files) {
        rawTotalBytes += file.size;
        const relativePath = (file as any).webkitRelativePath || file.name;

        // If it's a zip file, extract in RAM with zip bomb safeguard
        if (file.name.toLowerCase().endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          const zipEntries = Object.values(zip.files);

          // Calculate estimated uncompressed size
          let totalEstimatedBytes = 0;
          for (const entry of zipEntries) {
            if (!entry.dir) totalEstimatedBytes += (entry as any)._data?.uncompressedSize || entry.name.length * 100;
          }

          const zipCheck = SecurityGuards.validateZipLimits(zipEntries.length, totalEstimatedBytes, file.size);
          if (!zipCheck.isSafe) {
            setErrorMessage(`Security Warning: ${zipCheck.reason}`);
            setIsProcessing(false);
            return;
          }
          for (const entry of zipEntries) {
            if (entry.dir) continue;
            // Zip Slip path traversal shield
            if (!SecurityGuards.isSafeFilePath(entry.name)) {
              console.warn(`[SecurityShield] Blocked Zip Slip attempt: ${entry.name}`);
              continue;
            }
            if (!ClientPruner.shouldKeepFile(entry.name)) continue;

            const content = await entry.async('string');
            prunedTotalBytes += content.length;
            const category = ClientPruner.categorizeFile(entry.name);

            if (category === 'master_instruction' && !masterPrompt) {
              masterPrompt = content;
            } else if (category === 'rule') {
              rulesList.push({ name: entry.name, content });
            } else {
              knowledgeBase.push({
                filename: entry.name,
                content_text: content,
                mime_type: 'text/plain',
                size_bytes: content.length,
              });
            }
          }
          continue;
        }

        // Regular file or folder entry
        if (!ClientPruner.shouldKeepFile(relativePath)) continue;

        const content = await file.text().catch(() => '');
        prunedTotalBytes += content.length;
        const category = ClientPruner.categorizeFile(relativePath);

        scannedFiles.push({
          path: relativePath,
          name: file.name,
          size: file.size,
          content,
          category,
        });

        if (category === 'master_instruction' && !masterPrompt) {
          masterPrompt = content;
        } else if (category === 'rule') {
          rulesList.push({ name: file.name, content });
        } else {
          knowledgeBase.push({
            filename: relativePath,
            content_text: content,
            mime_type: 'text/plain',
            size_bytes: content.length,
          });
        }
      }

      // Determine project title
      let projectName = 'Imported Project';
      if (files.length > 0 && files[0]) {
        const relPath = (files[0] as any).webkitRelativePath;
        if (relPath && (relPath.includes('/') || relPath.includes('\\'))) {
          projectName = relPath.split(/[/\\]/)[0];
        } else {
          projectName = files[0].name.replace(/\.zip$/i, '');
        }
      }

      const totalValidFiles = (masterPrompt ? 1 : 0) + rulesList.length + knowledgeBase.length;

      setPruningStats({
        rawBytes: rawTotalBytes,
        prunedBytes: prunedTotalBytes,
        fileCount: totalValidFiles,
      });

      // Handle Free Starter limit exceeding (> freeLimit files)
      if (currentMode === 'starter' && totalValidFiles > freeLimit) {
        setOverlimitState({
          projectName,
          masterPrompt,
          rulesList,
          knowledgeBase,
          rawBytes: rawTotalBytes,
          prunedBytes: prunedTotalBytes,
          totalCount: totalValidFiles,
        });
        setIsProcessing(false);
        return;
      }

      // Pro mode or files <= freeLimit: finalize immediately
      finalizeProject(projectName, masterPrompt, rulesList, knowledgeBase, false);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(`Failed to process files: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveUnlockAll = () => {
    if (!overlimitState) return;
    setCurrentMode('pro');
    if (onModeChange) onModeChange('pro');
    finalizeProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      overlimitState.rulesList,
      overlimitState.knowledgeBase,
      false
    );
    setOverlimitState(null);
  };

  const handleResolveKeepStarter = () => {
    if (!overlimitState) return;
    // Slices to master prompt + top rule (up to freeLimit files total)
    const masterSlots = overlimitState.masterPrompt ? 1 : 0;
    const availableSlots = Math.max(0, freeLimit - masterSlots);
    const slicedRules = overlimitState.rulesList.slice(0, availableSlots);
    const remainingForKb = Math.max(0, availableSlots - slicedRules.length);
    const slicedKb = overlimitState.knowledgeBase.slice(0, remainingForKb);

    finalizeProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      slicedRules,
      slicedKb,
      true // Mark as sliced starter
    );
    setOverlimitState(null);
  };

  return (
    <div id="dropzone" className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      {/* Plan Mode Switcher Tabs */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 p-1.5 rounded-2xl bg-cardBg/90 border border-borderColor backdrop-blur-sm shadow-xl">
        <button
          type="button"
          onClick={() => handleModeSwitch('starter')}
          className={`flex-1 flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all border text-left cursor-pointer ${
            currentMode === 'starter'
              ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm text-white'
              : 'bg-transparent border-transparent text-textMuted hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                currentMode === 'starter' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Free Starter
                {currentMode === 'starter' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    ACTIVE
                  </span>
                )}
              </span>
              <span className="text-[11px] text-textMuted">
                ≤ 5 files • 100% Instant, zero email required
              </span>
            </div>
          </div>
        </button>

        <div className="hidden sm:block w-px h-8 bg-borderColor/60" />

        <button
          type="button"
          onClick={() => handleModeSwitch('pro')}
          className={`flex-1 flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all border text-left cursor-pointer ${
            currentMode === 'pro'
              ? 'bg-slate-800/90 border-cyan-500/50 shadow-sm text-white'
              : 'bg-transparent border-transparent text-textMuted hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                currentMode === 'pro' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              🚀
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {isFreeBeta ? 'Pro Developer (Beta)' : 'Pro Developer'}
                {currentMode === 'pro' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                    ACTIVE
                  </span>
                )}
              </span>
              <span className="text-[11px] text-textMuted">
                {isFreeBeta
                  ? 'Unlimited files • 100% Free in Beta with email'
                  : `Unlimited files • From ${singlePrice.formatted} one-time pass`}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Target Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cardBg border border-borderColor">
        <span className="text-xs font-semibold text-textMuted px-3">Convert to:</span>
        {(['claude', 'openai', 'cursor', 'gemini'] as const).map((platform) => (
          <button
            key={platform}
            onClick={() => setTargetPlatform(platform)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
              targetPlatform === platform
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-neonCyan'
                : 'text-textMuted hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Interactive Overlimit Resolution Dialog if > 5 files dropped in Starter mode */}
      {overlimitState ? (
        <div className="w-full p-8 sm:p-10 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl flex flex-col gap-6 text-left animate-fadeIn backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Project Exceeds Free Starter Limit ({overlimitState.totalCount} Files Detected)
                </h3>
                <p className="text-xs text-textMuted mt-1">
                  The Free Starter plan includes up to 5 files with zero email required. How would you like to proceed?
                </p>
              </div>
            </div>
            <button
              onClick={() => setOverlimitState(null)}
              className="text-textMuted hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Unlock All with Free Pro Pass */}
            <div className="p-5 rounded-2xl bg-cardBg border border-cyan-500/40 flex flex-col justify-between gap-4 hover:border-cyan-400 transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    Option 1 • Recommended
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {isFreeBeta ? '100% FREE BETA' : 'FULL REPOSITORY PASS'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  {isFreeBeta
                    ? `Unlock All ${overlimitState.totalCount} Files with Free Pro Pass`
                    : `Unlock All ${overlimitState.totalCount} Files (${singlePrice.formatted})`}
                </h4>
                <p className="text-xs text-textMuted leading-relaxed">
                  {isFreeBeta
                    ? `Converts your complete repository with all ${overlimitState.totalCount} instructions, rules and knowledge files. Zero payment required during the Open Beta.`
                    : `Converts your complete repository with all ${overlimitState.totalCount} instructions, rules and knowledge files with verified parity. Instant 1-time pass at ${singlePrice.formatted}.`}
                </p>
              </div>

              <button
                onClick={handleResolveUnlockAll}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs shadow-neonCyan transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>
                  {isFreeBeta
                    ? `Switch to Pro & Convert All ${overlimitState.totalCount} Files`
                    : `Unlock Full Repository (${singlePrice.formatted})`}
                </span>
              </button>
            </div>

            {/* Option 2: Keep Free Starter and Convert 5 Core Files */}
            <div className="p-5 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Option 2
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NO EMAIL NEEDED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Keep Free Starter (Convert 5 Core Files Only)
                </h4>
                <p className="text-xs text-textMuted leading-relaxed">
                  Extracts and converts your master instructions and top rules (5 files max). Fully anonymous with zero email or registration.
                </p>
              </div>

              <button
                onClick={handleResolveKeepStarter}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✂️ Convert 5 Core Files Only</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setOverlimitState(null)}
              className="text-xs text-textMuted hover:text-white underline cursor-pointer"
            >
              Cancel and upload another folder or archive
            </button>
          </div>
        </div>
      ) : (
        /* Main Drag & Drop Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) processFileList(files);
          }}
          className={`w-full p-12 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden bg-cardBg/50 backdrop-blur-sm ${
            isDragging
              ? 'border-cyanGlow bg-cyanGlow/5 shadow-neonCyan scale-[1.01]'
              : 'border-borderColor hover:border-slate-600'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow">
            <UploadCloud className="w-10 h-10 animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Drop your project folder or <code className="text-cyanGlow">.zip</code> archive here
            </h3>
            <p className="text-sm text-textMuted max-w-md">
              Instantly converts Antigravity, Claude, OpenAI &amp; Cursor projects with 98.5% verified parity.
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              {currentMode === 'starter' ? (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Free Starter Active • Up to 5 files • 100% Instant, no email needed
                </span>
              ) : (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {isFreeBeta
                    ? 'Pro Developer Mode Active • Unlimited files • Free in Beta with email'
                    : `Pro Developer Mode Active • Unlimited files • ${singlePrice.formatted} one-time pass`}
                </span>
              )}
            </div>
          </div>

          {/* Buttons for Folder or Zip */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-105 cursor-pointer"
            >
              <FolderUp className="w-4 h-4 text-cyanGlow" />
              <span>Select Project Folder</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-105 cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-emeraldGlow" />
              <span>Upload .ZIP Archive</span>
            </button>

            {/* Hidden inputs */}
            <input
              type="file"
              ref={folderInputRef}
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFileList(Array.from(e.target.files));
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFileList(Array.from(e.target.files));
              }}
            />
          </div>

          {/* Pruning and Processing Indicators */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-cyanGlow font-medium text-xs mt-2 animate-pulse">
              <Zap className="w-4 h-4" />
              <span>Slashing bulk dependencies &amp; parsing instructions in RAM...</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 text-rose-400 text-xs mt-2 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {pruningStats && (
            <div className="flex items-center gap-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-5 py-2.5 rounded-xl border border-emerald-500/30 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                RAM Pruner: {(pruningStats.rawBytes / (1024 * 1024)).toFixed(1)} MB slashed to{' '}
                {(pruningStats.prunedBytes / (1024 * 1024)).toFixed(2)} MB ({pruningStats.fileCount} clean files)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
