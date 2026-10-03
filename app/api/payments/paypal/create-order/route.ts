import { NextResponse } from 'next/server';
import { PayPalService } from '@/lib/payments/paypalService';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount || '1.99';
    const currency = body.currency || 'USD';
    const order = await PayPalService.createOrder(amount, currency);
    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error('PayPal Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
