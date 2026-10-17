import { PolarService } from '../lib/payments/polarService';
import crypto from 'node:crypto';

async function main() {
  console.log('--- Testing Polar Service ---');
  
  // 1. Single Pass
  const single = await PolarService.createCheckout({
    plan: 'single',
    customerEmail: 'single@promptshift.dev',
  });
  console.log('Single Pass Checkout:', single.checkoutUrl.startsWith('https://polar.sh/checkout/'), single.checkoutId);

  // 2. Pro Developer
  const pro = await PolarService.createCheckout({
    plan: 'pro',
    customerEmail: 'pro@promptshift.dev',
  });
  console.log('Pro Pass Checkout:', pro.checkoutUrl.startsWith('https://polar.sh/checkout/'), pro.checkoutId);

  // 3. Team & Agency
  const team = await PolarService.createCheckout({
    plan: 'team',
    customerEmail: 'team@promptshift.dev',
  });
  console.log('Team Pass Checkout:', team.checkoutUrl.startsWith('https://polar.sh/checkout/'), team.checkoutId);

  // 4. Webhook signature verification test
  const secret = 'whsec_lG1GRADrrY+H9oalyd2MMWbceMpLgJi6KZj3MCtd2Hk=';
  const payload = JSON.stringify({ type: 'order.created', data: { id: 'ord_123' } });
  const id = 'msg_test123';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const toSign = `${id}.${timestamp}.${payload}`;
  const keyBuffer = Buffer.from(secret.slice(6), 'base64');
  const signatureHash = crypto.createHmac('sha256', keyBuffer).update(toSign).digest('base64');
  const signature = `v1,${signatureHash}`;

  const isVerified = PolarService.verifyWebhookSignature(payload, { id, timestamp, signature });
  console.log('Webhook Verification:', isVerified === true ? 'PASSED' : 'FAILED');
}

main();
