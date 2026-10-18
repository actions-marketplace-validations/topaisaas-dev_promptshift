import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsPeriod } from '@/lib/analytics/analyticsTypes';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';

// In-RAM event buffer on the server instance
const serverEventsBuffer: AnalyticsEvent[] = [];
const MAX_SERVER_BUFFER = 1000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyticsEvent;
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    // Enrich with server-side metadata
    const enriched: AnalyticsEvent = {
      ...body,
      id: body.id || 'ev_srv_' + Math.random().toString(36).substring(2, 10),
      timestamp: body.timestamp || new Date().toISOString(),
      country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || body.country || 'FR',
    };

    serverEventsBuffer.unshift(enriched);
    if (serverEventsBuffer.length > MAX_SERVER_BUFFER) {
      serverEventsBuffer.splice(MAX_SERVER_BUFFER);
    }

    return NextResponse.json({ ok: true, count: serverEventsBuffer.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as AnalyticsPeriod) || '7d';
    const providedKey = req.headers.get('x-admin-key') || searchParams.get('key');

    // Default admin key fallback if not specified in environment
    const expectedKey = process.env.PROMPTSHIFT_ADMIN_KEY || 'promptshift-admin-2026';

    if (providedKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized. Admin key required.' }, { status: 401 });
    }

    const summary = AnalyticsAggregator.aggregate(serverEventsBuffer, period);
    const tips = AnalyticsAggregator.generateOptimizationTips(summary);

    return NextResponse.json({
      summary,
      tips,
      serverEventsCount: serverEventsBuffer.length,
      events: serverEventsBuffer,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    serverEventsBuffer.length = 0;
    return NextResponse.json({ ok: true, message: 'Server analytics buffer cleared', count: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
