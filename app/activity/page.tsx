'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  History,
  Receipt,
  Send,
  DollarSign,
  BellRing,
  Sparkles,
  RefreshCw,
  Clock,
  Loader2,
  Filter,
} from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setActivities(data.activities || []);
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

  const filtered = activities.filter(
    (act) => typeFilter === 'ALL' || act.activity_type === typeFilter
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'INVOICE_SENT':
        return <Send className="w-4 h-4 text-red-400" />;
      case 'REMINDER_SENT':
        return <BellRing className="w-4 h-4 text-amber-400" />;
      case 'AI_INSIGHT':
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'PAYPAL_SYNC':
        return <RefreshCw className="w-4 h-4 text-red-400" />;
      default:
        return <Receipt className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Activity & Audit Log"
          subtitle="Chronological audit trail of all invoices, PayPal dispatches, reminders, and payment settlements"
          actions={
            <button
              onClick={fetchActivities}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-950/50 transition-colors"
              title="Refresh Activity"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          }
        />

        <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Activities' },
              { id: 'PAYMENT_RECEIVED', label: 'Payments' },
              { id: 'REMINDER_SENT', label: 'Reminders' },
              { id: 'INVOICE_SENT', label: 'Dispatches' },
              { id: 'INVOICE_CREATED', label: 'Creations' },
              { id: 'AI_INSIGHT', label: 'AI Intelligence' },
              { id: 'PAYPAL_SYNC', label: 'PayPal Syncs' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  typeFilter === f.id
                    ? 'bg-red-950/50 text-red-300 border border-red-500/40 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Timeline Feed */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-sm">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                <p className="text-xs text-zinc-400">Loading audit history...</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-zinc-500 py-10 text-center">
                No activity logs found for this filter.
              </p>
            ) : (
              <div className="relative border-l border-zinc-800 ml-4 space-y-6">
                {filtered.map((act) => (
                  <div key={act.id} className="relative pl-6 group">
                    {/* Circle icon on the timeline line */}
                    <div className="absolute -left-3 top-1 h-6 w-6 rounded-full bg-black border border-zinc-800 flex items-center justify-center group-hover:border-red-500 transition-colors shadow-sm">
                      {getActivityIcon(act.activity_type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{act.title}</h4>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {new Date(act.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400">{act.description}</p>

                      {act.metadata && Object.keys(act.metadata).length > 0 && (
                        <div className="mt-1.5 inline-block text-[10px] font-mono bg-black px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">
                          {JSON.stringify(act.metadata)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
