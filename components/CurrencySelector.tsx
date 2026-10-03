'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { CurrencyManager, CURRENCIES, SupportedCurrency } from '@/lib/currency/currencyManager';

export const CurrencySelector: React.FC = () => {
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(CurrencyManager.getActiveCurrency());

    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) {
        setCurrency(customEvent.detail);
      }
    };

    window.addEventListener('promptshift_currency_changed', handleCurrencyChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('promptshift_currency_changed', handleCurrencyChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (code: SupportedCurrency) => {
    CurrencyManager.setCurrency(code);
    setCurrency(code);
    setIsOpen(false);
  };

  const currentConfig = CURRENCIES[currency] || CURRENCIES.USD;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select display currency (current: ${currentConfig.code} ${currentConfig.symbol})`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all shadow-sm"
      >
        <span className="text-sm leading-none" aria-hidden="true">{currentConfig.flag}</span>
        <span className="font-mono font-bold">{currentConfig.code}</span>
        <span className="text-cyan-400 font-extrabold">{currentConfig.symbol}</span>
        <ChevronDown className="w-3 h-3 text-textMuted ml-0.5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available currencies"
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-cardBg border border-borderColor shadow-2xl p-1.5 z-50 animate-fadeIn flex flex-col gap-1 backdrop-blur-xl"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-textMuted uppercase tracking-wider border-b border-borderColor">
            Localized Currency
          </div>

          {(Object.keys(CURRENCIES) as SupportedCurrency[]).map((code) => {
            const conf = CURRENCIES[code];
            const isSelected = code === currency;

            return (
              <button
                key={code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(code)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">{conf.flag}</span>
                  <div className="flex flex-col text-left">
                    <span className="font-bold">{conf.code} ({conf.symbol})</span>
                    <span className="text-[10px] text-textMuted">{conf.name}</span>
                  </div>
                </div>

                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
