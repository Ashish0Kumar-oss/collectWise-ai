'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  AlertTriangle,
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
    <header className="border-b border-red-950/30 bg-black/80 backdrop-blur-xl sticky top-0 z-20 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Natural Language Bar & Actions */}
        <div className="flex items-center gap-3 flex-1 lg:max-w-2xl justify-end">
          {/* Quick AI Invoice Bar */}
          <form
            onSubmit={handleQuickExtract}
            className="relative flex-1 max-w-md hidden sm:block"
          >
            <div className="relative flex items-center">
              <Sparkles className="absolute left-3 w-4 h-4 text-red-400 pointer-events-none animate-pulse" />
              <input
                type="text"
                placeholder="Ask AI: 'Invoice John $850 for web dev in 7 days'..."
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isExtracting || !quickPrompt.trim()}
                className="absolute right-2 text-zinc-400 hover:text-red-400 disabled:opacity-40 transition-colors p-1"
                title="Process with Gemini AI"
              >
                {isExtracting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-900/30 transition-all shrink-0 animate-pulse"
              title="Financial Action Approvals Pending"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">{pendingApprovalsCount} Action Approval</span>
            </Link>
          )}

          {/* Custom Action buttons passed by page */}
          {actions}

          <Link
            href="/invoices/new"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-red-600/25 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
