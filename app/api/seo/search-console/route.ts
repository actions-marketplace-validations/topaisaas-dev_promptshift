import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleSearchConsoleService } from '@/lib/seo/googleSearchConsole';

export async function GET(request: NextRequest) {
  const credentials = GoogleSearchConsoleService.getCredentials();

  if (!credentials) {
    return NextResponse.json({
      configured: false,
      message: 'Google Search Console Service Account is not configured in environment variables.',
      instructions: [
        '1. Créez une clé de compte de service Google Cloud (rôle Propriétaire ou Utilisateur Search Console).',
        '2. Ajoutez GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY dans .env.local',
        '3. Ajoutez l\'adresse du compte de service dans Search Console > Paramètres > Utilisateurs et autorisations.',
      ],
    });
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const rows = await GoogleSearchConsoleService.querySearchAnalytics('https://promptshift.dev', {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      dimensions: ['query'],
      rowLimit: 15,
    });

    return NextResponse.json({
      configured: true,
      serviceAccount: credentials.clientEmail,
      queries: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: true,
        error: error.message || 'Failed to fetch Search Analytics',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, url } = body;

    if (action === 'submit-sitemap') {
      const result = await GoogleSearchConsoleService.submitSitemap();
      return NextResponse.json(result);
    }

    if (action === 'index-url') {
      const targetUrl = url || 'https://promptshift.dev';
      const result = await GoogleSearchConsoleService.requestUrlIndexing(targetUrl);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}. Expected 'submit-sitemap' or 'index-url'.` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
