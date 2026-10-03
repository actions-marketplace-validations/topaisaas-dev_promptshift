'use client';

import React, { useState, useEffect } from 'react';
import { Gift, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { PromoManager } from '@/lib/promo/promoManager';

export const VipPromoBanner: React.FC = () => {
  const [vipCode, setVipCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check URL parameters (?promo=... or ?code=...)
    const urlPromo = PromoManager.checkUrlForPromo();
    if (urlPromo && urlPromo.valid) {
      setVipCode(urlPromo.code);
      setIsVisible(true);
      return;
    }

    // 2. Check if already active in localStorage
    if (PromoManager.isVipActive()) {
      setVipCode(PromoManager.getVipCode() || 'DEVVIP');
      setIsVisible(true);
    }

    // 3. Listen for dynamic promo activation
    const handleVipActivated = (e: Event) => {
      const customEvent = e as CustomEvent<{ code: string }>;
      if (customEvent.detail) {
        setVipCode(customEvent.detail.code);
        setIsVisible(true);
      }
    };

    window.addEventListener('promptshift_vip_activated', handleVipActivated);
    return () => {
      window.removeEventListener('promptshift_vip_activated', handleVipActivated);
    };
  }, []);

  if (!isVisible || !vipCode) return null;

  return (
    <aside
      aria-label="VIP Developer Pass Promotion"
      className="w-full bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-b border-emerald-500/40 px-4 py-2 text-white animate-fadeIn sticky top-0 z-50 shadow-lg backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Gift className="w-3.5 h-3.5" aria-hidden="true" />
            <span>VIP DEV PASS ACTIVE</span>
          </div>

          <span className="font-semibold text-slate-200">
            Welcome, friend! Code <strong className="text-emerald-400 font-mono font-black">{vipCode}</strong> applied.
          </span>

          <span className="hidden md:inline text-textMuted text-[11px]">
            100% Free full repository conversions • Unlimited files • Clean exports unlocked.
          </span>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss VIP announcement"
          className="p-1 rounded-lg text-textMuted hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};
