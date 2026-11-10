import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const clients = await db.getClients();
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Client name and email are required' }, { status: 400 });
    }

    const client = await db.createClient({
      name: body.name,
      email: body.email,
      company_name: body.company_name || body.name,
      phone: body.phone || null,
      address_line1: body.address_line1 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      notes: body.notes || null,
      payment_punctuality: body.payment_punctuality || 'good',
    });

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create client' }, { status: 500 });
  }
}
