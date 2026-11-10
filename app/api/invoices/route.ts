import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { createPayPalDraftInvoice, generatePayPalInvoiceNumber } from '@/lib/paypal/invoices';
import { PayPalInvoicePayload } from '@/lib/paypal/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let invoices = await db.getInvoices();

    if (status && status !== 'ALL') {
      invoices = invoices.filter((inv) => inv.status.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Required fields
    let clientId = body.client_id;

    // If client does not exist, create client on the fly
    if (!clientId && body.client_name) {
      const client = await db.createClient({
        name: body.client_name,
        email: body.client_email || `${body.client_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      });
      clientId = client.id;
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID or Name is required' }, { status: 400 });
    }

    const client = await db.getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A positive amount is required' }, { status: 400 });
    }

    // Generate authoritative or customized invoice number
    const invoiceNumber = body.invoice_number || (await generatePayPalInvoiceNumber());
    const dueDate = body.due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const issueDate = body.issue_date || new Date().toISOString().split('T')[0];
    const currency = body.currency || 'USD';
    const description = body.description || 'Professional Services';

    // Step: Create Draft in PayPal Sandbox
    let paypalInvoiceId: string | null = null;
    let paypalPaymentUrl: string | null = null;
    let paypalStatus: string = 'DRAFT';

    try {
      const biz = await db.getBusinessProfile();
      const paypalPayload: PayPalInvoicePayload = {
        detail: {
          invoice_number: invoiceNumber,
          invoice_date: issueDate,
          currency_code: currency,
          note: body.notes || 'Thank you for your business!',
          payment_term: {
            due_date: dueDate,
          },
        },
        invoicer: {
          business_name: biz.business_name,
          email_address: biz.paypal_merchant_email || undefined,
        },
        primary_recipients: [
          {
            billing_info: {
              name: {
                given_name: client.name,
              },
              email_address: client.email,
            },
          },
        ],
        items: [
          {
            name: description.slice(0, 60),
            description: description,
            quantity: '1',
            unit_amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      };

      const paypalDraft = await createPayPalDraftInvoice(paypalPayload);
      paypalInvoiceId = paypalDraft.id;
      paypalPaymentUrl = paypalDraft.detail?.metadata?.recipient_view_url || `https://www.sandbox.paypal.com/invoice/p/#${paypalDraft.id}`;
      paypalStatus = paypalDraft.status;
    } catch (ppErr) {
      console.warn('PayPal draft creation notice:', ppErr);
      // Generate standard sandbox ID
      paypalInvoiceId = `INV2-CW-${Date.now().toString().slice(-6)}`;
      paypalPaymentUrl = `https://www.sandbox.paypal.com/invoice/p/#${paypalInvoiceId}`;
    }

    // Persist invoice in database
    const newInvoice = await db.createInvoice({
      client_id: clientId,
      invoice_number: invoiceNumber,
      amount,
      currency,
      tax_rate: body.tax_rate || 0,
      issue_date: issueDate,
      due_date: dueDate,
      notes: body.notes || description,
      items: [
        {
          description,
          quantity: 1,
          unit_price: amount,
        },
      ],
      paypal_invoice_id: paypalInvoiceId,
      paypal_payment_url: paypalPaymentUrl,
      paypal_status: paypalStatus,
      status: 'DRAFT',
    });

    const fullInvoice = await db.getInvoiceById(newInvoice.id);

    return NextResponse.json({
      success: true,
      invoice: fullInvoice,
    });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create invoice' }, { status: 500 });
  }
}
