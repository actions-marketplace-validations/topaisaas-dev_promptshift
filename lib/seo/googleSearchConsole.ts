import crypto from 'crypto';

export interface SearchConsoleCredentials {
  clientEmail: string;
  privateKey: string;
}

export interface SearchAnalyticsQueryOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimensions?: ('query' | 'page' | 'country' | 'device' | 'searchAppearance')[];
  rowLimit?: number;
}

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export class GoogleSearchConsoleService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  /**
   * Loads credentials from environment variables or returns null if not configured
   */
  public static getCredentials(): SearchConsoleCredentials | null {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return null;
    }

    // Handle escaped newlines from env variables
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    return {
      clientEmail,
      privateKey: formattedKey,
    };
  }

  /**
   * Generates a Google OAuth2 Access Token using RS256 JWT assertion (Zero external dependencies)
   */
  public static async getAccessToken(creds?: SearchConsoleCredentials): Promise<string> {
    const credentials = creds || this.getCredentials();
    if (!credentials) {
      throw new Error('Google Search Console Service Account credentials are not configured.');
    }

    const now = Math.floor(Date.now() / 1000);

    // Return cached token if valid for at least 5 more minutes
    if (this.cachedToken && this.cachedToken.expiresAt > now + 300) {
      return this.cachedToken.token;
    }

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const claimSet = {
      iss: credentials.clientEmail,
      scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const base64UrlEncode = (str: string): string =>
      Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(credentials.privateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signature}`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      throw new Error(`Failed to obtain Google OAuth access token (${tokenResponse.status}): ${errBody}`);
    }

    const tokenData = await tokenResponse.json();
    this.cachedToken = {
      token: tokenData.access_token,
      expiresAt: now + (tokenData.expires_in || 3600),
    };

    return this.cachedToken.token;
  }

  /**
   * Submits a sitemap to Google Search Console
   */
  public static async submitSitemap(
    siteUrl: string = 'https://promptshift.dev',
    sitemapUrl: string = 'https://promptshift.dev/sitemap.xml'
  ): Promise<{ success: boolean; message: string }> {
    const token = await this.getAccessToken();
    const encodedSite = encodeURIComponent(siteUrl);
    const encodedFeed = encodeURIComponent(sitemapUrl);

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedFeed}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 204 || res.status === 200) {
      return { success: true, message: `Sitemap ${sitemapUrl} submitted successfully to Google.` };
    }

    const errText = await res.text();
    return { success: false, message: `Google Search Console error (${res.status}): ${errText}` };
  }

  /**
   * Queries Google Search Analytics (clicks, impressions, queries, CTR, ranking)
   */
  public static async querySearchAnalytics(
    siteUrl: string = 'https://promptshift.dev',
    options: SearchAnalyticsQueryOptions
  ): Promise<SearchAnalyticsRow[]> {
    const token = await this.getAccessToken();
    const encodedSite = encodeURIComponent(siteUrl);

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: options.dimensions || ['query'],
          rowLimit: options.rowLimit || 25,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Search Analytics query failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.rows || [];
  }

  /**
   * Sends URL Indexing notification to Google Indexing API (Instant Googlebot crawl)
   */
  public static async requestUrlIndexing(
    targetUrl: string,
    type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
  ): Promise<{ success: boolean; message: string }> {
    const token = await this.getAccessToken();

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        type,
      }),
    });

    if (res.ok) {
      return { success: true, message: `Instant indexing requested for ${targetUrl}.` };
    }

    const err = await res.text();
    return { success: false, message: `Indexing request failed (${res.status}): ${err}` };
  }
}
