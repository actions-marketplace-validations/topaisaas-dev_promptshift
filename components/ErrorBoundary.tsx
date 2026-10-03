'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PromptShift ErrorBoundary caught crash]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          aria-live="assertive"
          className="w-full max-w-4xl mx-auto my-8 p-8 rounded-3xl bg-cardBg border border-red-500/40 shadow-2xl flex flex-col gap-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {this.props.fallbackTitle || 'Component Execution Shield Activated'}
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                PromptShift isolated a runtime exception in this view to prevent application crash.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-red-900/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400">
              <Terminal className="w-4 h-4" aria-hidden="true" />
              <span>{this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown parsing fault'}</span>
            </div>
            {this.state.error?.stack && (
              <pre className="text-[11px] font-mono text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
              </pre>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs tracking-wide shadow-neonCyan hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-all"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Reset Engine & Recover</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none transition-all"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Reload Page</span>
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
