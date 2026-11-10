import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await db.getClientById(id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const allInvoices = await db.getInvoices();
    const clientInvoices = allInvoices.filter((i) => i.client_id === id);

    return NextResponse.json({
      client,
      invoices: clientInvoices,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = await db.updateClient(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update client' }, { status: 500 });
  }
}
