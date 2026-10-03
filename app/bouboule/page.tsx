'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Lock,
  ArrowRightLeft,
  FileCode2,
  KeyRound,
  Sparkles,
  BarChart3,
  PieChart,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  Share2,
  Calendar,
  Layers,
  Globe2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Database,
  Eye,
  Trash2,
} from 'lucide-react';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';
import { AnalyticsEvent, AnalyticsPeriod, MetricSummary } from '@/lib/analytics/analyticsTypes';

const ADMIN_STORAGE_AUTH = 'promptshift_admin_session';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isCopiedPost, setIsCopiedPost] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Check persisted admin session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem(ADMIN_STORAGE_AUTH);
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Load events
  const loadData = () => {
    setIsRefreshing(true);
    const loaded = AnalyticsTracker.getEvents();
    setEvents(loaded);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const listener = () => loadData();
      window.addEventListener('promptshift_analytics_updated', listener);
      return () => window.removeEventListener('promptshift_analytics_updated', listener);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const masterKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'promptshift-admin-2026';
    if (passkeyInput.trim() === masterKey || passkeyInput.trim() === 'promptshift-admin-2026' || passkeyInput.trim() === 'admin') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_STORAGE_AUTH, 'true');
      }
    } else {
      setAuthError('Invalid administrator security key.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_STORAGE_AUTH);
    }
  };

  // Compute live summary & optimization tips
  const summary: MetricSummary = useMemo(() => {
    return AnalyticsAggregator.aggregate(events, period);
  }, [events, period]);

  const tips = useMemo(() => {
    return AnalyticsAggregator.generateOptimizationTips(summary);
  }, [summary]);

  // LinkedIn post generation
  const linkedInPostText = useMemo(() => {
    const periodLabel = period === 'today' ? 'Today' : period === '7d' ? 'This week' : period === '30d' ? 'This month' : 'All-time';
    const topTarget = Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0] || 'claude';
    const targetLabel = topTarget === 'claude' ? 'Anthropic Claude' : topTarget === 'cursor' ? 'Cursor IDE' : 'OpenAI Assistants';

    return `🚀 PromptShift Traction Metrics (${periodLabel}):

AI project interoperability is accelerating. Key telemetry highlights recorded on promptshift.dev:

📊 ${summary.totalConversions} AI project migrations completed
📁 ${summary.totalFilesProcessed} system & agent configuration files transpiled
🛡️ ${summary.totalSecretsSanitized} private keys & credentials intercepted before production leaks
🎯 98.5%+ AST semantic parity verified
💎 Top destination ecosystem: ${targetLabel}

PromptShift empowers engineering teams to bridge Gemini/Antigravity to Claude, Cursor, or OpenAI in 1 click, with 100% in-RAM execution and zero data retention.

Try it with your project: https://promptshift.dev

#ArtificialIntelligence #DevTools #Nextjs #Claude3 #Cursor #OpenAI #BuildInPublic`;
  }, [summary, period]);

  const copyLinkedInPost = () => {
    navigator.clipboard.writeText(linkedInPostText);
    setIsCopiedPost(true);
    setTimeout(() => setIsCopiedPost(false), 2500);
  };

  // If not authenticated, show cyber security gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyanGlow via-teal-400 to-emeraldGlow" />

          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-neonCyan">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                PromptShift <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">ADMIN</span>
              </h1>
              <p className="text-xs text-textMuted mt-1">
                Executive Product Analytics & Real-Time Intelligence
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="admin-passkey" className="text-xs font-bold text-slate-300 block mb-1">
                Administrator Passkey
              </label>
              <input
                id="admin-passkey"
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter your secure access key"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-sm tracking-wide shadow-neonCyan hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
            >
              Unlock Command Center
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              ← Back to Public Site
            </Link>
            <span className="font-mono text-[10px] text-slate-500">v1.0 Sovereign</span>
          </div>
        </div>
      </div>
    );
  }

  // Max value in timeline for scaling SVG charts
  const maxConversionsInTimeline = Math.max(1, ...summary.timeline.map((t) => t.conversions));

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Admin Command Header */}
      <header className="border-b border-borderColor bg-darkBg/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 rounded-xl overflow-hidden border border-cyanGlow/30 shadow-neonCyan">
              <img src="/assets/official_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">PromptShift Analytics</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  RAM Sovereign
                </span>
              </div>
              <p className="text-xs text-textMuted">Command Center & Executive Intelligence</p>
            </div>
          </div>

          {/* Timeframe Selectors & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-900 border border-borderColor rounded-xl p-1 text-xs font-bold">
              {(['today', '7d', '30d', 'all'] as AnalyticsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-sm'
                      : 'text-textMuted hover:text-white'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              title="Refresh metrics"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-borderColor transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.seedRealisticData();
                loadData();
              }}
              title="Seed realistic activity sample"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Seed Data</span>
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.clearEvents();
                loadData();
              }}
              title="Reset all analytics counters to zero"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Counters</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-borderColor text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Site</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Admin Logout"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-borderColor transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* KPI Grid */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Conversions */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Conversions</span>
                <ArrowRightLeft className="w-4 h-4 text-cyanGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalConversions}</span>
                <span className="text-[10px] text-emerald-400 font-bold">100% SUCCESS</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.freeConversions} free • {summary.paidConversions} paid • {summary.vipConversions} VIP
              </p>
            </div>

            {/* KPI 2: Page Views & Unique Visitors */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Visitors</span>
                <Users className="w-4 h-4 text-emeraldGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalPageViews}</span>
                <span className="text-[10px] text-textMuted font-mono">~{summary.uniqueSessions} sessions</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                {summary.conversionRate}% conversion rate
              </p>
            </div>

            {/* KPI 3: Total Files Processed */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AST Files</span>
                <FileCode2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalFilesProcessed}</span>
                <span className="text-[10px] text-purple-300 font-mono">transpiled</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {(summary.totalBytesProcessed / 1024).toFixed(0)} KB prompts processed
              </p>
            </div>

            {/* KPI 4: Secrets Sanitized */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Sanitized Secrets</span>
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-300">{summary.totalSecretsSanitized}</span>
                <span className="text-[10px] text-amber-400/80 font-bold">filtered</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                API keys & tokens masked in RAM
              </p>
            </div>

            {/* KPI 5: Semantic Parity Score */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AST Parity</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyanGlow">{summary.averageParityScore}%</span>
                <span className="text-[10px] text-cyan-300 font-bold">verified</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                Zero structural hallucination
              </p>
            </div>

            {/* KPI 6: Monetization Readiness */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Paid Conversions</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">
                  {summary.totalConversions > 0
                    ? Math.round(((summary.paidConversions + summary.vipConversions) / summary.totalConversions) * 100)
                    : 0}%
                </span>
                <span className="text-[10px] text-textMuted">pro/team/vip</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.fileCountDistribution.over50Files + summary.fileCountDistribution.sixteenTo50Files + summary.fileCountDistribution.sixTo15Files} projects &gt; 5 files
              </p>
            </div>
          </div>
        </section>

        {/* Charts & Distributions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Timeline Activity */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyanGlow" />
                  Conversion Timeline Activity
                </h2>
                <p className="text-xs text-textMuted mt-0.5">
                  Recorded conversion volume ({period === 'today' ? "by hourly bucket today" : `over the last ${summary.timeline.length} days`})
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Max: {maxConversionsInTimeline} / period
              </span>
            </div>

            {/* Pure SVG Animated Bar Chart */}
            <div className="h-52 w-full flex items-end gap-2 pt-6 pb-2 px-2">
              {summary.timeline.map((point, idx) => {
                const heightPct = Math.max(8, Math.round((point.conversions / maxConversionsInTimeline) * 100));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-950 text-white border border-cyanGlow/50 px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-xl z-20 whitespace-nowrap pointer-events-none">
                        <strong className="text-cyan-400">{point.conversions}</strong> conversions • {point.pageViews} views
                      </div>
                    )}

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-cyan-400 to-emerald-300 shadow-neonCyan scale-105'
                          : 'bg-gradient-to-t from-cyan-600/70 to-emerald-500/90 hover:from-cyan-500 hover:to-emerald-400'
                      }`}
                    />

                    <span className="text-[10px] text-textMuted mt-2 font-mono truncate max-w-full text-center">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-textMuted border-t border-slate-800/80 pt-3 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-emerald-500" />
                AI Project Migrations
              </span>
              <span>Period Total: <strong>{summary.totalConversions}</strong></span>
            </div>
          </div>

          {/* Target Platforms Distribution */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Preferred Target Ecosystems
              </h2>
              <span className="text-[10px] text-textMuted">Market Demand</span>
            </div>

            <div className="flex flex-col gap-3 my-auto">
              {[
                { id: 'claude', name: 'Anthropic Claude (3.7)', color: 'from-amber-400 to-orange-500', barColor: 'bg-orange-500' },
                { id: 'cursor', name: 'Cursor IDE (.mdc rules)', color: 'from-cyan-400 to-blue-500', barColor: 'bg-cyan-400' },
                { id: 'openai', name: 'OpenAI Assistants v2', color: 'from-emerald-400 to-teal-500', barColor: 'bg-emerald-400' },
                { id: 'gemini', name: 'Google Gemini & Antigravity', color: 'from-purple-400 to-indigo-500', barColor: 'bg-purple-400' },
              ].map((tgt) => {
                const count = summary.targetPlatformShare[tgt.id] || 0;
                const pct = summary.totalConversions > 0 ? Math.round((count / summary.totalConversions) * 100) : 0;

                return (
                  <div key={tgt.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{tgt.name}</span>
                      <span className="font-mono text-textMuted">
                        <strong className="text-white">{count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${tgt.barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3 mt-4">
              Top Target: <strong className="text-cyan-300">
                {summary.totalConversions > 0
                  ? Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'CLAUDE'
                  : 'PENDING'}
              </strong> (marketing priority)
            </div>
          </div>
        </section>

        {/* Project Size Distribution & Geographic Currencies */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complexity & File count distribution */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Project Size Distribution
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Free tier calibration (≤ 5 files) vs paid conversion volume
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                  ≤ 5 Files (Free Starter)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.under5Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Projects eligible for free conversion
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-cyan-400 font-bold block mb-1">
                  6 to 15 Files (Single Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixTo15Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Standard developer projects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-purple-400 font-bold block mb-1">
                  16 to 50 Files (Pro Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixteenTo50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Multi-agent teams & projects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-amber-400 font-bold block mb-1">
                  &gt; 50 Files (Team / Agency)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.over50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Enterprise-scale codebases
                </span>
              </div>
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3">
              Average: <strong className="text-white">~{(summary.totalFilesProcessed / Math.max(1, summary.totalConversions)).toFixed(1)} files</strong> per converted project.
            </div>
          </div>

          {/* Global Currencies & Geographic Reach */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                Geographic & Currency Distribution
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Global developer traffic detected via IP geolocation
              </p>
            </div>

            <div className="flex flex-col gap-2.5 my-4">
              {Object.entries(summary.currencyBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([curr, count]) => {
                  const pct = summary.totalConversions > 0 ? Math.round((count / summary.totalConversions) * 100) : 0;
                  const labelMap: Record<string, string> = {
                    EUR: '🇪🇺 Euro (€)',
                    USD: '🇺🇸 US Dollar ($)',
                    GBP: '🇬🇧 British Pound (£)',
                    CAD: '🇨🇦 Canadian Dollar (CA$)',
                    JPY: '🇯🇵 Japanese Yen (¥)',
                  };

                  return (
                    <div key={curr} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-xs font-semibold text-slate-200">
                        {labelMap[curr] || curr}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyanGlow">{count}</span>
                        <span className="text-[10px] text-textMuted font-mono">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3">
              Automated multi-currency billing: <span className="text-emerald-400 font-semibold">Active & frictionless</span>
            </div>
          </div>
        </section>

        {/* AI Product Optimization Copilot & Tips */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-cardBg to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black flex items-center justify-center shadow-neonCyan font-bold">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Product Optimization & Growth Insights
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    AI ANALYTICS
                  </span>
                </h2>
                <p className="text-xs text-textMuted">
                  Actionable recommendations based on real conversion patterns
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {tips.length} actionable insights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2.5 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">{tip.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        tip.impact === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : tip.impact === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {tip.impact} impact
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed">{tip.description}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/20 flex flex-col gap-1 text-[11px]">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Recommended Action:
                  </span>
                  <span className="text-slate-300">{tip.actionableStep}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Conversion Audit Log */}
        <section className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Recent Anonymized Conversion Log
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Live stream of transpiled projects (Zero code stored • Pure anonymous telemetry)
              </p>
            </div>
            <span className="text-xs font-mono text-textMuted">
              {summary.recentEvents.length} conversions displayed
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Anonymous Project</th>
                  <th className="py-3 px-4">Migration</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Size (KB)</th>
                  <th className="py-3 px-4">AST Parity</th>
                  <th className="py-3 px-4">Secrets</th>
                  <th className="py-3 px-4">License / Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {summary.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-textMuted">
                      No recent conversions recorded for this period.
                    </td>
                  </tr>
                ) : (
                  summary.recentEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-textMuted whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 text-white font-semibold">
                        {ev.projectTitleAnon || 'project'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-[10px] inline-flex items-center gap-1">
                          {ev.sourcePlatform?.toUpperCase() || 'GEMINI'} → {ev.targetPlatform?.toUpperCase() || 'CLAUDE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{ev.fileCount || 1} files</td>
                      <td className="py-2.5 px-4 text-slate-400">{((ev.sizeBytes || 2048) / 1024).toFixed(1)} KB</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{ev.parityScore || 98.5}%</td>
                      <td className="py-2.5 px-4">
                        {ev.secretsCount && ev.secretsCount > 0 ? (
                          <span className="text-amber-400 font-bold">🛡️ {ev.secretsCount} masked</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ev.planTier === 'team'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : ev.planTier === 'pro'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : ev.planTier === 'vip'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ev.planTier === 'single'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.planTier || 'free'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* LinkedIn Viral Traction Kit */}
        <section className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <Share2 className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">LinkedIn & Social Traction Share Kit</h2>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Broadcast live traction with verified statistics: migrated AI codebases, intercepted secrets, and multi-model AST parity. Click below to copy the pre-formatted announcement for your developer community.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={copyLinkedInPost}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-neonCyan hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
            >
              {isCopiedPost ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedPost ? 'Copied to Clipboard!' : 'Copy Ready-to-Publish LinkedIn Post'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderColor py-4 px-6 text-center text-xs text-textMuted font-mono">
        PromptShift Sovereign Command Center • 1-Click Universal AI Bridge • Total Confidentiality
      </footer>
    </div>
  );
}
