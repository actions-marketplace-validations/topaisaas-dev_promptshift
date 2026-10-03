/**
 * PayPal REST API v2 Service
 * Handles OAuth2 bearer tokens, order creation, and order capture.
 */

export class PayPalService {
  private static resolvedMode: 'live' | 'sandbox' = (process.env.PAYPAL_MODE as 'live' | 'sandbox') || 'sandbox';

  private static getBaseUrl(mode?: 'live' | 'sandbox'): string {
    const activeMode = mode || this.resolvedMode || (process.env.PAYPAL_MODE as 'live' | 'sandbox') || 'sandbox';
    return activeMode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private static async getAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials missing from environment.');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const configuredMode = (process.env.PAYPAL_MODE as 'live' | 'sandbox') || 'sandbox';

    // 1. Try primary configured mode
    let response = await fetch(`${this.getBaseUrl(configuredMode)}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (response.ok) {
      this.resolvedMode = configuredMode;
      const data = await response.json();
      return data.access_token;
    }

    // 2. Intelligent fallback: if 'live' was requested but keys belong to 'sandbox'
    if (configuredMode === 'live') {
      const sandboxResponse = await fetch(`${this.getBaseUrl('sandbox')}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (sandboxResponse.ok) {
        console.warn('Notice: PayPal credentials authenticated successfully against Sandbox environment.');
        this.resolvedMode = 'sandbox';
        const data = await sandboxResponse.json();
        return data.access_token;
      }
    }

    const err = await response.text();
    throw new Error(`Failed to obtain PayPal access token: ${err}`);
  }

  /**
   * Creates a PayPal checkout order
   */
  public static async createOrder(amount: string = '1.99', currency: string = 'USD'): Promise<{ id: string }> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount,
            },
            description: 'PromptShift 1-Click AI Project Conversion Bundle',
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create PayPal order: ${err}`);
    }

    return await response.json();
  }

  /**
   * Captures an authorized PayPal order
   */
  public static async captureOrder(orderId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to capture PayPal order: ${err}`);
    }

    return await response.json();
  }
}
