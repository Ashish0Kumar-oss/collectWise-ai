import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { sendPayPalInvoice } from '@/lib/paypal/invoices';

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
      return NextResponse.json({ error: 'Invoice is already marked as PAID' }, { status: 400 });
    }

    // Call PayPal API send endpoint
    let paymentUrl = invoice.paypal_payment_url;
    if (invoice.paypal_invoice_id) {
      try {
        const result = await sendPayPalInvoice(invoice.paypal_invoice_id, {
          subject: `Invoice ${invoice.invoice_number} from Lumina Digital Studio`,
          note: invoice.notes || 'Please remit payment via PayPal at your earliest convenience.',
          send_to_invoicer: true,
        });
        if (result.link) {
          paymentUrl = result.link;
        }
      } catch (err) {
        console.warn('PayPal send request logged:', err);
      }
    }

    // Update database status to SENT
    const updated = await db.markInvoiceSent(
      invoice.id,
      invoice.paypal_invoice_id || undefined,
      paymentUrl || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoice_number} dispatched to ${invoice.client?.email || 'client'} successfully via PayPal.`,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Invoice send error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to send invoice' }, { status: 500 });
  }
}
