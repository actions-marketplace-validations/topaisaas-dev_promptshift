import { NextResponse } from 'next/server';
import { SupportedCurrency } from '@/lib/currency/currencyManager';

export async function GET(req: Request) {
  try {
    const headers = req.headers;
    const country =
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country-code') ||
      '';

    let currency: SupportedCurrency = 'USD';

    const euCountries = [
      'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI',
      'GR', 'LU', 'CY', 'MT', 'SI', 'SK', 'EE', 'LV', 'LT'
    ];

    if (euCountries.includes(country.toUpperCase())) {
      currency = 'EUR';
    } else if (country.toUpperCase() === 'GB') {
      currency = 'GBP';
    } else if (country.toUpperCase() === 'CA') {
      currency = 'CAD';
    } else if (country.toUpperCase() === 'AU') {
      currency = 'AUD';
    } else if (country.toUpperCase() === 'JP') {
      currency = 'JPY';
    } else if (!country) {
      // Fallback for localhost & development: inspect Accept-Language
      const acceptLang = (headers.get('accept-language') || '').toLowerCase();
      if (acceptLang.includes('fr') || acceptLang.includes('de') || acceptLang.includes('es') || acceptLang.includes('it') || acceptLang.includes('nl')) {
        currency = 'EUR';
      } else if (acceptLang.includes('en-gb')) {
        currency = 'GBP';
      } else if (acceptLang.includes('ja')) {
        currency = 'JPY';
      }
    }

    return NextResponse.json({
      country: country || (currency === 'EUR' ? 'FR' : 'US'),
      currency,
    });
  } catch {
    return NextResponse.json({ country: 'FR', currency: 'EUR' });
  }
}
