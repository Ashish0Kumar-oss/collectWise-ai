'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Building,
  DollarSign,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Terminal,
} from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile);
        setBusinessProfile(data.businessProfile);
        setStatus(data.status || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfile,
          profile,
        }),
      });
      if (res.ok) {
        setFeedback('Settings and business profile updated successfully!');
      }
    } catch (err) {
      setFeedback('Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const copySqlMigrationCommand = () => {
    navigator.clipboard.writeText(
      'supabase db push  # Or run supabase/migrations/20261110000001_initial_schema.sql directly in Supabase SQL Editor'
    );
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Settings" />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
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
          title="Settings & System Architecture"
          subtitle="Supabase PostgreSQL configuration, PayPal sandbox credentials, and merchant preferences"
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          {feedback && (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Architecture Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Supabase Status */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Supabase PostgreSQL</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {status.supabaseConfigured ? 'CONNECTED' : 'STANDALONE MODE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                11 tables with Row Level Security (RLS) configured in <code>supabase/migrations</code>.
              </p>
            </div>

            {/* PayPal Sandbox */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>PayPal Invoicing v2</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {status.paypalConfigured ? 'LIVE SANDBOX' : 'MOCK SANDBOX'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Environment: <strong>{status.paypalEnv}</strong>. Ready for REST OAuth &amp; webhook dispatch.
              </p>
            </div>

            {/* Gemini Model */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Gemini Intelligence</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Model: <code>gemini-3.8-flash</code> with 8 tools, Function Calling, and Structured Outputs.
              </p>
            </div>
          </div>

          {/* Business Profile Configuration Form */}
          <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Merchant & Business Profile</h3>
                <p className="text-xs text-slate-400">Appears on all PayPal draft invoices and reminder templates</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Business / Studio Legal Name
                </label>
                <input
                  type="text"
                  value={businessProfile?.business_name || ''}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, business_name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  PayPal Sandbox Merchant Email
                </label>
                <input
                  type="email"
                  value={businessProfile?.paypal_merchant_email || ''}
                  onChange={(e) =>
                    setBusinessProfile({
                      ...businessProfile,
                      paypal_merchant_email: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Default Currency
                </label>
                <select
                  value={businessProfile?.default_currency || 'USD'}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, default_currency: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Standard Payment Terms (Days)
                </label>
                <input
                  type="number"
                  value={businessProfile?.payment_terms_days || 14}
                  onChange={(e) =>
                    setBusinessProfile({
                      ...businessProfile,
                      payment_terms_days: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Default AI Reminder Tone
                </label>
                <select
                  value={businessProfile?.reminder_tone || 'polite_firm'}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, reminder_tone: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="polite_firm">Polite &amp; Firm (Recommended)</option>
                  <option value="friendly">Friendly &amp; Warm</option>
                  <option value="urgent">Urgent &amp; Strict</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tax ID / VAT Registration
                </label>
                <input
                  type="text"
                  value={businessProfile?.tax_id || ''}
                  onChange={(e) =>
                    setBusinessProfile({ ...businessProfile, tax_id: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </form>

          {/* Supabase SQL Migration Guide Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Supabase Database Schema &amp; RLS Policies</span>
                </h3>
                <p className="text-xs text-slate-400">
                  SQL migration file located at: <code>supabase/migrations/20261110000001_initial_schema.sql</code>
                </p>
              </div>

              <button
                onClick={copySqlMigrationCommand}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSql ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              # 11 Core PostgreSQL Tables Created &amp; Protected via Row Level Security (RLS):<br />
              • profiles &amp; business_profiles (user_id = auth.uid())<br />
              • clients &amp; invoices &amp; invoice_items (tenant data isolation)<br />
              • payment_events &amp; webhook_events (service_role protected)<br />
              • activities, conversations, messages, action_approvals
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
