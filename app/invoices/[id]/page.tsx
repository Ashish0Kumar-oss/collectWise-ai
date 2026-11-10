'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  ArrowLeft,
  Send,
  BellRing,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Loader2,
} from 'lucide-react';

function InvoiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isJustCreated = searchParams.get('created') === 'true';

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(
    isJustCreated ? 'Invoice and PayPal draft registered successfully!' : null
  );
  const [copied, setCopied] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.invoice) {
        setInvoice(data.invoice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (id) {
      fetch(`/api/invoices/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled && data.invoice) {
            setInvoice(data.invoice);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.error(err);
            setLoading(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleSend = async () => {
    setActionLoading('send');
    setFeedback(null);
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || 'Invoice sent successfully via PayPal!');
        await fetchInvoice();
      }
    } catch (err: any) {
      setFeedback('Error sending invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemind = async () => {
    setActionLoading('remind');
    setFeedback(null);
    try {
      const res = await fetch(`/api/invoices/${id}/remind`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || 'Payment reminder sent successfully!');
        await fetchInvoice();
      }
    } catch (err: any) {
      setFeedback('Error sending reminder');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulatePayment = async () => {
    setActionLoading('pay');
    setFeedback(null);
    try {
      const res = await fetch(`/api/invoices/${id}/pay-sim`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback('Simulated payment received and recorded in ledger!');
        await fetchInvoice();
      }
    } catch (err: any) {
      setFeedback('Error recording payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSync = async () => {
    setActionLoading('sync');
    setFeedback(null);
    try {
      const res = await fetch(`/api/invoices/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Synchronized with PayPal: Status is ${data.paypalStatus}`);
        await fetchInvoice();
      }
    } catch (err) {
      setFeedback('Error synchronizing with PayPal');
    } finally {
      setActionLoading(null);
    }
  };

  const copyPaymentUrl = () => {
    if (invoice?.paypal_payment_url) {
      navigator.clipboard.writeText(invoice.paypal_payment_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Invoice Details" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen bg-black">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Invoice Not Found" />
          <div className="flex-1 p-6 text-center space-y-3">
            <p className="text-zinc-400 text-sm">The requested invoice could not be located.</p>
            <Link href="/invoices" className="text-red-400 text-xs hover:underline">
              Return to Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={`Invoice ${invoice.invoice_number}`}
          subtitle="Authoritative PayPal Invoicing v2 and Supabase synchronized record"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Top Bar Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Invoices</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSync}
                disabled={actionLoading === 'sync'}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-800"
                title="Verify authoritative PayPal status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === 'sync' ? 'animate-spin' : ''}`} />
                <span>Sync PayPal</span>
              </button>

              {invoice.status === 'DRAFT' && (
                <button
                  onClick={handleSend}
                  disabled={actionLoading === 'send'}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                >
                  {actionLoading === 'send' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send to Client via PayPal</span>
                </button>
              )}

              {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                <button
                  onClick={handleRemind}
                  disabled={actionLoading === 'remind'}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {actionLoading === 'remind' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <BellRing className="w-3.5 h-3.5" />
                  )}
                  <span>Send PayPal Reminder</span>
                </button>
              )}

              {invoice.status !== 'PAID' && (
                <button
                  onClick={handleSimulatePayment}
                  disabled={actionLoading === 'pay'}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Simulate client payment completion in sandbox"
                >
                  {actionLoading === 'pay' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <DollarSign className="w-3.5 h-3.5" />
                  )}
                  <span>Simulate Payment</span>
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                {feedback}
              </span>
              <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {/* Main Invoice Document View */}
          <div className="bg-zinc-950/90 border border-red-950/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-zinc-800 pb-6">
              <div>
                <div className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                  Lumina Digital Studio LLC
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">
                  {invoice.invoice_number}
                </h2>
                <div className="text-xs text-zinc-400 mt-1">
                  Issued: <strong className="text-zinc-200">{invoice.issue_date}</strong>
                </div>
              </div>

              {/* Status & PayPal Badge */}
              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    invoice.status === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : invoice.status === 'OVERDUE'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40 animate-pulse'
                      : invoice.status === 'SENT'
                      ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                      : 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/50'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      invoice.status === 'PAID'
                        ? 'bg-emerald-400'
                        : invoice.status === 'OVERDUE'
                        ? 'bg-rose-400'
                        : 'bg-red-400'
                    }`}
                  />
                  {invoice.status}
                </span>

                {invoice.paypal_invoice_id && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    PayPal ID: {invoice.paypal_invoice_id}
                  </span>
                )}
              </div>
            </div>

            {/* Recipient & Payment Terms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-zinc-800 pb-6 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-zinc-500 text-[10px]">
                  Billed To
                </span>
                <div className="text-base font-bold text-white mt-1">
                  {invoice.client?.name}
                </div>
                <div className="text-zinc-400 mt-0.5">{invoice.client?.email}</div>
                {invoice.client?.company_name && (
                  <div className="text-zinc-500">{invoice.client.company_name}</div>
                )}
              </div>

              <div className="sm:text-right space-y-1.5">
                <div>
                  <span className="text-zinc-400">Due Date: </span>
                  <span className="font-bold text-white text-sm">{invoice.due_date}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Payment Channel: </span>
                  <span className="text-rose-400 font-medium">PayPal REST API v2</span>
                </div>
                {invoice.last_reminder_sent_at && (
                  <div className="text-amber-400">
                    Last Reminder: {new Date(invoice.last_reminder_sent_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold text-center">Qty</th>
                    <th className="pb-3 font-semibold text-right">Unit Price</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-3 text-zinc-200 font-medium">{item.description}</td>
                        <td className="py-3 text-center text-zinc-400">{item.quantity}</td>
                        <td className="py-3 text-right text-zinc-400">${item.unit_price.toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-white">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 text-zinc-200 font-medium">{invoice.notes || 'Professional Deliverables'}</td>
                      <td className="py-3 text-center text-zinc-400">1</td>
                      <td className="py-3 text-right text-zinc-400">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3 text-right font-semibold text-white">${invoice.amount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="border-t border-zinc-800 pt-4 flex flex-col items-end gap-1.5 text-xs">
              <div className="w-64 flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-200">${invoice.amount.toFixed(2)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="w-64 flex justify-between text-zinc-400">
                  <span>Tax:</span>
                  <span className="font-mono text-zinc-200">${invoice.tax_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="w-64 flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Amount:</span>
                <span className="font-mono text-red-400 font-bold">
                  ${invoice.total_amount.toFixed(2)} {invoice.currency}
                </span>
              </div>
              {invoice.status === 'PAID' && (
                <div className="w-64 flex justify-between text-xs text-emerald-400 font-semibold pt-1">
                  <span>Paid in Full:</span>
                  <span className="font-mono">-${invoice.paid_amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* PayPal Sandbox Payment Card */}
            {invoice.paypal_payment_url && (
              <div className="bg-black/90 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-red-400 flex items-center gap-1.5">
                    <span>PayPal Sandbox Client Payment Portal</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate max-w-md font-mono">
                    {invoice.paypal_payment_url}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyPaymentUrl}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors border border-zinc-800"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={invoice.paypal_payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-colors"
                  >
                    <span>Open PayPal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-black items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      }
    >
      <InvoiceDetailContent />
    </Suspense>
  );
}
