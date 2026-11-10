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
  CheckCircle2,
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
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Financial Overview" subtitle="Real-time collection intelligence" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading CollectWise financial data...</p>
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
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Financial Overview"
          subtitle="Real-time receivables, overdue collections, and PayPal synchronization"
          actions={
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
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
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Outstanding Receivables
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                ${summary.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Across <span className="text-slate-200 font-medium">{summary.activeInvoicesCount} active</span> client invoice(s)
              </div>
            </div>

            {/* Overdue Balance */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-rose-900/50 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  Overdue Payments
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm group hover:border-slate-700 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Invoices Tracked
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {invoices.length} Invoices
              </div>
              <div className="mt-2 text-xs text-purple-400 font-medium flex items-center justify-between">
                <span>PayPal Sandbox Synced</span>
                <Link href="/invoices" className="underline hover:text-purple-300">
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* AI Action Approvals Banner (Human-in-the-loop security) */}
          {pendingApprovals.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/40 border border-amber-500/40 rounded-2xl p-5 shadow-lg shadow-amber-950/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        AI Recommended Action Requiring Your Approval
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                        Human-in-the-loop
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {pendingApprovals[0].summary}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      <strong>Subject:</strong> {pendingApprovals[0].payload.recommended_subject}
                      <p className="mt-1 line-clamp-2 text-slate-300">
                        {pendingApprovals[0].payload.recommended_note}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveAction(pendingApprovals[0].id, 'REJECT')}
                    disabled={executingApproval === pendingApprovals[0].id}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleApproveAction(pendingApprovals[0].id, 'APPROVE')}
                    disabled={executingApproval === pendingApprovals[0].id}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all"
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
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Monthly Cash Flow & Collections</h3>
                  <p className="text-xs text-slate-400">Total collected vs outstanding by month (USD)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span>Collected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <span>Outstanding</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCollected)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outstanding"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOutstanding)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Collection Recommendations */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Priority Recommendations</h3>
                  </div>
                  <Link href="/insights" className="text-xs text-cyan-400 hover:underline">
                    View Insights
                  </Link>
                </div>

                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec: any) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                            rec.priority === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="font-semibold text-slate-200">{rec.amount}</span>
                      </div>
                      <p className="font-medium text-slate-100">{rec.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{rec.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/assistant"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700/60 transition-all"
              >
                <span>Consult CollectWise Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recent Invoices Table & Sandbox Quick Actions */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Active Receivables & Invoices</h3>
                <p className="text-xs text-slate-400">
                  Track PayPal Invoicing status, dispatch reminders, and simulate payments
                </p>
              </div>
              <Link
                href="/invoices"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Invoice #</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">PayPal Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 font-mono font-medium text-slate-200">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-cyan-400">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-200">{inv.client?.name || 'Client'}</div>
                        <div className="text-[11px] text-slate-500">{inv.client?.email}</div>
                      </td>
                      <td className="py-3 font-semibold text-white">
                        ${inv.total_amount.toFixed(2)} <span className="text-[10px] text-slate-400">{inv.currency}</span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {inv.due_date}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                              : inv.status === 'SENT'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-700/30 text-slate-300 border border-slate-600/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-400'
                                : inv.status === 'OVERDUE'
                                ? 'bg-rose-400'
                                : 'bg-cyan-400'
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
                              className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                              title="Open PayPal Sandbox Invoice Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
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
