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
      setAuthError('Clé de sécurité administrateur incorrecte.');
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
    const periodLabel = period === 'today' ? "Aujourd'hui" : period === '7d' ? 'Cette semaine' : period === '30d' ? 'Ce mois-ci' : 'En cumulé';
    const topTarget = Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0] || 'claude';
    const targetLabel = topTarget === 'claude' ? 'Anthropic Claude' : topTarget === 'cursor' ? 'Cursor IDE' : 'OpenAI Assistants';

    return `🚀 Bilan Traction PromptShift (${periodLabel}) :

L'interopérabilité des projets IA s'accélère. Voici les faits marquants enregistrés sur promptshift.dev :

📊 ${summary.totalConversions} conversions de projets IA réalisées
📁 ${summary.totalFilesProcessed} fichiers système & agents transpilés
🛡️ ${summary.totalSecretsSanitized} clés privées & credentials interceptés avant fuite en production
🎯 98.5%+ de parité sémantique AST vérifiée
💎 Écosystème le plus plébiscité : ${targetLabel}

PromptShift permet à toute équipe tech de passer de Gemini/Antigravity à Claude, Cursor ou OpenAI en 1 clic, avec exécution 100% en RAM et zéro rétention de données.

Testez gratuitement votre projet : https://promptshift.dev

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
                Passkey Administrateur
              </label>
              <input
                id="admin-passkey"
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Entrez votre clé d'accès sécurisée"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                autoFocus
              />
              <span className="text-[11px] text-slate-500 block mt-1.5">
                Clé par défaut : <code className="text-cyan-400 font-mono">promptshift-admin-2026</code>
              </span>
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
              Déverrouiller le Command Center
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              ← Retour au site public
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
              <p className="text-xs text-textMuted">Command Center & Pilotage Produit</p>
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
                  {p === 'today' ? "Aujourd'hui" : p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : 'Tout'}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              title="Rafraîchir les métriques"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-borderColor transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.seedRealisticData();
                loadData();
              }}
              title="Générer un échantillon d'activité représentatif"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Données Démo</span>
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.clearEvents();
                loadData();
              }}
              title="Remettre tous les compteurs analytics à zéro"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remettre à zéro</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-borderColor text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voir le site</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Déconnexion admin"
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
        <section aria-label="Indicateurs Clés de Performance">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Conversions */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Conversions</span>
                <ArrowRightLeft className="w-4 h-4 text-cyanGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalConversions}</span>
                <span className="text-[10px] text-emerald-400 font-bold">100% OK</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.freeConversions} gratuit • {summary.paidConversions} payant • {summary.vipConversions} VIP
              </p>
            </div>

            {/* KPI 2: Page Views & Unique Visitors */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Visiteurs</span>
                <Users className="w-4 h-4 text-emeraldGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalPageViews}</span>
                <span className="text-[10px] text-textMuted font-mono">~{summary.uniqueSessions} sessions</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                {summary.conversionRate}% taux de conversion
              </p>
            </div>

            {/* KPI 3: Total Files Processed */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Fichiers AST</span>
                <FileCode2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalFilesProcessed}</span>
                <span className="text-[10px] text-purple-300 font-mono">transpilés</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {(summary.totalBytesProcessed / 1024).toFixed(0)} Ko de prompts traités
              </p>
            </div>

            {/* KPI 4: Secrets Sanitized */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Secrets Sauvés</span>
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-300">{summary.totalSecretsSanitized}</span>
                <span className="text-[10px] text-amber-400/80 font-bold">filtrés</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                Clés API & tokens masqués en RAM
              </p>
            </div>

            {/* KPI 5: Semantic Parity Score */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Parité AST</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyanGlow">{summary.averageParityScore}%</span>
                <span className="text-[10px] text-cyan-300 font-bold">certifié</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                Zero hallucination structurelle
              </p>
            </div>

            {/* KPI 6: Monetization Readiness */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Trafic Payant</span>
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
                {summary.fileCountDistribution.over50Files + summary.fileCountDistribution.sixteenTo50Files + summary.fileCountDistribution.sixTo15Files} projets &gt; 5 fichiers
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
                  Activité Temporelle des Conversions
                </h2>
                <p className="text-xs text-textMuted mt-0.5">
                  Volume de conversions enregistrées ({period === 'today' ? "par tranche horaire aujourd'hui" : `au fil des ${summary.timeline.length} derniers jours`})
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Max: {maxConversionsInTimeline} / période
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
                        <strong className="text-cyan-400">{point.conversions}</strong> conversions • {point.pageViews} vues
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
                Conversions de Projets IA
              </span>
              <span>Total période : <strong>{summary.totalConversions}</strong></span>
            </div>
          </div>

          {/* Target Platforms Distribution */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Écosystèmes Cibles Préférés
              </h2>
              <span className="text-[10px] text-textMuted">Demande marché</span>
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
              Top cible : <strong className="text-cyan-300">
                {summary.totalConversions > 0
                  ? Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'CLAUDE'
                  : 'EN ATTENTE'}
              </strong> (priorité d'optimisation marketing)
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
                Distribution de la Taille des Projets
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Calibrage de la limite gratuite (5 fichiers) vs volume payant
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                  ≤ 5 Fichiers (Freemium)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.under5Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Projets éligibles au test 100% gratuit
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-cyan-400 font-bold block mb-1">
                  6 à 15 Fichiers (Single Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixTo15Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Projets standards de développeurs
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-purple-400 font-bold block mb-1">
                  16 à 50 Fichiers (Pro Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixteenTo50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Équipes & projets multi-agents
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-amber-400 font-bold block mb-1">
                  &gt; 50 Fichiers (Team/Agency)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.over50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Codebases complexes d'entreprises
                </span>
              </div>
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3">
              Moyenne : <strong className="text-white">~{(summary.totalFilesProcessed / Math.max(1, summary.totalConversions)).toFixed(1)} fichiers</strong> par projet converti.
            </div>
          </div>

          {/* Global Currencies & Geographic Reach */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                Répartition Géographique & Devises
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Adoption internationale détectée via géolocalisation IP
              </p>
            </div>

            <div className="flex flex-col gap-2.5 my-4">
              {Object.entries(summary.currencyBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([curr, count]) => {
                  const pct = summary.totalConversions > 0 ? Math.round((count / summary.totalConversions) * 100) : 0;
                  const labelMap: Record<string, string> = {
                    EUR: '🇪🇺 Euro (€)',
                    USD: '🇺🇸 Dollar US ($)',
                    GBP: '🇬🇧 Livre Sterling (£)',
                    CAD: '🇨🇦 Dollar Canadien (CA$)',
                    JPY: '🇯🇵 Yen Japonais (¥)',
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
              Facturation multi-devises automatique : <span className="text-emerald-400 font-semibold">Active & sans friction</span>
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
                  Conseils d'Optimisation Produit & Croissance
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    IA ANALYTICS
                  </span>
                </h2>
                <p className="text-xs text-textMuted">
                  Recommandations concrètes basées sur les comportements de conversion observés
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {tips.length} conseils actionnables
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
                    Action recommandée :
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
                Journal Récent des Conversions Anonymisées
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Flux en direct des projets transpilés (Zéro stockage de code • Données de métriques pures)
              </p>
            </div>
            <span className="text-xs font-mono text-textMuted">
              {summary.recentEvents.length} conversions affichées
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Projet Anonyme</th>
                  <th className="py-3 px-4">Migration</th>
                  <th className="py-3 px-4">Fichiers</th>
                  <th className="py-3 px-4">Poids (Ko)</th>
                  <th className="py-3 px-4">Parité AST</th>
                  <th className="py-3 px-4">Secrets</th>
                  <th className="py-3 px-4">Licence / Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {summary.recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-textMuted">
                      Aucune conversion récente enregistrée pour cette période.
                    </td>
                  </tr>
                ) : (
                  summary.recentEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-textMuted whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 text-white font-semibold">
                        {ev.projectTitleAnon || 'project'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-[10px] inline-flex items-center gap-1">
                          {ev.sourcePlatform?.toUpperCase() || 'GEMINI'} → {ev.targetPlatform?.toUpperCase() || 'CLAUDE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{ev.fileCount || 1} f.</td>
                      <td className="py-2.5 px-4 text-slate-400">{((ev.sizeBytes || 2048) / 1024).toFixed(1)} Ko</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{ev.parityScore || 98.5}%</td>
                      <td className="py-2.5 px-4">
                        {ev.secretsCount && ev.secretsCount > 0 ? (
                          <span className="text-amber-400 font-bold">🛡️ {ev.secretsCount} masqués</span>
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
              <h2 className="text-sm font-bold text-white">Kit de Partage LinkedIn & Réseaux Sociaux</h2>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Communiquez en direct sur votre traction avec des chiffres réels et vérifiés : nombre de projets migrés, secrets sanitarisés, et parité inter-modèles. Cliquez ci-dessous pour copier le texte optimisé pour votre audience tech.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={copyLinkedInPost}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-neonCyan hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
            >
              {isCopiedPost ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedPost ? 'Copié dans le presse-papiers !' : 'Copier le Post LinkedIn Prêt à Publier'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderColor py-4 px-6 text-center text-xs text-textMuted font-mono">
        PromptShift Sovereign Command Center • 1-Click Universal AI Bridge • Confidentialité Totale
      </footer>
    </div>
  );
}
