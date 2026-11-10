'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Sparkles,
  Plus,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(1);

  useEffect(() => {
    // Check pending approvals count
    fetch('/api/approvals')
      .then((res) => res.json())
      .then((data) => {
        if (data?.approvals) {
          const pending = data.approvals.filter((a: any) => a.status === 'PENDING');
          setPendingApprovalsCount(pending.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    setIsExtracting(true);
    try {
      const res = await fetch('/api/assistant/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: quickPrompt }),
      });
      const data = await res.json();
      if (data.extracted) {
        // Redirect to invoices creation with query params prefilled
        const params = new URLSearchParams();
        params.set('client_name', data.extracted.client_name);
        params.set('amount', data.extracted.amount.toString());
        params.set('description', data.extracted.description);
        params.set('due_date', data.extracted.due_date);
        router.push(`/invoices/new?${params.toString()}`);
      }
    } catch (err) {
      console.error(err);
      router.push(`/assistant?prompt=${encodeURIComponent(quickPrompt)}`);
    } finally {
      setIsExtracting(false);
      setQuickPrompt('');
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Natural Language Bar & Actions */}
        <div className="flex items-center gap-3 flex-1 lg:max-w-2xl justify-end">
          {/* Quick AI Invoice Bar */}
          <form
            onSubmit={handleQuickExtract}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <div className="relative flex items-center">
              <Sparkles className="absolute left-3 w-4 h-4 text-cyan-400 pointer-events-none animate-pulse" />
              <input
                type="text"
                placeholder="Ask AI: 'Invoice John $850 for web dev in 7 days'..."
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isExtracting || !quickPrompt.trim()}
                className="absolute right-2 text-slate-400 hover:text-cyan-400 disabled:opacity-40 transition-colors p-1"
                title="Process with Gemini AI"
              >
                {isExtracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </form>

          {/* Pending Approval notification */}
          {pendingApprovalsCount > 0 && (
            <Link
              href="/assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all shrink-0 animate-pulse"
              title="Financial Action Approvals Pending"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{pendingApprovalsCount} Action Approval</span>
            </Link>
          )}

          {/* Custom Action buttons passed by page */}
          {actions}

          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
