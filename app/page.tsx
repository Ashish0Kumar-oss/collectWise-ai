import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Bot,
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-red-950/30 bg-black/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">COLLECTWISE AI</span>
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                Fintech SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-20 lg:py-28 overflow-hidden">
          {/* Crimson & Red Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-red-600/15 via-rose-600/15 to-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-red-950/50 text-zinc-300 text-xs font-medium backdrop-blur-md shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-red-400">TAGLINE:</span>
              <span>Get Paid Faster. Let AI Handle the Follow-ups.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
              Smart Collections for Freelancers &amp; Small Businesses
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Eliminate unpaid invoice awkwardness. CollectWise AI connects to{' '}
              <strong className="text-zinc-200">PayPal Invoicing API v2</strong>, monitors receivables in{' '}
              <strong className="text-zinc-200">Supabase PostgreSQL</strong>, and uses{' '}
              <strong className="text-zinc-200">Google Gemini</strong> to draft and dispatch polite yet firm payment reminders with human-in-the-loop safety.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/assistant"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-red-400" />
                <span>Test Gemini Assistant</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 border-t border-red-950/30 max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Supabase PostgreSQL (RLS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <span>PayPal Invoicing API v2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Gemini 3.8 Flash Function Calling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Human-in-the-loop Approvals</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Built for Modern Independent Businesses
            </h2>
            <p className="text-xs text-zinc-400">
              Four core pillars engineered to accelerate cash flow and eliminate bad debt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="bg-zinc-950/70 border border-red-950/40 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-red-900/60 transition-all">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 w-fit border border-red-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Natural Language Invoicing</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Type &quot;Invoice John $850 for website development due in 7 days&quot;. Gemini extracts line items, computes due dates, and creates a draft ready for PayPal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950/70 border border-red-950/40 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-red-900/60 transition-all">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit border border-rose-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Official PayPal Invoicing v2</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct integration with PayPal REST APIs. Generate hosted client payment links, verify webhooks with cryptographic signatures, and track settlement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950/70 border border-red-950/40 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-red-900/60 transition-all">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human-In-The-Loop Safety</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                AI prepares tailored, polite yet firm payment reminders based on debtor punctuality history, but never sends without your explicit one-click review and approval.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-950/70 border border-red-950/40 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-red-900/60 transition-all">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Supabase PostgreSQL &amp; RLS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                11 normalized tables with Row Level Security enforcing tenant isolation via auth.uid(). Ready for serverless Vercel execution without in-memory dependency.
              </p>
            </div>
          </div>
        </section>

        {/* Live Interactive Preview Box */}
        <section className="px-6 py-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-zinc-950 to-black border border-red-950/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950/40 pb-6">
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">
                  Live Interactive Demo
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Ready to test CollectWise AI?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Preloaded with realistic receivables, overdue client accounts, and PayPal sandbox flows.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-600/25 shrink-0"
              >
                <span>Open Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80">
                <span className="text-zinc-400 font-medium">1. Try Natural Language Invoice</span>
                <p className="text-zinc-300 mt-1">
                  Enter: <em>&quot;Create invoice for Apex Robotics $1,500 due in 10 days&quot;</em> in the top AI bar.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80">
                <span className="text-zinc-400 font-medium">2. Review Overdue Accounts</span>
                <p className="text-zinc-300 mt-1">
                  Inspect Vanguard Media Group ($3,500 overdue) and trigger an AI-drafted PayPal reminder.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/80">
                <span className="text-zinc-400 font-medium">3. Simulate PayPal Settlement</span>
                <p className="text-zinc-300 mt-1">
                  Click &quot;Simulate Pay&quot; to test instant webhook synchronization and ledger balance updates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black px-6 py-6 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            COLLECTWISE AI © 2026 • Get Paid Faster. Let AI Handle the Follow-ups.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/dashboard" className="hover:text-red-400">Dashboard</Link>
            <Link href="/assistant" className="hover:text-red-400">AI Assistant</Link>
            <Link href="/invoices" className="hover:text-red-400">Invoices</Link>
            <Link href="/docs" className="hover:text-red-400">Documentation</Link>
            <Link href="/settings" className="hover:text-red-400">Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
