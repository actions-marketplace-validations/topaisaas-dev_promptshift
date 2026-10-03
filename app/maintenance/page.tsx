'use client';

import React from 'react';
import { Hammer, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 selection:bg-cyanGlow/20 selection:text-cyanGlow">
      <div className="w-full max-w-xl bg-cardBg/90 border border-borderColor rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center gap-6">
        {/* Glowing Top Ambient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400" />

        {/* Logo / Maintenance Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl overflow-hidden border border-cyanGlow/40 shadow-neonCyan">
            <img
              src="/assets/official_logo.jpg"
              alt="PromptShift Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center backdrop-blur-md">
            <Hammer className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Scheduled Maintenance
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Offline Mode Active
          </span>
        </div>

        {/* Headline & Description */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            We are upgrading PromptShift
          </h1>
          <p className="text-sm text-textMuted leading-relaxed max-w-md mx-auto">
            The platform is temporarily offline while we perform scheduled system enhancements, security optimizations, and engine calibrations.
          </p>
        </div>

        {/* Status Box */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs flex flex-col gap-2.5 font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Status:</span>
            </span>
            <span className="text-amber-400 font-bold">Temporarily Paused</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>User Data:</span>
            </span>
            <span className="text-emerald-400 font-bold">100% In-RAM • Zero Server Storage</span>
          </div>
        </div>

        {/* Reassurance */}
        <p className="text-xs text-textMuted/80">
          All services will resume automatically once updates are finalized. Thank you for your patience!
        </p>

        {/* Reload button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer hover:border-cyan-400"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check if Online</span>
        </button>
      </div>
    </div>
  );
}
