import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, billingCycle, customerEmail, projectName, returnUrl, successUrl } = body;

    if (!plan || !['single', 'pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const checkout = await PolarService.createCheckout({
      plan,
      billingCycle: billingCycle === 'annual' ? 'annual' : 'monthly',
      customerEmail,
      projectName,
      returnUrl,
      successUrl,
    });

    return NextResponse.json(checkout);
  } catch (error: any) {
    console.error('[Polar Checkout API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Polar checkout session' },
      { status: 500 }
    );
  }
}
