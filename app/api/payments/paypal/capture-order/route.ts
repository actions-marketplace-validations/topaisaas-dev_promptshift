import { NextResponse } from 'next/server';
import { PayPalService } from '@/lib/payments/paypalService';

export async function POST(req: Request) {
  try {
    const { orderID } = await req.json();
    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    const captureData = await PayPalService.captureOrder(orderID);
    return NextResponse.json({ success: true, capture: captureData });
  } catch (error: any) {
    console.error('PayPal Capture Error:', error);
    return NextResponse.json({ error: error.message || 'Capture failed' }, { status: 500 });
  }
}
