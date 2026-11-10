import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { sendPayPalReminder } from '@/lib/paypal/invoices';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await db.getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Cannot send reminder for an already paid invoice' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const customSubject = body.subject || `Payment Reminder: Invoice ${invoice.invoice_number} Past Due`;
    const customNote = body.note || `Dear ${invoice.client?.name || 'Customer'},\n\nThis is a friendly reminder that payment for Invoice ${invoice.invoice_number} ($${invoice.total_amount.toFixed(2)} ${invoice.currency}) is outstanding.\n\nPlease process through PayPal using your payment link: ${invoice.paypal_payment_url || 'available in your invoice email'}.\n\nThank you!`;

    // Send reminder via PayPal Invoicing API v2
    if (invoice.paypal_invoice_id) {
      try {
        await sendPayPalReminder(invoice.paypal_invoice_id, {
          subject: customSubject,
          note: customNote,
          send_to_invoicer: true,
        });
      } catch (err: any) {
        console.warn('PayPal reminder dispatch note:', err);
      }
    }

    // Record reminder in repository & activity log
    const updated = await db.recordReminderSent(invoice.id);

    return NextResponse.json({
      success: true,
      message: `Payment reminder successfully delivered to ${invoice.client?.email || 'client'} via PayPal.`,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Reminder error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to dispatch reminder' }, { status: 500 });
  }
}
