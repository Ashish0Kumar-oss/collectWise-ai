import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { getPayPalInvoice } from '@/lib/paypal/invoices';

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

    if (!invoice.paypal_invoice_id) {
      return NextResponse.json({
        success: true,
        message: 'Invoice has no PayPal ID attached. Kept current status.',
        invoice,
      });
    }

    // Call PayPal API for authoritative status
    const ppInvoice = await getPayPalInvoice(invoice.paypal_invoice_id);

    let newStatus = invoice.status;
    if (ppInvoice.status === 'PAID' || ppInvoice.status === 'MARKED_AS_PAID') {
      newStatus = 'PAID';
    } else if (ppInvoice.status === 'CANCELLED') {
      newStatus = 'CANCELLED';
    } else if (ppInvoice.status === 'SENT' && invoice.status === 'DRAFT') {
      newStatus = 'SENT';
    }

    const updated = await db.updateInvoice(invoice.id, {
      status: newStatus,
      paypal_status: ppInvoice.status,
      paid_amount: newStatus === 'PAID' ? invoice.total_amount : invoice.paid_amount,
      paid_date: newStatus === 'PAID' ? (invoice.paid_date || new Date().toISOString()) : invoice.paid_date,
    });

    await db.logActivity({
      activity_type: 'PAYPAL_SYNC',
      title: `PayPal Status Synchronized: ${invoice.invoice_number}`,
      description: `Authoritative status verified as ${ppInvoice.status}.`,
      invoice_id: invoice.id,
      client_id: invoice.client_id,
    });

    return NextResponse.json({
      success: true,
      paypalStatus: ppInvoice.status,
      invoice: updated,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to sync with PayPal' }, { status: 500 });
  }
}
