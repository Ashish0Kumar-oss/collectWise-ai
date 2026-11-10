'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  BookOpen,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Server,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Code2,
  Lock,
  Layers,
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'supabase' | 'paypal' | 'gemini' | 'vercel'>('architecture');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Documentation & Setup Guides"
          subtitle="Technical architecture, Supabase RLS migrations, PayPal Invoicing v2, and Gemini Function Calling"
        />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto text-xs">
            {[
              { id: 'architecture', label: 'Architecture & System Design', icon: Layers },
              { id: 'supabase', label: 'Supabase PostgreSQL & RLS', icon: ShieldCheck },
              { id: 'paypal', label: 'PayPal Invoicing API v2', icon: CreditCard },
              { id: 'gemini', label: 'Gemini AI & 8 Tools', icon: Sparkles },
              { id: 'vercel', label: 'Vercel Deployment', icon: Server },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>COLLECTWISE AI Architecture Overview</span>
                </h3>
                <p className="text-slate-400 mt-1">
                  TAGLINE: <em>Get Paid Faster. Let AI Handle the Follow-ups.</em>
                </p>
              </div>

              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  COLLECTWISE AI is a multi-tenant financial SaaS platform built with the <strong>Next.js 15+ App Router</strong>, engineered for frictionless serverless deployment on <strong>Vercel</strong>.
                </p>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                  <div className="text-cyan-400 font-bold"># Core Flow Architecture:</div>
                  <div>1. Client Browser (React 19, Tailwind CSS, Recharts)</div>
                  <div>2. Next.js Route Handlers (app/api/* on Node.js runtime)</div>
                  <div>3. Supabase PostgreSQL (11 tables with Row Level Security via auth.uid())</div>
                  <div>4. PayPal REST Invoicing API v2 (https://api-m.sandbox.paypal.com)</div>
                  <div>5. Google Gemini 3.8 Flash SDK (@google/genai with Function Calling &amp; 8 Tools)</div>
                </div>

                <h4 className="text-sm font-semibold text-white pt-2">Security &amp; Financial Boundaries</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      Zero Secret Exposure
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Neither <code>SUPABASE_SECRET_KEY</code>, <code>PAYPAL_CLIENT_SECRET</code>, nor <code>GEMINI_API_KEY</code> are ever sent to browser bundles.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Authoritative Payment Verification
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      AI models cannot declare invoices paid. Only verified PayPal API responses or signed webhooks transition status to <code>PAID</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE & SQL */}
          {activeTab === 'supabase' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Supabase PostgreSQL Schema &amp; Row Level Security (RLS)</span>
                  </h3>
                  <p className="text-slate-400 mt-0.5">
                    11 normalized tables ensuring strict multi-tenant isolation via <code>auth.uid() = user_id</code>
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyText(
                      'supabase db push  # Or run supabase/migrations/20261110000001_initial_schema.sql directly in Supabase SQL Editor',
                      'sql_cmd'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  {copiedKey === 'sql_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sql_cmd' ? 'Copied' : 'Copy SQL Run Command'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Database Table Catalog
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-[11px]">
                  {[
                    { name: 'profiles', rls: 'auth.uid() = id', desc: 'User profile & timezone' },
                    { name: 'business_profiles', rls: 'auth.uid() = user_id', desc: 'Merchant entity & currency' },
                    { name: 'clients', rls: 'auth.uid() = user_id', desc: 'Debtor accounts & punctuality' },
                    { name: 'invoices', rls: 'auth.uid() = user_id', desc: 'Authoritative ledger & PayPal ID' },
                    { name: 'invoice_items', rls: 'Linked through invoice', desc: 'Line items & deliverables' },
                    { name: 'payment_events', rls: 'auth.uid() = user_id', desc: 'Settled payment transactions' },
                    { name: 'webhook_events', rls: 'Service-role only', desc: 'Idempotent webhook store' },
                    { name: 'activities', rls: 'auth.uid() = user_id', desc: 'Chronological audit trail' },
                    { name: 'conversations', rls: 'auth.uid() = user_id', desc: 'AI session metadata' },
                    { name: 'messages', rls: 'auth.uid() = user_id', desc: 'Multi-turn messages & cards' },
                    { name: 'action_approvals', rls: 'auth.uid() = user_id', desc: 'Human-in-the-loop safety gates' },
                  ].map((table) => (
                    <div key={table.name} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-300">{table.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          RLS
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{table.desc}</div>
                      <div className="text-[9px] text-slate-500 truncate">Policy: {table.rls}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYPAL INVOICING API V2 */}
          {activeTab === 'paypal' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span>PayPal Invoicing API v2 &amp; Webhook Setup</span>
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Direct REST integration with <code>api-m.sandbox.paypal.com</code>
                </p>
              </div>

              <div className="space-y-4 text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-semibold text-white">Supported Webhook Events:</span>
                  <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-sky-300">
                    <li>INVOICING.INVOICE.CREATED</li>
                    <li>INVOICING.INVOICE.SENT</li>
                    <li>INVOICING.INVOICE.UPDATED</li>
                    <li>INVOICING.INVOICE.PAID</li>
                    <li>INVOICING.INVOICE.CANCELLED</li>
                    <li>INVOICING.INVOICE.REFUNDED</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-semibold text-white">Sandbox Simulator Feature:</span>
                  <p className="text-slate-400 text-xs">
                    Test the complete settlement lifecycle without test cards: open any invoice in <strong>Invoices</strong> and click <strong>&quot;Simulate Pay&quot;</strong>. The ledger transitions to <code>PAID</code>, updates client lifetime credit, and logs the event in the audit timeline!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI AI & 8 TOOLS */}
          {activeTab === 'gemini' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Gemini 3.8 Flash Function Calling &amp; 8 Financial Tools</span>
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Official Google GenAI SDK (<code>@google/genai</code>) initialized on the server
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'get_dashboard_summary', desc: 'Calculates real-time total collected, outstanding balance, and collection rate.' },
                  { name: 'list_invoices', desc: 'Filters ledger by status (DRAFT, SENT, PAID, OVERDUE) or client.' },
                  { name: 'get_invoice_details', desc: 'Inspects specific line items, issue date, and PayPal portal link.' },
                  { name: 'list_overdue_invoices', desc: 'Retrieves overdue invoices requiring urgent collection follow-up.' },
                  { name: 'create_invoice_draft', desc: 'Parses conversational text into structured client line items and due dates.' },
                  { name: 'draft_payment_reminder', desc: 'Generates polite or firm reminders tailored to debtor punctuality.' },
                  { name: 'request_paypal_invoice_action', desc: 'Gates external PayPal actions behind user approval cards.' },
                  { name: 'get_collection_insights', desc: 'Recommends DSO reduction tactics and cash acceleration strategies.' },
                ].map((tool) => (
                  <div key={tool.name} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="font-mono font-bold text-purple-300">{tool.name}()</div>
                    <div className="text-slate-400 text-[11px]">{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VERCEL DEPLOYMENT */}
          {activeTab === 'vercel' && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 text-xs">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <span>Vercel Serverless Deployment Checklist</span>
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Deploy as a standard Next.js App Router project in under 2 minutes
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-semibold text-white">Environment Variables to set in Vercel:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                    <div>• <code>GEMINI_API_KEY</code></div>
                    <div>• <code>GEMINI_MODEL</code></div>
                    <div>• <code>NEXT_PUBLIC_APP_URL</code></div>
                    <div>• <code>NEXT_PUBLIC_SUPABASE_URL</code></div>
                    <div>• <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code></div>
                    <div>• <code>SUPABASE_SECRET_KEY</code></div>
                    <div>• <code>PAYPAL_CLIENT_ID</code></div>
                    <div>• <code>PAYPAL_CLIENT_SECRET</code></div>
                    <div>• <code>PAYPAL_ENV</code></div>
                    <div>• <code>PAYPAL_WEBHOOK_ID</code></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Stateless serverless execution ready. No persistent in-memory or filesystem dependencies.</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
