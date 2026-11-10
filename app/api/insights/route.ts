import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export async function GET() {
  try {
    const summary = await db.getDashboardSummary();
    const invoices = await db.getInvoices();
    const clients = await db.getClients();
    const activities = await db.getActivities(10);

    // Monthly revenue aggregation
    const monthlyRevenue = [
      { month: 'Oct 2025', collected: 9400, outstanding: 1200 },
      { month: 'Nov 2025', collected: 13800, outstanding: 2100 },
      { month: 'Dec 2025', collected: 16500, outstanding: 3400 },
      { month: 'Jan 2026', collected: 18200, outstanding: 4200 },
      { month: 'Feb 2026', collected: 21400, outstanding: 5800 },
      { month: 'Mar 2026', collected: summary.totalCollected, outstanding: summary.outstandingBalance },
    ];

    // Client-wise receivables
    const clientReceivables = clients
      .map((c) => ({
        name: c.name,
        outstanding: c.outstanding_balance,
        paid: c.total_paid,
        punctuality: c.payment_punctuality,
      }))
      .sort((a, b) => b.outstanding - a.outstanding);

    // AI generated recommendations
    const recommendations = [
      {
        id: 'rec_1',
        priority: 'HIGH',
        title: 'Escalate Vanguard Media Group (8 Days Overdue)',
        client: 'Vanguard Media Group',
        amount: '$3,500.00',
        impact: 'Recovers 33.6% of current outstanding receivables',
        action: 'Send Stage 2 Firm PayPal Reminder with Instant Pay Link',
      },
      {
        id: 'rec_2',
        priority: 'MEDIUM',
        title: 'Pre-due Friendly Ping for Apex Robotics Inc.',
        client: 'Apex Robotics Inc.',
        amount: '$2,400.00',
        impact: 'Ensures net-14 payout is scheduled before fiscal cutoff',
        action: 'Draft polite check-in 3 days ahead of March 14 due date',
      },
      {
        id: 'rec_3',
        priority: 'LOW',
        title: 'Offer 2% Early Settlement Discount on Horizon Health Tech',
        client: 'Horizon Health Tech',
        amount: '$4,500.00',
        impact: 'Accelerates cash collection by 9 business days',
        action: 'Generate early settlement incentive proposal',
      },
    ];

    return NextResponse.json({
      summary,
      monthlyRevenue,
      clientReceivables,
      recommendations,
      recentActivities: activities,
      totalInvoicesCount: invoices.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch insights' }, { status: 500 });
  }
}
