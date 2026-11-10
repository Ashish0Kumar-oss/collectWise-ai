import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Receipt,
  Bot,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">COLLECTWISE AI</span>
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Fintech SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
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
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium backdrop-blur-md shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold text-cyan-300">TAGLINE:</span>
              <span>Get Paid Faster. Let AI Handle the Follow-ups.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
              Smart Collections for Freelancers &amp; Small Businesses
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Eliminate unpaid invoice awkwardness. CollectWise AI connects to{' '}
              <strong className="text-slate-200">PayPal Invoicing API v2</strong>, monitors receivables in{' '}
              <strong className="text-slate-200">Supabase PostgreSQL</strong>, and uses{' '}
              <strong className="text-slate-200">Google Gemini</strong> to draft and dispatch polite yet firm payment reminders with human-in-the-loop safety.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/assistant"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Test Gemini Assistant</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/60 max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Supabase PostgreSQL (RLS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>PayPal Invoicing API v2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
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
            <p className="text-xs text-slate-400">
              Four core pillars engineered to accelerate cash flow and eliminate bad debt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Natural Language Invoicing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type &quot;Invoice John $850 for website development due in 7 days&quot;. Gemini extracts line items, computes due dates, and creates a draft ready for PayPal.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all">
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit border border-sky-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Official PayPal Invoicing v2</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct integration with PayPal REST APIs. Generate hosted client payment links, verify webhooks with cryptographic signatures, and track settlement.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human-In-The-Loop Safety</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI prepares tailored, polite yet firm payment reminders based on debtor punctuality history, but never sends without your explicit one-click review and approval.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-3 hover:border-slate-700 transition-all">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Supabase PostgreSQL &amp; RLS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                11 normalized tables with Row Level Security enforcing tenant isolation via auth.uid(). Ready for serverless Vercel execution without in-memory dependency.
              </p>
            </div>
          </div>
        </section>

        {/* Live Interactive Preview Box */}
        <section className="px-6 py-12 max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                  Live Interactive Demo
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Ready to test CollectWise AI?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preloaded with realistic receivables, overdue client accounts, and PayPal sandbox flows.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
              >
                <span>Open Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 font-medium">1. Try Natural Language Invoice</span>
                <p className="text-slate-300 mt-1">
                  Enter: <em>&quot;Create invoice for Apex Robotics $1,500 due in 10 days&quot;</em> in the top AI bar.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 font-medium">2. Review Overdue Accounts</span>
                <p className="text-slate-300 mt-1">
                  Inspect Vanguard Media Group ($3,500 overdue) and trigger an AI-drafted PayPal reminder.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400 font-medium">3. Simulate PayPal Settlement</span>
                <p className="text-slate-300 mt-1">
                  Click &quot;Simulate Pay&quot; to test instant webhook synchronization and ledger balance updates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            COLLECTWISE AI © 2026 • Get Paid Faster. Let AI Handle the Follow-ups.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/dashboard" className="hover:text-cyan-400">Dashboard</Link>
            <Link href="/assistant" className="hover:text-cyan-400">AI Assistant</Link>
            <Link href="/invoices" className="hover:text-cyan-400">Invoices</Link>
            <Link href="/settings" className="hover:text-cyan-400">Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
