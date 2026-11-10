import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

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
      return NextResponse.json({ error: 'Invoice is already PAID' }, { status: 400 });
    }

    const updated = await db.updateInvoice(id, {
      status: 'PAID',
      paypal_status: 'PAID',
      paid_amount: invoice.total_amount,
      paid_date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Simulated sandbox payment of $${invoice.total_amount.toFixed(2)} received successfully!`,
      invoice: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to simulate payment' }, { status: 500 });
  }
}
