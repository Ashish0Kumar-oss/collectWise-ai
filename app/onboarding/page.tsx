'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Building, CreditCard, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Lumina Digital Studio LLC');
  const [currency, setCurrency] = useState('USD');
  const [paypalEmail, setPaypalEmail] = useState('billing-sandbox@lumina-studio.design');
  const [termsDays, setTermsDays] = useState(14);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">COLLECTWISE AI</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Configure Your Business Profile
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Setup your merchant identity for PayPal Invoicing &amp; AI follow-up tone
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <form onSubmit={handleComplete} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Business / Studio Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                PayPal Sandbox Merchant Email
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">
                  Payment Terms
                </label>
                <select
                  value={termsDays}
                  onChange={(e) => setTermsDays(parseInt(e.target.value, 10))}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                >
                  <option value={7}>Net 7 Days</option>
                  <option value={14}>Net 14 Days</option>
                  <option value={30}>Net 30 Days</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-semibold text-xs shadow-md shadow-red-950/40 transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Launch Financial Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
