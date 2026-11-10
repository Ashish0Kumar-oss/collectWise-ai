import { PayPalTokenResponse } from './types';

let cachedToken: { token: string; expiresAt: number } | null = null;

export function getPayPalBaseUrl(): string {
  const env = process.env.PAYPAL_ENV || 'sandbox';
  return env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
    process.env.PAYPAL_CLIENT_SECRET
  );
}

/**
 * Generate or return cached OAuth 2.0 access token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured in environment variables.');
  }

  // Check cache (with 60-second safety buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const baseUrl = getPayPalBaseUrl();
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal token generation failed:', response.status, errorText);
    throw new Error(`Failed to authenticate with PayPal: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as PayPalTokenResponse;
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Centralized authenticated PayPal API fetcher
 */
export async function paypalRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    requestId?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (options.requestId) {
    headers['PayPal-Request-Id'] = options.requestId;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text();
    }
    console.error(`PayPal API error [${options.method || 'GET'} ${endpoint}]:`, errorDetail);
    throw new Error(`PayPal API Error (${response.status}): ${errorDetail}`);
  }

  // Handle 204 No Content (e.g. sending reminders or empty responses)
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
