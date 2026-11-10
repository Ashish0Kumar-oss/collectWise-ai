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
  BookOpen,
  Code2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Copilot' },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Activity Log', href: '/activity', icon: History },
  { name: 'Documentation', href: '/docs', icon: BookOpen, badge: 'Guides' },
  { name: 'Settings & Supabase', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950/95 border-r border-red-950/30 flex flex-col shrink-0 h-screen sticky top-0 backdrop-blur-xl z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-red-950/30 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
              COLLECTWISE <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">AI</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Smart Receivables & PayPal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
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
                  ? 'bg-gradient-to-r from-red-950/50 to-rose-950/30 text-red-300 border border-red-500/40 shadow-sm shadow-red-950/40 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live System Integration Badges */}
      <div className="p-3 mx-3 mb-3 bg-black/80 rounded-xl border border-red-950/40 text-xs space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Active Architecture</span>
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        </div>
        <div className="flex items-center justify-between text-zinc-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Supabase DB (RLS)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
        </div>
        <div className="flex items-center justify-between text-zinc-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            PayPal Invoicing v2
          </span>
          <span className="text-[10px] text-rose-400 font-mono">Sandbox</span>
        </div>
        <div className="flex items-center justify-between text-zinc-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Gemini 3.8 Flash
          </span>
          <span className="text-[10px] text-red-400 font-mono">Tools</span>
        </div>
        <div className="flex items-center justify-between text-zinc-300 pt-1 border-t border-zinc-800/60">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            Open Source
          </span>
          <span className="text-[10px] text-red-400 font-mono font-bold">MIT</span>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-red-950/30 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow shadow-red-600/20">
            AV
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-semibold text-zinc-200 truncate">Alex Vance</p>
            <p className="text-[10px] text-zinc-400 truncate">Lumina Digital Studio</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-zinc-400 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
