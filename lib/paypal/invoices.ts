import { paypalRequest, isPayPalConfigured } from './client';
import {
  PayPalInvoicePayload,
  PayPalInvoiceResponse,
  PayPalReminderPayload,
} from './types';

/**
 * Generate next recommended invoice number from PayPal
 */
export async function generatePayPalInvoiceNumber(): Promise<string> {
  if (!isPayPalConfigured()) {
    const timestamp = Date.now().toString().slice(-6);
    return `CW-INV-${timestamp}`;
  }

  try {
    const res = await paypalRequest<{ invoice_number: string }>(
      '/v2/invoicing/generate-next-invoice-number',
      { method: 'POST' }
    );
    return res.invoice_number || `CW-INV-${Date.now().toString().slice(-6)}`;
  } catch (err) {
    console.warn('Fallback to local invoice number generation:', err);
    return `CW-INV-${Date.now().toString().slice(-6)}`;
  }
}

/**
 * Create a draft invoice in PayPal Invoicing API v2
 */
export async function createPayPalDraftInvoice(
  payload: PayPalInvoicePayload,
  requestId?: string
): Promise<PayPalInvoiceResponse> {
  if (!isPayPalConfigured()) {
    // Return realistic sandbox mock response for local testing & demos
    const mockId = `INV2-TEST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const total = payload.items.reduce(
      (sum, item) => sum + parseFloat(item.unit_amount.value) * parseFloat(item.quantity),
      0
    );
    return {
      id: mockId,
      status: 'DRAFT',
      detail: {
        invoice_number: payload.detail.invoice_number || `INV-${Date.now().toString().slice(-5)}`,
        invoice_date: payload.detail.invoice_date,
        currency_code: payload.detail.currency_code,
        note: payload.detail.note,
        payment_term: payload.detail.payment_term,
        metadata: {
          recipient_view_url: `https://www.sandbox.paypal.com/invoice/p/#${mockId}`,
          invoicer_view_url: `https://www.sandbox.paypal.com/invoice/details/${mockId}`,
        },
      },
      amount: {
        currency_code: payload.detail.currency_code,
        value: total.toFixed(2),
      },
      primary_recipients: payload.primary_recipients,
      links: [
        {
          rel: 'self',
          href: `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${mockId}`,
          method: 'GET',
        },
        {
          rel: 'send',
          href: `https://api-m.sandbox.paypal.com/v2/invoicing/invoices/${mockId}/send`,
          method: 'POST',
        },
      ],
    };
  }

  return await paypalRequest<PayPalInvoiceResponse>('/v2/invoicing/invoices', {
    method: 'POST',
    body: payload,
    requestId,
  });
}

/**
 * Send an existing PayPal invoice to the recipient
 */
export async function sendPayPalInvoice(
  invoiceId: string,
  options?: {
    subject?: string;
    note?: string;
    send_to_invoicer?: boolean;
  }
): Promise<{ success: boolean; link?: string }> {
  if (!isPayPalConfigured()) {
    return {
      success: true,
      link: `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`,
    };
  }

  const result = await paypalRequest<{ href?: string }>(
    `/v2/invoicing/invoices/${invoiceId}/send`,
    {
      method: 'POST',
      body: {
        subject: options?.subject,
        note: options?.note,
        send_to_invoicer: options?.send_to_invoicer ?? true,
      },
    }
  );

  return {
    success: true,
    link: result?.href,
  };
}

/**
 * Retrieve invoice details from PayPal
 */
export async function getPayPalInvoice(
  invoiceId: string
): Promise<PayPalInvoiceResponse> {
  if (!isPayPalConfigured()) {
    return {
      id: invoiceId,
      status: 'SENT',
      detail: {
        invoice_number: 'CW-INV-1001',
        invoice_date: new Date().toISOString().split('T')[0],
        currency_code: 'USD',
        metadata: {
          recipient_view_url: `https://www.sandbox.paypal.com/invoice/p/#${invoiceId}`,
        },
      },
      amount: {
        currency_code: 'USD',
        value: '850.00',
      },
      primary_recipients: [
        {
          billing_info: {
            email_address: 'client@example.com',
            name: { given_name: 'John', surname: 'Doe' },
          },
        },
      ],
    };
  }

  return await paypalRequest<PayPalInvoiceResponse>(
    `/v2/invoicing/invoices/${invoiceId}`,
    { method: 'GET' }
  );
}

/**
 * Send payment reminder for an unpaid or overdue invoice
 */
export async function sendPayPalReminder(
  invoiceId: string,
  reminder: PayPalReminderPayload
): Promise<boolean> {
  if (!isPayPalConfigured()) {
    return true;
  }

  await paypalRequest<void>(`/v2/invoicing/invoices/${invoiceId}/remind`, {
    method: 'POST',
    body: reminder,
  });

  return true;
}

/**
 * Cancel a PayPal invoice
 */
export async function cancelPayPalInvoice(
  invoiceId: string,
  subject?: string,
  note?: string
): Promise<boolean> {
  if (!isPayPalConfigured()) {
    return true;
  }

  await paypalRequest<void>(`/v2/invoicing/invoices/${invoiceId}/cancel`, {
    method: 'POST',
    body: {
      subject: subject || 'Invoice Cancelled',
      note: note || 'Cancelled by merchant.',
      send_to_invoicer: true,
      send_to_recipient: true,
    },
  });

  return true;
}
