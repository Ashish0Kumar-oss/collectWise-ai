'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Building,
  Plus,
  Receipt,
  ExternalLink,
  DollarSign,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (data.client) {
        setClient(data.client);
        setInvoices(data.invoices || []);
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
      fetch(`/api/clients/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled && data.client) {
            setClient(data.client);
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
    }
    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Client Profile" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Client Not Found" />
          <div className="flex-1 p-6 text-center space-y-3">
            <p className="text-slate-400 text-sm">Client profile not found.</p>
            <Link href="/clients" className="text-cyan-400 text-xs hover:underline">
              Return to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={client.name}
          subtitle={`Client Account & Payment History (${client.payment_punctuality.replace('_', ' ')} rating)`}
          actions={
            <Link
              href={`/invoices/new?client_name=${encodeURIComponent(client.name)}&client_email=${encodeURIComponent(client.email)}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Bill This Client</span>
            </Link>
          }
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clients</span>
          </Link>

          {/* Profile Overview Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{client.name}</h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{client.company_name || 'Independent Client'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                  <strong className="text-slate-300">Notes: </strong>
                  {client.notes}
                </div>
              )}
            </div>

            {/* Balances */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Outstanding Receivables
                </span>
                <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                  ${client.outstanding_balance.toLocaleString()}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Lifetime Billed:</span>
                  <span className="font-semibold text-white">${client.total_invoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Settled:</span>
                  <span className="font-semibold text-emerald-400">${client.total_paid.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Invoices */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Client Invoice Ledger</h3>
              <span className="text-xs text-slate-400">{invoices.length} invoice(s)</span>
            </div>

            {invoices.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No invoices issued to this client yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Invoice #</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-mono font-medium text-slate-200">
                          <Link href={`/invoices/${inv.id}`} className="hover:text-cyan-400">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          ${inv.total_amount.toFixed(2)} {inv.currency}
                        </td>
                        <td className="py-3 text-slate-400">{inv.due_date}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : inv.status === 'OVERDUE'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                          >
                            Details
                          </Link>
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
