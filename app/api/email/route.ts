import { NextRequest, NextResponse } from 'next/server';
import { EmailDispatcher, SendEmailPayload } from '@/lib/email/emailDispatcher';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendEmailPayload;

    if (!body || !body.email || !body.action) {
      return NextResponse.json(
        { error: 'Missing required parameters: email and action are mandatory.' },
        { status: 400 }
      );
    }

    const result = await EmailDispatcher.dispatch(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/email] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
