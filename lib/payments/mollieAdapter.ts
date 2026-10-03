/**
 * Modular Mollie Payment Adapter (Ready for Direct IBAN Payouts)
 * Allows customers to pay by Credit Card / Apple Pay with zero Stripe/PayPal dependencies.
 */

export class MollieAdapter {
  private static isConfigured(): boolean {
    return Boolean(process.env.MOLLIE_API_KEY && process.env.MOLLIE_API_KEY.startsWith('live_'));
  }

  public static async createPayment(amount: string = '1.99', redirectUrl: string): Promise<{ paymentUrl: string; id: string } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: parseFloat(amount).toFixed(2),
        },
        description: 'PromptShift.dev AI Project Conversion',
        redirectUrl,
        method: ['creditcard', 'applepay', 'bancontact', 'ideal'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Mollie payment creation failed: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      paymentUrl: data._links.checkout.href,
      id: data.id,
    };
  }
}
