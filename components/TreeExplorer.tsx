'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Shield, Wrench, Database, Search, X, Command } from 'lucide-react';
import { CanonicalProject } from '@/lib/converter/capsSchema';

export interface TreeFileItem {
  name: string;
  category: 'Master Prompt' | 'Rule' | 'Tool Spec' | 'Knowledge Doc';
  badgeClass: string;
  icon: any;
  content: string;
  size: string;
}

interface TreeExplorerProps {
  project: CanonicalProject;
  activeFileName?: string;
  onSelectFile?: (file: TreeFileItem) => void;
}

export const TreeExplorer: React.FC<TreeExplorerProps> = ({
  project,
  activeFileName,
  onSelectFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>(activeFileName || 'GEMINI.md');
  const [filter, setFilter] = useState<'all' | 'instructions' | 'knowledge'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build full dynamic file tree from project
  const files: TreeFileItem[] = [];

  // Master Prompt(s)
  const masterTitle = project.metadata.source_platform === 'claude' ? 'CLAUDE.md' : 'GEMINI.md';
  files.push({
    name: masterTitle,
    category: 'Master Prompt',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: FileText,
    content: project.persona.raw_system_prompt,
    size: `${(project.persona.raw_system_prompt.length / 1024).toFixed(1)} KB`,
  });

  // Rules
  for (const r of project.rules) {
    files.push({
      name: r.name.startsWith('.agents/rules/') ? r.name : `.agents/rules/${r.name}`,
      category: 'Rule',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: Shield,
      content: r.content,
      size: `${(r.content.length / 1024).toFixed(1)} KB`,
    });
  }

  // Tools
  for (const t of project.tools) {
    files.push({
      name: `tools/${t.name}.json`,
      category: 'Tool Spec',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: Wrench,
      content: JSON.stringify(t, null, 2),
      size: '1.2 KB',
    });
  }

  // Knowledge base files
  for (const k of project.knowledge_base) {
    if (k.filename === masterTitle) continue;
    files.push({
      name: k.filename,
      category: 'Knowledge Doc',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: Database,
      content: k.content_text,
      size: `${(k.size_bytes / 1024).toFixed(1)} KB`,
    });
  }

  useEffect(() => {
    if (activeFileName) {
      setSelectedFile(activeFileName);
    } else if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].name);
    }
  }, [activeFileName]);

  // Global hotkey Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredFiles = files.filter((f) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'instructions'
        ? f.category === 'Master Prompt' || f.category === 'Rule'
        : f.category === 'Knowledge Doc';

    const matchesSearch =
      searchQuery.trim() === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleKeyDownList = (e: React.KeyboardEvent<HTMLDivElement>, currentIdx: number) => {
    if (filteredFiles.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % filteredFiles.length;
      const nextFile = filteredFiles[nextIdx];
      setSelectedFile(nextFile.name);
      if (onSelectFile) onSelectFile(nextFile);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + filteredFiles.length) % filteredFiles.length;
      const prevFile = filteredFiles[prevIdx];
      setSelectedFile(prevFile.name);
      if (onSelectFile) onSelectFile(prevFile);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = filteredFiles[0];
      setSelectedFile(first.name);
      if (onSelectFile) onSelectFile(first);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = filteredFiles[filteredFiles.length - 1];
      setSelectedFile(last.name);
      if (onSelectFile) onSelectFile(last);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const active = filteredFiles[currentIdx];
      if (active && onSelectFile) onSelectFile(active);
    }
  };

  return (
    <nav
      aria-label="Project Structure Tree"
      className="w-full rounded-2xl bg-cardBg border border-borderColor overflow-hidden flex flex-col shadow-xl"
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-borderColor flex flex-col gap-3 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-cyanGlow" aria-hidden="true" />
            <h3 className="text-xs font-bold text-white tracking-wide">
              Project Files ({files.length})
            </h3>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1" role="toolbar" aria-label="Filter by file type">
            {(['all', 'instructions', 'knowledge'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                aria-pressed={filter === mode}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  filter === mode
                    ? 'bg-cyanGlow text-black shadow-neonCyan font-extrabold'
                    : 'text-textMuted hover:text-white hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Fuzzy Search Input */}
        <div className="relative flex items-center">
          <label htmlFor="file-search-input" className="sr-only">
            Search files in project
          </label>
          <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 pointer-events-none" aria-hidden="true" />
          <input
            id="file-search-input"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files... (Ctrl+K)"
            className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-slate-950/70 border border-borderColor text-xs text-white placeholder-textMuted focus:border-cyanGlow focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-2 p-1 text-textMuted hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] text-textMuted font-mono pointer-events-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Screen Reader Status / Match Count */}
        <div className="flex items-center justify-between text-[11px] text-textMuted">
          <span aria-live="polite">
            Showing {filteredFiles.length} of {files.length} files
          </span>
          {searchQuery && (
            <span className="text-cyan-400 text-[10px] font-mono">Filtered by "{searchQuery}"</span>
          )}
        </div>
      </div>

      {/* Files Listbox with Keyboard Navigation */}
      <div
        ref={listRef}
        role="listbox"
        aria-label="Converted files list"
        className="divide-y divide-borderColor max-h-[480px] overflow-y-auto"
      >
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-textMuted text-xs flex flex-col items-center gap-2">
            <Search className="w-6 h-6 opacity-30" />
            <span>No files match "{searchQuery}"</span>
          </div>
        ) : (
          filteredFiles.map((file, idx) => {
            const Icon = file.icon;
            const isSelected = selectedFile === file.name;
            return (
              <div
                key={file.name}
                role="option"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => {
                  setSelectedFile(file.name);
                  if (onSelectFile) onSelectFile(file);
                }}
                onKeyDown={(e) => handleKeyDownList(e, idx)}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-cyanGlow focus-visible:outline-none ${
                  isSelected
                    ? 'bg-cyan-500/15 border-l-4 border-cyanGlow pl-3 font-semibold'
                    : 'hover:bg-slate-900/60 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isSelected ? 'text-cyanGlow animate-pulse' : 'text-textMuted'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-xs font-mono truncate ${
                      isSelected ? 'text-white font-bold' : 'text-slate-300'
                    }`}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${file.badgeClass}`}
                  >
                    {file.category}
                  </span>
                  <span className="text-[10px] text-textMuted font-mono">{file.size}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </nav>
  );
};
