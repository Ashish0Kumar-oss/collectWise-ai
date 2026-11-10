import { paypalRequest, isPayPalConfigured } from './client';
import { PayPalWebhookVerificationPayload } from './types';

/**
 * Verify PayPal webhook signature with PayPal API
 * https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
 */
export async function verifyPayPalWebhookSignature(params: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: Record<string, any>;
}): Promise<boolean> {
  // If running in development without credentials or with dummy test events
  if (!isPayPalConfigured() || !params.webhookId) {
    console.warn('PayPal Webhook verification bypassed (sandbox test mode).');
    return true;
  }

  try {
    const payload: PayPalWebhookVerificationPayload = {
      auth_algo: params.authAlgo,
      cert_url: params.certUrl,
      transmission_id: params.transmissionId,
      transmission_sig: params.transmissionSig,
      transmission_time: params.transmissionTime,
      webhook_id: params.webhookId,
      webhook_event: params.webhookEvent,
    };

    const result = await paypalRequest<{ verification_status: string }>(
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: payload,
      }
    );

    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook signature verification request failed:', error);
    return false;
  }
}
