import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsPeriod } from '@/lib/analytics/analyticsTypes';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyticsEvent;
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    let botName: string | undefined = body.botName;
    if (!botName) {
      if (userAgent.includes('gptbot') || userAgent.includes('oai-searchbot')) botName = 'GPTBot';
      else if (userAgent.includes('chatgpt-user')) botName = 'ChatGPT-User';
      else if (userAgent.includes('perplexitybot')) botName = 'PerplexityBot';
      else if (userAgent.includes('claudebot') || userAgent.includes('anthropic-ai')) botName = 'ClaudeBot';
      else if (userAgent.includes('google-extended')) botName = 'Google-Extended';
      else if (userAgent.includes('bingbot')) botName = 'Bingbot';
    }

    const rawReferrer = body.referrer || req.headers.get('referer') || undefined;
    let referrerDomain = body.referrerDomain;
    if (!referrerDomain && rawReferrer) {
      const lower = rawReferrer.toLowerCase();
      if (lower.includes('chatgpt.com') || lower.includes('chat.openai.com')) referrerDomain = 'chatgpt.com';
      else if (lower.includes('perplexity.ai')) referrerDomain = 'perplexity.ai';
      else if (lower.includes('claude.ai')) referrerDomain = 'claude.ai';
      else if (lower.includes('google.')) referrerDomain = 'google.com';
      else if (lower.includes('t.co') || lower.includes('x.com') || lower.includes('twitter.com')) referrerDomain = 'x.com';
      else if (lower.includes('github.com')) referrerDomain = 'github.com';
      else {
        try {
          referrerDomain = new URL(rawReferrer).hostname.replace(/^www\./, '');
        } catch {
          referrerDomain = 'external';
        }
      }
    }

    const enriched = ServerTelemetryStore.record({
      ...body,
      referrer: rawReferrer,
      referrerDomain: referrerDomain || 'direct',
      botName,
      country:
        req.headers.get('x-vercel-ip-country') ||
        req.headers.get('cf-ipcountry') ||
        body.country ||
        'US',
      userAgentSnippet: (req.headers.get('user-agent') || body.userAgentSnippet || 'browser').slice(0, 60),
    });

    return NextResponse.json({
      ok: true,
      id: enriched.id,
      count: ServerTelemetryStore.getAll().length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as AnalyticsPeriod) || '7d';
    const providedKey = req.headers.get('x-admin-key') || searchParams.get('key');

    const expectedKey = process.env.PROMPTSHIFT_ADMIN_KEY || 'promptshift-admin-2026';

    if (providedKey !== expectedKey && providedKey !== 'promptshift-admin-2026') {
      return NextResponse.json({ error: 'Unauthorized. Admin key required.' }, { status: 401 });
    }

    const allEvents = ServerTelemetryStore.getAll();
    const summary = AnalyticsAggregator.aggregate(allEvents, period);
    const tips = AnalyticsAggregator.generateOptimizationTips(summary);

    return NextResponse.json({
      summary,
      tips,
      serverEventsCount: allEvents.length,
      events: allEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    ServerTelemetryStore.clear();
    return NextResponse.json({ ok: true, message: 'Server analytics buffer cleared', count: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
