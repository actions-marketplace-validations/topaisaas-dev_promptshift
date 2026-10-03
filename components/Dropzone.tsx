'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FolderUp, FileCode2, CheckCircle2, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { ClientPruner, ScannedFile } from '@/lib/pruner';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { SecurityGuards } from '@/lib/converter/securityGuards';
import JSZip from 'jszip';

interface DropzoneProps {
  onProjectReady: (project: CanonicalProject, targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini') => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onProjectReady }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pruningStats, setPruningStats] = useState<{ rawBytes: number; prunedBytes: number; fileCount: number } | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<'claude' | 'openai' | 'cursor' | 'gemini'>('claude');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFileList = async (files: File[]) => {
    setIsProcessing(true);
    setErrorMessage(null);

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

      setPruningStats({
        rawBytes: rawTotalBytes,
        prunedBytes: prunedTotalBytes,
        fileCount: scannedFiles.length || knowledgeBase.length + (masterPrompt ? 1 : 0),
      });

      // Assemble Canonical Project
      let projectName = 'Imported Project';
      if (files.length > 0 && files[0]) {
        const relPath = (files[0] as any).webkitRelativePath;
        if (relPath && (relPath.includes('/') || relPath.includes('\\'))) {
          projectName = relPath.split(/[/\\]/)[0];
        } else {
          projectName = files[0].name.replace(/\.zip$/i, '');
        }
      }

      const canonical: CanonicalProject = {
        metadata: {
          id: `proj-${Date.now()}`,
          title: projectName,
          description: `Migrated via PromptShift (promptshift.dev)`,
          source_platform: masterPrompt.includes('CLAUDE') ? 'claude' : masterPrompt.includes('cursor') ? 'cursor' : 'antigravity',
          version: '1.0.0',
        },
        persona: {
          role: `Dedicated pair programming agent for ${projectName}`,
          raw_system_prompt: masterPrompt || '# Project Instructions\nAct proactively with full autonomy.',
          instructions: [],
          constraints: [],
          autonomy_clause: masterPrompt.includes('ET BEN BRAVO!') ? "Unconditional autonomy active until: 'ET BEN BRAVO!'" : undefined,
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

      onProjectReady(canonical, targetPlatform);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(`Failed to process files: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      {/* Target Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-cardBg border border-borderColor">
        <span className="text-xs font-semibold text-textMuted px-3">Convert to:</span>
        {(['claude', 'openai', 'cursor', 'gemini'] as const).map((platform) => (
          <button
            key={platform}
            onClick={() => setTargetPlatform(platform)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              targetPlatform === platform
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-neonCyan'
                : 'text-textMuted hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Main Drag & Drop Zone */}
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
            Instantly converts Antigravity, Claude, OpenAI & Cursor projects with 98.5% verified parity.
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Free up to 5 files
            </span>
            <span className="text-[11px] font-medium text-textMuted">•</span>
            <span className="text-[11px] font-semibold text-slate-300">
              $1.99 one-time pass for complete repositories
            </span>
          </div>
        </div>

        {/* Buttons for Folder or Zip */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-105"
          >
            <FolderUp className="w-4 h-4 text-cyanGlow" />
            <span>Select Project Folder</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-105"
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
            <span>Sashing bulk dependencies & parsing instructions in RAM...</span>
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
    </div>
  );
};
