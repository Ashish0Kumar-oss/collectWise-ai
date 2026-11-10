'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Sparkles,
  Receipt,
  Send,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Mail,
  FileText,
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Natural Language AI extraction box state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState(searchParams.get('client_name') || '');
  const [clientEmail, setClientEmail] = useState(searchParams.get('client_email') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState(
    searchParams.get('description') || 'Website development and consulting services'
  );
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const param = searchParams.get('due_date');
    if (param) return param;
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('Payment is due within invoice terms. Remit via PayPal.');

  // Form Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Natural Language Extraction via Gemini
  const handleExtractWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsExtracting(true);
    setAiMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/assistant/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (data.extracted) {
        const ext = data.extracted;
        setClientName(ext.client_name || '');
        setClientEmail(ext.client_email || '');
        setAmount(ext.amount ? ext.amount.toString() : '');
        setCurrency(ext.currency || 'USD');
        setDescription(ext.description || '');
        if (ext.issue_date) setIssueDate(ext.issue_date);
        if (ext.due_date) setDueDate(ext.due_date);
        if (ext.tax_rate !== undefined) setTaxRate(ext.tax_rate.toString());

        setAiMessage(`Extracted details for ${ext.client_name} ($${ext.amount}) successfully! Review below.`);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not extract invoice details. Please fill the fields manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Submit invoice to create draft in PayPal and persist in Supabase
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !amount || !description || !dueDate) {
      setError('Please fill in all required fields (Client, Email, Amount, Description, Due Date).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        client_name: clientName,
        client_email: clientEmail,
        amount: parseFloat(amount),
        currency,
        description,
        issue_date: issueDate,
        due_date: dueDate,
        tax_rate: parseFloat(taxRate) || 0,
        notes,
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      // Navigate to created invoice details
      router.push(`/invoices/${data.invoice.id}?created=true`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while saving invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const parsedTaxRate = parseFloat(taxRate) || 0;
  const calculatedTax = (parsedAmount * parsedTaxRate) / 100;
  const calculatedTotal = parsedAmount + calculatedTax;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Create New Invoice"
          subtitle="Generate with Gemini AI and register authoritative PayPal Invoicing v2 draft"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Back link */}
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Invoices</span>
          </Link>

          {/* AI Extraction Prompt Card */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/20 to-indigo-950/20 border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>AI Instant Invoice Extraction</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Type or paste any natural language brief. CollectWise AI extracts client, items, amounts, and dates automatically.
            </p>

            <form onSubmit={handleExtractWithAI} className="flex gap-2">
              <input
                type="text"
                placeholder='e.g., "Create an invoice for John for $850 for website development due in 7 days."'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isExtracting || !aiPrompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 disabled:opacity-40 shadow-md shadow-cyan-500/20 transition-all shrink-0"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Auto-Fill Form</span>
              </button>
            </form>

            {aiMessage && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{aiMessage}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form & Real-Time Invoice Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <form onSubmit={handleCreateInvoice} className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
                  Recipient Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Client / Company Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe or Acme Inc."
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Client Billing Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="billing@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3 pt-2">
                  Invoice Terms & Dates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3 pt-2">
                  Line Items & Financials
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Description of Services / Deliverables *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g., Website development, UI/UX sprint deliverables..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Subtotal Amount *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="850.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Tax Rate (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Customer Notes & Terms
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Link
                  href="/invoices"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                  <span>Create PayPal Draft & Save</span>
                </button>
              </div>
            </form>

            {/* Live Invoice Preview Column */}
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Invoice Preview
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                    DRAFT
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Billed To</div>
                  <div className="text-sm font-bold text-white">
                    {clientName || 'Client Name'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {clientEmail || 'billing@example.com'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Issue Date:</span>
                    <span className="text-slate-200 font-mono">{issueDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Due Date:</span>
                    <span className="text-slate-200 font-mono font-bold text-cyan-400">{dueDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="text-sky-400 font-medium">PayPal Invoicing</span>
                  </div>
                </div>

                {/* Line Item preview */}
                <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                  <div className="text-slate-400 font-medium">Item Deliverable:</div>
                  <div className="text-slate-200 font-medium">{description}</div>

                  <div className="border-t border-slate-800/60 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-200">${parsedAmount.toFixed(2)}</span>
                    </div>
                    {parsedTaxRate > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>Tax ({parsedTaxRate}%):</span>
                        <span className="font-mono text-slate-200">${calculatedTax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                      <span>Total Due:</span>
                      <span className="font-mono text-cyan-400">${calculatedTotal.toFixed(2)} {currency}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300">
                  ⚡ Upon creation, a real draft is saved in PayPal sandbox. Sending the invoice will be a separate user-confirmed step.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-slate-950 items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <NewInvoiceContent />
    </Suspense>
  );
}

