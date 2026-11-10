'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Receipt,
  Search,
  Plus,
  Send,
  BellRing,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Filter,
  DollarSign,
  Loader2,
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setInvoices(data.invoices || []);
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

  const handleSendInvoice = async (id: string) => {
    setActionLoadingId(`send_${id}`);
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendReminder = async (id: string) => {
    setActionLoadingId(`remind_${id}`);
    try {
      const res = await fetch(`/api/invoices/${id}/remind`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSimulatePayment = async (id: string) => {
    setActionLoadingId(`pay_${id}`);
    try {
      const res = await fetch(`/api/invoices/${id}/pay-sim`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncStatus = async (id: string) => {
    setActionLoadingId(`sync_${id}`);
    try {
      const res = await fetch(`/api/invoices/${id}/sync`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyPaymentUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === 'ALL' || inv.status.toUpperCase() === statusFilter;
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.client?.name && inv.client.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.client?.email && inv.client.email.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Invoices & Receivables"
          subtitle="PayPal Invoicing v2 synchronized billing ledger"
          actions={
            <button
              onClick={fetchInvoices}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh Invoices"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          }
        />

        <main className="flex-1 p-6 space-y-6">
          {/* Controls: Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-x-auto w-full sm:w-auto">
              {['ALL', 'OVERDUE', 'SENT', 'DRAFT', 'PAID'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice # or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400">Loading invoice ledger...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-200">No invoices match your filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search criteria or create a new invoice draft with Gemini AI.
                </p>
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Invoice</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Invoice Details</th>
                      <th className="py-3 px-4 font-semibold">Client</th>
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Reminders</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                        {/* Invoice Number & PayPal ID */}
                        <td className="py-3.5 px-4 font-mono font-medium">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-slate-100 hover:text-cyan-400 font-semibold"
                          >
                            {inv.invoice_number}
                          </Link>
                          {inv.paypal_invoice_id && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              PayPal: {inv.paypal_invoice_id}
                            </div>
                          )}
                        </td>

                        {/* Client info */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{inv.client?.name || 'Client'}</div>
                          <div className="text-[11px] text-slate-500">{inv.client?.email}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            ${inv.total_amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">{inv.currency}</div>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-medium">{inv.due_date}</div>
                          <div className="text-[10px] text-slate-500">Issued: {inv.issue_date}</div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
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

                        {/* Reminders sent count */}
                        <td className="py-3.5 px-4 text-slate-400">
                          {inv.reminder_count > 0 ? (
                            <span className="font-medium text-amber-400 flex items-center gap-1">
                              <BellRing className="w-3 h-3" />
                              {inv.reminder_count} sent
                            </span>
                          ) : (
                            <span className="text-slate-600">None</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* DRAFT -> Send via PayPal */}
                            {inv.status === 'DRAFT' && (
                              <button
                                onClick={() => handleSendInvoice(inv.id)}
                                disabled={actionLoadingId === `send_${inv.id}`}
                                className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                              >
                                {actionLoadingId === `send_${inv.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Send</span>
                              </button>
                            )}

                            {/* SENT or OVERDUE -> Send Reminder */}
                            {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                              <button
                                onClick={() => handleSendReminder(inv.id)}
                                disabled={actionLoadingId === `remind_${inv.id}`}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                                title="Send follow-up reminder email via PayPal"
                              >
                                {actionLoadingId === `remind_${inv.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <BellRing className="w-3 h-3" />
                                )}
                                <span>Remind</span>
                              </button>
                            )}

                            {/* Simulate Sandbox Payment */}
                            {inv.status !== 'PAID' && (
                              <button
                                onClick={() => handleSimulatePayment(inv.id)}
                                disabled={actionLoadingId === `pay_${inv.id}`}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors"
                                title="Simulate client payment completion in sandbox"
                              >
                                {actionLoadingId === `pay_${inv.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Simulate Pay'
                                )}
                              </button>
                            )}

                            {/* PayPal Link Copy */}
                            {inv.paypal_payment_url && (
                              <button
                                onClick={() => copyPaymentUrl(inv.paypal_payment_url, inv.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                                title="Copy PayPal Payment Link"
                              >
                                {copiedId === inv.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* View Details */}
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
