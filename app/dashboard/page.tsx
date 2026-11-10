'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  DollarSign,
  Clock,
  AlertOctagon,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [executingApproval, setExecutingApproval] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [insightsRes, invoicesRes, approvalsRes] = await Promise.all([
        fetch('/api/insights'),
        fetch('/api/invoices'),
        fetch('/api/approvals'),
      ]);

      const insightsData = await insightsRes.json();
      const invoicesData = await invoicesRes.json();
      const approvalsData = await approvalsRes.json();

      setData(insightsData);
      setInvoices(invoicesData.invoices || []);
      setApprovals(approvalsData.approvals || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      fetch('/api/insights').then((r) => r.json()),
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/approvals').then((r) => r.json()),
    ])
      .then(([insightsData, invoicesData, approvalsData]) => {
        if (!isCancelled) {
          setData(insightsData);
          setInvoices(invoicesData.invoices || []);
          setApprovals(approvalsData.approvals || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error(err);
          setLoading(false);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleApproveAction = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    setExecutingApproval(id);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingApproval(null);
    }
  };

  const handleSimulatePayment = async (invId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invId}/pay-sim`, { method: 'POST' });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Financial Overview" subtitle="Real-time collection intelligence" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-sm text-zinc-400">Loading CollectWise financial data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalCollected: 10200,
    outstandingBalance: 10400,
    overdueBalance: 3500,
    activeInvoicesCount: 3,
    collectionRate: 49.5,
  };

  const chartData = data?.monthlyRevenue || [];
  const recommendations = data?.recommendations || [];
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Financial Overview"
          subtitle="Real-time receivables, overdue collections, and PayPal synchronization"
          actions={
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-red-900/50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          }
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Top Level Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Collected */}
            <div className="bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-red-900/60 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Total Collected
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${summary.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Collection Rate: {summary.collectionRate}%</span>
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-red-900/60 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Outstanding Receivables
                </span>
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${summary.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                Across <span className="text-zinc-200 font-medium">{summary.activeInvoicesCount} active</span> client invoice(s)
              </div>
            </div>

            {/* Overdue Balance */}
            <div className="bg-zinc-950/80 border border-red-950/40 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-rose-900/60 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-600/15 rounded-full blur-2xl group-hover:bg-rose-600/25 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  Overdue Payments
                </span>
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-200 tracking-tight">
                ${summary.overdueBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-xs text-rose-400 font-medium flex items-center justify-between">
                <span>Requires immediate follow-up</span>
                <Link href="/assistant" className="underline hover:text-rose-300">
                  Auto-Remind
                </Link>
              </div>
            </div>

            {/* Active Invoices Count */}
            <div className="bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-red-900/60 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Invoices Tracked
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {invoices.length} Invoices
              </div>
              <div className="mt-2 text-xs text-rose-400 font-medium flex items-center justify-between">
                <span>PayPal Sandbox Synced</span>
                <Link href="/invoices" className="underline hover:text-rose-300">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* AI Action Approvals Banner (Human-in-the-loop security) */}
          {pendingApprovals.length > 0 && (
            <div className="bg-gradient-to-r from-red-950/50 via-rose-950/30 to-black border border-red-500/40 rounded-2xl p-5 shadow-lg shadow-red-950/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        AI Recommended Action Requiring Your Approval
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 uppercase tracking-wider border border-red-500/30">
                        Human-in-the-loop
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">
                      {pendingApprovals[0].summary}
                    </p>
                    <div className="mt-2 text-[11px] text-zinc-300 bg-black/70 p-2.5 rounded-lg border border-red-950/40">
                      <strong>Subject:</strong> {pendingApprovals[0].payload.recommended_subject}
                      <p className="mt-1 line-clamp-2 text-zinc-400">
                        {pendingApprovals[0].payload.recommended_note}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveAction(pendingApprovals[0].id, 'REJECT')}
                    disabled={executingApproval === pendingApprovals[0].id}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleApproveAction(pendingApprovals[0].id, 'APPROVE')}
                    disabled={executingApproval === pendingApprovals[0].id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition-all"
                  >
                    {executingApproval === pendingApprovals[0].id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Approve & Send via PayPal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Chart & AI Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Monthly Cash Flow & Collections</h3>
                  <p className="text-xs text-zinc-400">Total collected vs outstanding by month (USD)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>Collected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-700" />
                    <span>Outstanding</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be123c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#be123c" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#7f1d1d',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCollected)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outstanding"
                      stroke="#fb7185"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOutstanding)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Collection Recommendations */}
            <div className="bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Priority Recommendations</h3>
                  </div>
                  <Link href="/insights" className="text-xs text-red-400 hover:underline">
                    View Insights
                  </Link>
                </div>

                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-black/70 border border-red-950/40 hover:border-red-800/60 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                            rec.priority === 'HIGH'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="font-semibold text-zinc-200">{rec.amount}</span>
                      </div>
                      <p className="font-medium text-zinc-100">{rec.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{rec.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/assistant"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-300 text-xs font-semibold border border-red-900/30 transition-all"
              >
                <span>Consult CollectWise Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recent Invoices Table & Sandbox Quick Actions */}
          <div className="bg-zinc-950/80 border border-red-950/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Active Receivables & Invoices</h3>
                <p className="text-xs text-zinc-400">
                  Track PayPal Invoicing status, dispatch reminders, and simulate payments
                </p>
              </div>
              <Link
                href="/invoices"
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Invoice #</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">PayPal Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-3 font-mono font-medium text-zinc-200">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-red-400">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-zinc-200">{inv.client?.name || 'Client'}</div>
                        <div className="text-[11px] text-zinc-500">{inv.client?.email}</div>
                      </td>
                      <td className="py-3 font-semibold text-white">
                        ${inv.total_amount.toFixed(2)} <span className="text-[10px] text-zinc-400">{inv.currency}</span>
                      </td>
                      <td className="py-3 text-zinc-400">
                        {inv.due_date}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40 animate-pulse'
                              : inv.status === 'SENT'
                              ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                              : 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/50'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-400'
                                : inv.status === 'OVERDUE'
                                ? 'bg-rose-400'
                                : 'bg-red-400'
                            }`}
                          />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => handleSimulatePayment(inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                              title="Test sandbox payment completion"
                            >
                              Simulate Pay
                            </button>
                          )}
                          {inv.paypal_payment_url && (
                            <a
                              href={inv.paypal_payment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                              title="Open PayPal Sandbox Invoice Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
