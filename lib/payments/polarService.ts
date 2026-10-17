/**
 * PromptShift — Polar.sh Merchant of Record (MoR) Integration
 * Handles:
 * 1. Checkout session creation via Polar API v1
 * 2. Product ID resolution (Single Pass, Pro Developer, Team & Agency)
 * 3. Webhook signature verification (Standard Webhooks / Svix format)
 */

import crypto from 'node:crypto';

export interface PolarCheckoutRequest {
  plan: 'single' | 'pro' | 'team';
  billingCycle?: 'monthly' | 'annual';
  customerEmail?: string;
  projectName?: string;
  returnUrl?: string;
  successUrl?: string;
}

export interface PolarCheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}

export class PolarService {
  private static getAccessToken(): string {
    return process.env.POLAR_ACCESS_TOKEN || 'polar_oat_bCrvRXLieKhThTzt1Q2TkRaviLKjSVEPPJtDu0wgOm3';
  }

  public static getProductId(plan: 'single' | 'pro' | 'team', cycle: 'monthly' | 'annual' = 'monthly'): string {
    if (cycle === 'annual') {
      switch (plan) {
        case 'pro':
          return process.env.POLAR_PRODUCT_PRO_ANNUAL_ID || process.env.POLAR_PRODUCT_PRO_ID || 'f646306b-cddd-4478-8aba-ec282a93397a';
        case 'team':
          return process.env.POLAR_PRODUCT_TEAM_ANNUAL_ID || process.env.POLAR_PRODUCT_TEAM_ID || '9e8ca309-7881-4d7e-bfb0-6e6eda85505b';
      }
    }
    switch (plan) {
      case 'single':
        return process.env.POLAR_PRODUCT_SINGLE_PASS_ID || '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25';
      case 'pro':
        return process.env.POLAR_PRODUCT_PRO_ID || 'f646306b-cddd-4478-8aba-ec282a93397a';
      case 'team':
        return process.env.POLAR_PRODUCT_TEAM_ID || '9e8ca309-7881-4d7e-bfb0-6e6eda85505b';
      default:
        return '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25';
    }
  }

  public static getPermanentCheckoutLink(plan: 'single' | 'pro' | 'team', cycle: 'monthly' | 'annual' = 'monthly'): string {
    if (cycle === 'annual') {
      switch (plan) {
        case 'pro':
          return process.env.NEXT_PUBLIC_POLAR_PRO_ANNUAL_URL || 'https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a';
        case 'team':
          return process.env.NEXT_PUBLIC_POLAR_TEAM_ANNUAL_URL || 'https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC';
      }
    }
    switch (plan) {
      case 'single':
        return 'https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E';
      case 'pro':
        return 'https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a';
      case 'team':
        return 'https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC';
      default:
        return 'https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E';
    }
  }

  public static async createCheckout(req: PolarCheckoutRequest): Promise<PolarCheckoutResponse> {
    const cycle = req.billingCycle || 'monthly';
    const token = this.getAccessToken();
    const productId = this.getProductId(req.plan, cycle);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptshift.dev';

    const successUrl = req.successUrl || `${appUrl}/?checkout=success&plan=${req.plan}&cycle=${cycle}&checkout_id={CHECKOUT_ID}`;
    const returnUrl = req.returnUrl || `${appUrl}/#pricing`;

    try {
      const response = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          customer_email: req.customerEmail && req.customerEmail.includes('@') ? req.customerEmail : undefined,
          success_url: successUrl,
          return_url: returnUrl,
          metadata: {
            app: 'promptshift',
            plan: req.plan,
            cycle,
            project_name: req.projectName || 'default_project',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Polar API Checkout Error:', response.status, errorText);
        // Fallback to permanent hosted checkout link
        return {
          checkoutUrl: this.getPermanentCheckoutLink(req.plan, cycle),
          checkoutId: `polar_direct_${Date.now()}`,
        };
      }

      const data = await response.json();
      return {
        checkoutUrl: data.url,
        checkoutId: data.id,
      };
    } catch (err) {
      console.error('Polar Checkout Exception:', err);
      return {
        checkoutUrl: this.getPermanentCheckoutLink(req.plan, cycle),
        checkoutId: `polar_err_fallback_${Date.now()}`,
      };
    }
  }

  public static verifyWebhookSignature(
    payload: string,
    headers: { id?: string | null; timestamp?: string | null; signature?: string | null }
  ): boolean {
    const secret = process.env.POLAR_WEBHOOK_SECRET || 'whsec_lG1GRADrrY+H9oalyd2MMWbceMpLgJi6KZj3MCtd2Hk=';
    if (!secret || !headers.id || !headers.timestamp || !headers.signature) {
      return false;
    }

    try {
      let keyBuffer: Buffer;
      if (secret.startsWith('whsec_')) {
        keyBuffer = Buffer.from(secret.slice(6), 'base64');
      } else {
        keyBuffer = Buffer.from(secret, 'utf-8');
      }

      const toSign = `${headers.id}.${headers.timestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', keyBuffer).update(toSign).digest('base64');

      const sigParts = headers.signature.split(' ');
      for (const part of sigParts) {
        const [version, hash] = part.split(',');
        if (version === 'v1' && hash === hmac) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Polar Webhook Signature Verification Error:', err);
      return false;
    }
  }
}
