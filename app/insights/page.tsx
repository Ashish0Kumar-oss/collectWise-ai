'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#ef4444', '#f43f5e', '#dc2626', '#b91c1c', '#fb7185'];

export default function InsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Financial Insights" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const clientReceivables = data?.clientReceivables || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Financial & Collection Insights"
          subtitle="Revenue velocity, DSO breakdown, and AI recommendations to accelerate cash flow"
        />

        <main className="flex-1 p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-red-950/50 rounded-2xl p-5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Overall Collection Efficiency
              </span>
              <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                {summary.collectionRate}%
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Healthy benchmark is &gt; 85% within 30 days.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-red-950/50 rounded-2xl p-5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Estimated DSO (Days Sales Outstanding)
              </span>
              <div className="text-2xl font-bold text-red-400 mt-2 font-mono">
                18.4 Days
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Average time from invoice dispatch to PayPal settlement.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-red-950/50 rounded-2xl p-5 backdrop-blur-sm">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                At-Risk Receivables
              </span>
              <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
                ${summary.overdueBalance?.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Past due invoices needing firm automated reminders.
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Monthly Collections Trend</h3>
                <p className="text-xs text-zinc-400">Collected vs remaining uncollected per cycle</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#3f3f46',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f4f4f5',
                      }}
                    />
                    <Bar dataKey="collected" fill="#dc2626" radius={[4, 4, 0, 0]} name="Collected ($)" />
                    <Bar dataKey="outstanding" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Outstanding ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Client Receivables Concentration */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Receivables Concentration by Client</h3>
                <p className="text-xs text-zinc-400">Distribution of uncollected funds</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientReceivables.filter((c: any) => c.outstanding > 0)}
                      dataKey="outstanding"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                    >
                      {clientReceivables.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: '#3f3f46',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f4f4f5',
                      }}
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Outstanding']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Collection Strategies */}
          <div className="bg-zinc-950/80 border border-red-950/40 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  CollectWise AI Strategic Recommendations
                </h3>
                <p className="text-xs text-zinc-400">
                  Algorithmic collection triggers based on debtor behavior and payment history
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="bg-black/80 border border-zinc-800 hover:border-red-950/60 rounded-xl p-4 text-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          rec.priority === 'HIGH'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="font-mono font-bold text-zinc-200">{rec.amount}</span>
                    </div>

                    <h4 className="font-semibold text-white text-sm">{rec.title}</h4>
                    <p className="text-zinc-400">{rec.impact}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-red-400 font-medium">
                    Recommended Action:
                    <p className="text-zinc-300 mt-0.5 font-normal">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
