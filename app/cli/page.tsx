import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Terminal, Copy, Shield, Cpu, Zap, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PromptShift CLI — Instant In-Terminal AI Project Transpiler (npx promptshift)',
  description:
    'Shift your AI coding rules across Claude, Cursor, OpenAI & Gemini directly from your terminal with 1 command: npx promptshift. 100% In-RAM, zero-retention, 98.5% AST parity.',
  keywords: [
    'npx promptshift',
    'promptshift cli',
    'cursorrules cli',
    'claude code cli rules',
    'transpile ai rules terminal',
    'cursor mdc generator',
  ],
  alternates: {
    canonical: 'https://promptshift.dev/cli',
  },
  openGraph: {
    title: 'PromptShift CLI — Universal In-Terminal AI Transpiler',
    description: '1 command to shift your AI assistant rules across Claude, Cursor, OpenAI & Gemini in terminal: npx promptshift',
    url: 'https://promptshift.dev/cli',
    siteName: 'PromptShift',
    images: [{ url: '/assets/official_logo.jpg', width: 1200, height: 630 }],
  },
};

export default function CliPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptShift CLI',
    operatingSystem: 'Windows, macOS, Linux',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Standalone terminal tool for bidirectional AI assistant instructions transpilation with AST parity.',
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-8 font-mono">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">CLI Tool</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-mono font-medium mb-6">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer-Native Terminal Experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Transpile AI Rules in{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              1 Terminal Command
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            No installation required. Run <code className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">npx promptshift</code> in any repository to automatically detect your AI assistant rules and migrate to Claude, Cursor, OpenAI, or Gemini in milliseconds.
          </p>

          {/* Quick Command Box */}
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 flex items-center justify-between gap-4 font-mono text-sm text-cyan-300">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 select-none">$</span>
              <span>npx promptshift --to=claude</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
              Zero-Install
            </span>
          </div>
        </div>

        {/* Terminal Live Demo Simulation Box */}
        <section className="mb-16">
          <div className="rounded-2xl border border-slate-800 bg-[#0A0D14] overflow-hidden shadow-2xl">
            {/* Window title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs font-mono text-slate-400">bash — terminal@workspace</div>
              <div className="w-12" />
            </div>

            {/* Terminal contents */}
            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto space-y-3">
              <div className="text-slate-400">
                <span className="text-emerald-400">dev@workstation</span>:<span className="text-cyan-400">~/my-saas-project</span>$ npx promptshift
              </div>

              <div className="text-cyan-400 font-bold py-1">
                PromptShift Universal AI Agent Transpiler v1.0.0<br />
                <span className="text-slate-500 font-normal">100% In-RAM • Zero Server Retention • https://promptshift.dev</span>
              </div>

              <div className="text-slate-300">
                <span className="text-slate-400">Ecosystem Analysis:</span><br />
                &nbsp;&nbsp;• Detected Source: <span className="text-cyan-300 font-semibold">CURSOR</span><br />
                &nbsp;&nbsp;• Discovered Rules: <span className="text-cyan-300 font-semibold">4 .mdc rules</span><br />
                &nbsp;&nbsp;• Master Prompt: <span className="text-emerald-400 font-semibold">Found (.cursorrules)</span>
              </div>

              <div className="text-slate-300">
                <span className="text-slate-400">Transpiling: cursor ➔ claude...</span><br />
                &nbsp;&nbsp;✓ <span className="text-emerald-400 font-semibold">AST Semantic Parity:</span> 98.5%<br />
                &nbsp;&nbsp;✓ <span className="text-emerald-400 font-semibold">In-RAM Secret Sanitizer:</span> 1 API key redacted<br />
                &nbsp;&nbsp;✓ <span className="text-emerald-400 font-semibold">Zero-Retention:</span> 100% ephemeral local execution
              </div>

              <div className="text-slate-300">
                <span className="text-slate-400">Generated Target Files:</span><br />
                &nbsp;&nbsp;• <span className="text-cyan-300 font-medium">CLAUDE.md</span> (1,248 bytes)<br />
                &nbsp;&nbsp;• <span className="text-cyan-300 font-medium">claude_project_instructions.xml</span> (1,890 bytes)<br />
                &nbsp;&nbsp;• <span className="text-cyan-300 font-medium">.claude/mcp.json</span> (182 bytes)
              </div>

              <div className="text-emerald-400 font-bold pt-1">
                ✔ Done! Successfully shifted workspace to CLAUDE.
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <Cpu className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Zero Dependencies</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Written in pure modern Node.js. Runs instantaneously via npx with zero external npm dependencies to download.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <Shield className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">In-RAM Secret Sanitizer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automatically scans and redacts exposed OpenAI, Anthropic, AWS, and Stripe tokens before writing any converted rule file.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
            <Zap className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Dry-Run Mode</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded font-mono">--dry-run</code> to preview generated files and parity metrics without touching your disk.
            </p>
          </div>
        </section>

        {/* Options Table */}
        <section className="mb-16 p-8 rounded-2xl border border-slate-800 bg-slate-900/40">
          <h2 className="text-xl font-bold text-white mb-6">CLI Command Flags & Options</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-4">Flag</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">-t, --to</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">Target ecosystem (claude, cursor, openai, gemini)</td>
                  <td className="py-3 px-4 text-slate-400">npx promptshift --to=cursor</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">--dry-run</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">Simulate conversion without writing files to disk</td>
                  <td className="py-3 px-4 text-slate-400">npx promptshift --dry-run</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-cyan-400 font-bold">-h, --help</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">Display help and command syntax</td>
                  <td className="py-3 px-4 text-slate-400">npx promptshift --help</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA to Web App */}
        <div className="text-center p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900/50">
          <h2 className="text-2xl font-bold text-white mb-3">Prefer a Graphical Interface?</h2>
          <p className="text-sm text-slate-300 mb-6 max-w-lg mx-auto">
            Try our browser-based visual workspace with drag-and-drop file trees, side-by-side Monaco code diffs, and 1-click ZIP export.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
          >
            Launch Visual Converter
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05060A] py-8 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PromptShift.dev • Universal AI Project Bridge</div>
          <div className="flex items-center space-x-6">
            <Link href="/terms" className="hover:text-slate-200">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-200">Privacy</Link>
            <Link href="/security" className="hover:text-slate-200">Security</Link>
            <Link href="/cli" className="hover:text-cyan-400 font-semibold">CLI Tool</Link>
            <a href="mailto:contact@promptshift.dev" className="hover:text-cyan-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
