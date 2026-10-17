'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is PromptShift?',
    answer:
      'PromptShift is a sovereign developer tool that translates entire AI assistant workspaces, instruction files, master prompts, and system rules between Cursor (.cursorrules / .mdc), Anthropic Claude Projects, OpenAI Custom GPTs, and Google Gemini / Antigravity in one click.',
  },
  {
    question: 'Is my source code and proprietary API keys secure?',
    answer:
      'Yes, 100%. PromptShift operates with strict in-RAM processing and zero server data retention. All uploads are processed ephemerally and sanitized in volatile memory to redact leaked credentials (OpenAI, Anthropic, Stripe, AWS, HuggingFace, etc.) before conversion. Nothing is ever saved to a persistent server disk or database.',
  },
  {
    question: 'What are the pricing tiers and payment options?',
    answer:
      'PromptShift offers flexible pricing: Free Starter for small projects (up to 2 files with zero signup), Single Deposit Pass at $1.99 one-time for pay-as-you-go migrations, Pro Developer at $5.99/month for unlimited migrations and CLI sync, and Team & Agency at $19.99/month with CI/CD automation. Payments are processed securely via Polar.sh Merchant of Record with native Apple Pay, Google Pay, Credit/Debit Cards, and SEPA.',
  },
  {
    question: 'Which AI platforms are currently supported?',
    answer:
      'PromptShift supports bidirectional migration between Anthropic Claude (.claude / system instructions), Cursor (.cursorrules / .cursor/rules/*.mdc), OpenAI Custom GPTs / Assistants v2, Google Gemini & Antigravity, and GitHub Copilot Workspace.',
  },
  {
    question: 'Can I convert back and forth without losing rules?',
    answer:
      'Yes! PromptShift uses a unified AST intermediate representation (CAPS) that preserves 98.5%+ certified semantic fidelity. Autonomy directives, tone, architecture policies, and negative constraints are mapped without prompt drift.',
  },
  {
    question: 'Can I cancel my subscription or download official VAT invoices?',
    answer:
      'Yes. Subscriptions can be cancelled anytime with zero hassle directly from your Customer Portal. Official VAT invoices and clean PDF receipts are recorded in your Sovereign Client Vault and available for instant download.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8" aria-label="Frequently Asked Questions">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Everything You Need to Know About PromptShift
        </h2>
        <p className="text-xs sm:text-sm text-textMuted max-w-xl">
          Quick answers to common questions regarding security, format conversions, privacy, and our free beta pass.
        </p>
      </div>

      <div className="divide-y divide-borderColor/70 rounded-3xl border border-borderColor bg-cardBg/90 shadow-xl overflow-hidden backdrop-blur-sm">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors hover:bg-slate-900/40">
              <button
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full py-5 px-6 sm:px-8 flex items-center justify-between text-left gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span className="text-cyan-400 font-mono text-xs">0{idx + 1}.</span>
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-cyan-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="px-6 sm:px-8 pb-5 pt-1 text-xs sm:text-sm text-textMuted leading-relaxed animate-fadeIn">
                  <p className="pl-6 border-l-2 border-cyan-500/40">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
