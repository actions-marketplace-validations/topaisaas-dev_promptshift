/**
 * PromptShift Analytics Tracker — Sovereign Client & Server Telemetry
 * Captures user journey events, persists locally in client vault, and syncs to API.
 * Strictly 100% REAL telemetry with zero synthetic or mock event generation.
 */

import { AnalyticsEvent, PlatformId, TelemetryChannel } from './analyticsTypes';

const STORAGE_KEY = 'promptshift_analytics_events';
const MAX_LOCAL_EVENTS = 500;

export class AnalyticsTracker {
  /**
   * Retrieves or creates a real session ID for the active browser tab
   */
  public static getSessionId(): string {
    if (typeof window === 'undefined') return 'sess_server';
    try {
      let sess = sessionStorage.getItem('promptshift_session_id');
      if (!sess) {
        sess = `ps_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('promptshift_session_id', sess);
      }
      return sess;
    } catch {
      return `ps_sess_ephemeral_${Date.now()}`;
    }
  }

  /**
   * Extracts clean domain from raw HTTP referrer
   */
  public static resolveReferrerDomain(rawReferrer?: string): string {
    if (!rawReferrer || !rawReferrer.trim()) return 'direct';
    const lower = rawReferrer.toLowerCase();
    if (lower.includes('chatgpt.com') || lower.includes('chat.openai.com')) return 'chatgpt.com';
    if (lower.includes('perplexity.ai')) return 'perplexity.ai';
    if (lower.includes('claude.ai')) return 'claude.ai';
    if (lower.includes('google.')) return 'google.com';
    if (lower.includes('t.co') || lower.includes('x.com') || lower.includes('twitter.com')) return 'x.com';
    if (lower.includes('github.com')) return 'github.com';
    if (lower.includes('bing.com')) return 'bing.com';
    try {
      const u = new URL(rawReferrer);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return 'external';
    }
  }

  /**
   * Infers user intent based on landing URL and conversion slug
   */
  public static inferIntent(path: string, pairSlug?: string): string {
    if (pairSlug) {
      const parts = pairSlug.split('-to-');
      if (parts.length === 2) {
        return `Migration ${parts[0].toUpperCase()} ➔ ${parts[1].toUpperCase()}`;
      }
      return `Migration ${pairSlug}`;
    }
    if (path === '/discover') return 'Guide Autorité Formats IA (GEO)';
    if (path === '/cli') return 'Installation CLI npx & MCP';
    if (path === '/privacy' || path === '/security') return 'Audit Sécurité & Zero-Retention';
    if (path === '/terms') return 'Conditions & Licence';
    if (path === '/') return 'Atterrissage Studio Universal';
    return `Navigation ${path}`;
  }

  /**
   * Tracks an arbitrary telemetry event
   */
  public static track(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: 'ev_' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      userAgentSnippet: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : undefined,
      sessionId: event.sessionId || this.getSessionId(),
    };

    // 1. Save locally in Sovereign Analytics store (real data only)
    this.saveLocalEvent(fullEvent);

    // 2. Dispatch custom event for real-time reactivity in admin dashboard if open
    try {
      window.dispatchEvent(new CustomEvent('promptshift_analytics_updated', { detail: fullEvent }));
    } catch {
      // Ignore in non-browser environments
    }

    // 3. Asynchronous fire-and-forget sync to backend API
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      }).catch(() => {
        // Silent catch: network failures should never disrupt developer workflow
      });
    } catch {
      // Ignore
    }
  }

  public static trackPageView(
    pathOrOptions:
      | string
      | {
          path?: string;
          country?: string;
          currency?: string;
          referrer?: string;
          searchParams?: URLSearchParams | Record<string, string>;
        } = '/',
    countryArg?: string,
    currencyArg?: string
  ): void {
    let path = '/';
    let country = countryArg;
    let currency = currencyArg;
    let rawReferrer = typeof document !== 'undefined' ? document.referrer : undefined;
    let utmSource: string | undefined;
    let utmMedium: string | undefined;
    let utmCampaign: string | undefined;
    let utmTerm: string | undefined;

    if (typeof pathOrOptions === 'object' && pathOrOptions !== null) {
      path = pathOrOptions.path || '/';
      country = pathOrOptions.country || country;
      currency = pathOrOptions.currency || currency;
      if (pathOrOptions.referrer !== undefined) {
        rawReferrer = pathOrOptions.referrer;
      }
      if (pathOrOptions.searchParams) {
        if (pathOrOptions.searchParams instanceof URLSearchParams) {
          utmSource = pathOrOptions.searchParams.get('utm_source') || undefined;
          utmMedium = pathOrOptions.searchParams.get('utm_medium') || undefined;
          utmCampaign = pathOrOptions.searchParams.get('utm_campaign') || undefined;
          utmTerm = pathOrOptions.searchParams.get('utm_term') || pathOrOptions.searchParams.get('q') || undefined;
        } else {
          utmSource = pathOrOptions.searchParams.utm_source;
          utmMedium = pathOrOptions.searchParams.utm_medium;
          utmCampaign = pathOrOptions.searchParams.utm_campaign;
          utmTerm = pathOrOptions.searchParams.utm_term || pathOrOptions.searchParams.q;
        }
      }
    } else if (typeof pathOrOptions === 'string') {
      path = pathOrOptions;
    }

    if (typeof window !== 'undefined' && !utmSource) {
      try {
        const sp = new URLSearchParams(window.location.search);
        utmSource = sp.get('utm_source') || undefined;
        utmMedium = sp.get('utm_medium') || undefined;
        utmCampaign = sp.get('utm_campaign') || undefined;
        utmTerm = sp.get('utm_term') || sp.get('q') || undefined;
      } catch {
        // ignore
      }
    }

    const referrerDomain = this.resolveReferrerDomain(rawReferrer);
    const pairMatch = path.match(/^\/convert\/([a-z0-9-]+)$/i);
    const pairSlug = pairMatch ? pairMatch[1].toLowerCase() : undefined;

    let channel: TelemetryChannel = 'web';
    if (referrerDomain.includes('chatgpt') || referrerDomain.includes('perplexity') || referrerDomain.includes('claude')) {
      channel = 'llmo';
    } else if (referrerDomain.includes('x.com')) {
      channel = 'x_social';
    } else if (pairSlug) {
      channel = 'pseo';
    } else if (path.startsWith('/cli')) {
      channel = 'cli';
    }

    const inferredIntent = this.inferIntent(path, pairSlug);
    const sessionId = this.getSessionId();

    this.track({
      type: 'page_view',
      path,
      pairSlug,
      channel,
      country,
      currency: currency || 'USD',
      sessionId,
      referrer: rawReferrer || undefined,
      referrerDomain,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      inferredIntent,
    });
  }

  public static trackProjectUpload(meta: {
    projectTitle: string;
    fileCount: number;
    sizeBytes: number;
    sourcePlatform: PlatformId;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'project_upload',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sizeBytes: meta.sizeBytes,
      sourcePlatform: meta.sourcePlatform,
    });
  }

  public static trackPaywallHit(meta: {
    projectTitle: string;
    fileCount: number;
    sourcePlatform: PlatformId;
    targetPlatform: PlatformId;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'paywall_hit',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sourcePlatform: meta.sourcePlatform,
      targetPlatform: meta.targetPlatform,
      planTier: 'single',
    });
  }

  public static trackConversion(meta: {
    projectTitle: string;
    sourcePlatform: PlatformId;
    targetPlatform: PlatformId;
    fileCount: number;
    sizeBytes: number;
    parityScore: number;
    isFreeTier: boolean;
    planTier: 'free' | 'single' | 'pro' | 'team' | 'vip';
    promoCode?: string;
    currency?: string;
    durationMs?: number;
    secretsCount?: number;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'conversion_completed',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      sourcePlatform: meta.sourcePlatform,
      targetPlatform: meta.targetPlatform,
      fileCount: meta.fileCount,
      sizeBytes: meta.sizeBytes,
      parityScore: meta.parityScore,
      isFreeTier: meta.isFreeTier,
      planTier: meta.planTier,
      promoCode: meta.promoCode,
      currency: meta.currency || 'USD',
      durationMs: meta.durationMs,
      secretsCount: meta.secretsCount,
    });
  }

  public static trackCheckout(
    planTier: 'single' | 'pro' | 'team',
    amount?: string,
    currency?: string,
    pairSlug?: string
  ): void {
    const numericAmount = amount ? Number.parseFloat(amount) : planTier === 'single' ? 1.99 : planTier === 'pro' ? 5.99 : 19.99;
    this.track({
      type: 'checkout_initiated',
      channel: pairSlug ? 'pseo' : 'web',
      pairSlug,
      planTier,
      amountUsd: Number.isFinite(numericAmount) ? numericAmount : 1.99,
      currency: currency || 'USD',
    });
  }

  public static trackPromo(promoCode: string, discountPercent: number): void {
    this.track({
      type: 'promo_applied',
      channel: 'web',
      promoCode,
      planTier: discountPercent === 100 ? 'vip' : 'pro',
    });
  }

  public static trackInvoiceDownload(invoiceNumber: string, planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'invoice_downloaded',
      channel: 'web',
      projectTitleAnon: invoiceNumber,
      planTier,
    });
  }

  public static trackCliTokenCopied(planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'cli_token_copied',
      channel: 'cli',
      planTier,
    });
  }

  /**
   * Retrieves all stored analytics events from local sovereign store (real events only)
   */
  public static getEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Purge any legacy synthetic demo seeds to guarantee 100% ground-truth
      const realOnly = parsed.filter(
        (e: AnalyticsEvent) => e && e.id && !e.id.startsWith('ev_pv_') && !e.id.startsWith('ev_conv_')
      );
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
      }
      return realOnly;
    } catch {
      return [];
    }
  }

  public static clearEvents(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('promptshift_analytics_updated'));
      fetch('/api/analytics', { method: 'DELETE' }).catch(() => {});
    } catch {
      // Ignore
    }
  }

  /**
   * Purges any legacy synthetic demo events from local browser storage
   */
  public static purgeSyntheticData(): void {
    if (typeof window === 'undefined') return;
    const realOnly = this.getEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
    window.dispatchEvent(new CustomEvent('promptshift_analytics_updated'));
  }

  private static saveLocalEvent(event: AnalyticsEvent): void {
    try {
      const existing = this.getEvents();
      existing.unshift(event);
      if (existing.length > MAX_LOCAL_EVENTS) {
        existing.splice(MAX_LOCAL_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Local storage quota exceeded or disabled
    }
  }

  private static anonymizeTitle(rawTitle: string): string {
    if (!rawTitle) return 'ai-agent-bundle';
    const clean = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (clean.length <= 4) return clean;
    return clean.substring(0, 14);
  }
}
