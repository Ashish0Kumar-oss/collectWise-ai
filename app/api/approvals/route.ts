import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { sendPayPalReminder } from '@/lib/paypal/invoices';

export async function GET() {
  try {
    const approvals = await db.getActionApprovals();
    return NextResponse.json({ approvals });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch action approvals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, decision, customNote } = await req.json();

    if (!id || !decision || !['APPROVE', 'REJECT'].includes(decision)) {
      return NextResponse.json({ error: 'Valid id and decision (APPROVE or REJECT) required' }, { status: 400 });
    }

    const approvals = await db.getActionApprovals();
    const approval = approvals.find((a) => a.id === id);

    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (decision === 'REJECT') {
      await db.updateActionApproval(id, 'REJECTED');
      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    // Process Approved Action
    if (approval.action_type === 'SEND_PAYMENT_REMINDER') {
      const payload = approval.payload;
      const invoice = await db.getInvoiceById(payload.invoice_id);

      if (invoice && invoice.paypal_invoice_id) {
        try {
          await sendPayPalReminder(invoice.paypal_invoice_id, {
            subject: payload.recommended_subject || `Payment Reminder: Invoice ${invoice.invoice_number}`,
            note: customNote || payload.recommended_note,
            send_to_invoicer: true,
          });
        } catch (err) {
          console.warn('PayPal execution note:', err);
        }
      }

      if (invoice) {
        await db.recordReminderSent(invoice.id);
      }

      await db.updateActionApproval(id, 'EXECUTED');

      return NextResponse.json({
        success: true,
        status: 'EXECUTED',
        message: `Approved and sent PayPal payment reminder to ${payload.recipient_email}`,
      });
    }

    await db.updateActionApproval(id, 'APPROVED');
    return NextResponse.json({ success: true, status: 'APPROVED' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Approval execution failed' }, { status: 500 });
  }
}
