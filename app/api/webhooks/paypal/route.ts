import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/lib/paypal/webhooks';
import { db } from '@/lib/db/repository';

// In-memory set of processed event IDs to prevent duplicate webhook delivery
const processedEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const eventId = body?.id;
    const eventType = body?.event_type;

    if (!eventId || !eventType) {
      return NextResponse.json({ error: 'Missing event ID or event_type' }, { status: 400 });
    }

    // 1. Idempotency Check: prevent duplicate event processing
    if (processedEventIds.has(eventId)) {
      return NextResponse.json({ status: 'ALREADY_PROCESSED', event_id: eventId }, { status: 200 });
    }

    // 2. Signature verification
    const authAlgo = req.headers.get('paypal-auth-algo') || '';
    const certUrl = req.headers.get('paypal-cert-url') || '';
    const transmissionId = req.headers.get('paypal-transmission-id') || '';
    const transmissionSig = req.headers.get('paypal-transmission-sig') || '';
    const transmissionTime = req.headers.get('paypal-transmission-time') || '';
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || '';

    // Only strictly verify signature if header transmission info is present
    if (transmissionSig && transmissionId && webhookId) {
      const isValid = await verifyPayPalWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: body,
      });

      if (!isValid) {
        console.error('Invalid PayPal Webhook signature detected.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    // Mark event processed
    processedEventIds.add(eventId);

    // 3. Process Invoicing Events
    const resource = body.resource || {};
    const paypalInvoiceId = resource.id;
    const invoiceNumber = resource.detail?.invoice_number;

    const invoices = await db.getInvoices();
    const targetInvoice = invoices.find(
      (i) => (paypalInvoiceId && i.paypal_invoice_id === paypalInvoiceId) ||
             (invoiceNumber && i.invoice_number === invoiceNumber)
    );

    if (targetInvoice) {
      if (eventType === 'INVOICING.INVOICE.PAID') {
        const paidAmount = parseFloat(resource.amount?.value || targetInvoice.total_amount.toString());
        await db.updateInvoice(targetInvoice.id, {
          status: 'PAID',
          paypal_status: 'PAID',
          paid_amount: paidAmount,
          paid_date: resource.detail?.metadata?.last_update_time || new Date().toISOString(),
        });

        await db.logActivity({
          activity_type: 'PAYMENT_RECEIVED',
          title: `PayPal Verified Payment: ${targetInvoice.invoice_number}`,
          description: `Authoritative payment of $${paidAmount.toFixed(2)} received via PayPal Webhook.`,
          invoice_id: targetInvoice.id,
          client_id: targetInvoice.client_id,
          metadata: { event_id: eventId, paypal_invoice_id: paypalInvoiceId },
        });
      } else if (eventType === 'INVOICING.INVOICE.SENT') {
        await db.updateInvoice(targetInvoice.id, {
          status: 'SENT',
          paypal_status: 'SENT',
        });
      } else if (eventType === 'INVOICING.INVOICE.CANCELLED') {
        await db.updateInvoice(targetInvoice.id, {
          status: 'CANCELLED',
          paypal_status: 'CANCELLED',
        });
      } else if (eventType === 'INVOICING.INVOICE.REFUNDED') {
        await db.updateInvoice(targetInvoice.id, {
          status: 'REFUNDED',
          paypal_status: 'REFUNDED',
        });
      }
    }

    return NextResponse.json({
      received: true,
      event_id: eventId,
      event_type: eventType,
      matched_invoice: targetInvoice?.invoice_number || null,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 });
  }
}
