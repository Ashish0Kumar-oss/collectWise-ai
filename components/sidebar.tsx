'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Receipt,
  Users,
  TrendingUp,
  History,
  Settings,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Copilot' },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Activity Log', href: '/activity', icon: History },
  { name: 'Settings & Supabase', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 backdrop-blur-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
              COLLECTWISE <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Smart Receivables & PayPal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Financial Management
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-cyan-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live System Integration Badges */}
      <div className="p-3 mx-3 mb-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Active Architecture</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Supabase DB (RLS)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
            PayPal Invoicing v2
          </span>
          <span className="text-[10px] text-sky-400 font-mono">Sandbox</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Gemini 3.8 Flash
          </span>
          <span className="text-[10px] text-purple-400 font-mono">Tools</span>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
            AV
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">Alex Vance</p>
            <p className="text-[10px] text-slate-400 truncate">Lumina Digital Studio</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-slate-400 hover:text-slate-200 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
