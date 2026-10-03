/**
 * PromptShift Analytics Engine — Type Definitions
 * Complete privacy-first, zero-retention telemetry schema for product intelligence.
 */

export type PlatformId = 'gemini' | 'claude' | 'cursor' | 'openai' | 'antigravity' | string;

export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'all';

export type EventType =
  | 'page_view'
  | 'project_upload'
  | 'conversion_completed'
  | 'checkout_initiated'
  | 'payment_completed'
  | 'promo_applied'
  | 'invoice_downloaded'
  | 'cli_token_copied'
  | 'target_selected';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO 8601
  sourcePlatform?: PlatformId;
  targetPlatform?: PlatformId;
  projectTitleAnon?: string;
  fileCount?: number;
  sizeBytes?: number;
  parityScore?: number;
  isFreeTier?: boolean;
  planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip';
  promoCode?: string;
  currency?: string;
  durationMs?: number;
  secretsCount?: number;
  country?: string;
  userAgentSnippet?: string;
}

export interface MetricSummary {
  period: AnalyticsPeriod;
  totalPageViews: number;
  uniqueSessions: number;
  totalConversions: number;
  freeConversions: number;
  paidConversions: number;
  vipConversions: number;
  conversionRate: number; // percentage
  totalFilesProcessed: number;
  totalBytesProcessed: number;
  averageParityScore: number;
  totalSecretsSanitized: number;
  targetPlatformShare: Record<string, number>;
  sourcePlatformShare: Record<string, number>;
  fileCountDistribution: {
    under5Files: number; // Freemium range
    sixTo15Files: number;
    sixteenTo50Files: number;
    over50Files: number;
  };
  sizeDistribution: {
    under50KB: number;
    fiftyTo250KB: number;
    twoFiftyKBToOneMB: number;
    overOneMB: number;
  };
  currencyBreakdown: Record<string, number>;
  recentEvents: AnalyticsEvent[];
  timeline: {
    label: string;
    conversions: number;
    pageViews: number;
  }[];
}

export interface ProductOptimizationTip {
  id: string;
  category: 'growth' | 'pricing' | 'ux' | 'security' | 'marketing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'critical';
  metricGrounding: string;
  actionableStep: string;
}
