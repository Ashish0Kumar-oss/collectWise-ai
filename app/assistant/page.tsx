'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Copy,
  Check,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actionCard?: any;
}

const SUGGESTED_PROMPTS = [
  'Create an invoice for John for $850 for website development due in 7 days.',
  'Show all overdue invoices and calculate collection risk.',
  'Draft a firm payment reminder for Vanguard Media Group.',
  'Give me actionable insights to reduce my Days Sales Outstanding (DSO).',
  'What is my overall collection rate this month?',
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello Alex! I am your CollectWise Financial AI Assistant.\n\nI monitor your accounts receivable, generate PayPal invoices from natural instructions, evaluate overdue accounts, and compose polite yet firm payment reminders.\n\nHow can I help accelerate your collections today?",
    },
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [executingApproval, setExecutingApproval] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Request completed.',
        actionCard: data.actionCard,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please verify your Gemini API key or try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && messages.length === 1) {
      const timer = setTimeout(() => {
        sendMessage(initialPrompt);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleApproveAction = async (approvalId: string, decision: 'APPROVE' | 'REJECT') => {
    setExecutingApproval(approvalId);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvalId, decision }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            role: 'assistant',
            content: decision === 'APPROVE'
              ? `✅ Action Approved & Executed! PayPal payment reminder dispatched.`
              : `❌ Action Rejected. No reminder was sent.`,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingApproval(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header
          title="CollectWise AI Assistant"
          subtitle="Gemini 3.8 Flash powered co-pilot with secure Function Calling and Financial Safety"
        />

        {/* Chat Thread Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-cyan-900/30 font-medium'
                      : 'bg-slate-900/80 border border-slate-800/80 text-slate-200 rounded-tl-sm backdrop-blur-md shadow-sm'
                  }`}
                >
                  {/* Markdown formatted text output */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {/* Render Specialized Action Card if emitted by Function Calling */}
                  {msg.actionCard && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {/* CARD TYPE: APPROVAL_CARD (Human-In-The-Loop) */}
                      {msg.actionCard.type === 'APPROVAL_CARD' && (
                        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-xs space-y-3">
                          <div className="flex items-center gap-2 text-amber-300 font-semibold">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Action Requires User Approval</span>
                          </div>
                          <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1.5 font-mono">
                            <div className="text-slate-400">
                              Recipient: <span className="text-slate-200">{msg.actionCard.data.reminder?.client_email}</span>
                            </div>
                            <div className="text-slate-400">
                              Invoice: <span className="text-cyan-400">{msg.actionCard.data.reminder?.invoice_number}</span> ({msg.actionCard.data.reminder?.amount})
                            </div>
                            <div className="text-slate-400">
                              Subject: <span className="text-slate-200">{msg.actionCard.data.reminder?.subject}</span>
                            </div>
                            <div className="text-slate-300 pt-2 border-t border-slate-800/80 font-sans text-xs">
                              {msg.actionCard.data.reminder?.note}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleApproveAction(msg.actionCard.data.approval_id, 'REJECT')}
                              disabled={executingApproval === msg.actionCard.data.approval_id}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveAction(msg.actionCard.data.approval_id, 'APPROVE')}
                              disabled={executingApproval === msg.actionCard.data.approval_id}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-white font-semibold transition-all shadow-md shadow-amber-500/20"
                            >
                              {executingApproval === msg.actionCard.data.approval_id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Approve & Dispatch via PayPal</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CARD TYPE: DRAFT_PREVIEW */}
                      {msg.actionCard.type === 'DRAFT_PREVIEW' && (
                        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                              <Receipt className="w-4 h-4" />
                              Invoice Draft Extracted
                            </span>
                            <span className="text-emerald-400 font-bold font-mono text-sm">
                              ${msg.actionCard.data.amount?.toFixed(2)} {msg.actionCard.data.currency}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-300">
                            <div>Client: <strong className="text-white">{msg.actionCard.data.client_name}</strong></div>
                            <div>Due Date: <strong className="text-white">{msg.actionCard.data.due_date}</strong></div>
                            <div className="col-span-2">Description: <span className="text-slate-400">{msg.actionCard.data.description}</span></div>
                          </div>
                          <div className="pt-2 flex justify-end gap-2">
                            <a
                              href={`/invoices/new?client_name=${encodeURIComponent(msg.actionCard.data.client_name)}&amount=${msg.actionCard.data.amount}&description=${encodeURIComponent(msg.actionCard.data.description)}&due_date=${msg.actionCard.data.due_date}`}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium flex items-center gap-1"
                            >
                              <span>Review & Create in PayPal</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* CARD TYPE: DASHBOARD_SUMMARY */}
                      {msg.actionCard.type === 'DASHBOARD_SUMMARY' && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Total Collected</div>
                            <div className="text-sm font-bold text-emerald-400 mt-1">
                              ${msg.actionCard.data.totalCollected?.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Outstanding</div>
                            <div className="text-sm font-bold text-cyan-400 mt-1">
                              ${msg.actionCard.data.outstandingBalance?.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Overdue</div>
                            <div className="text-sm font-bold text-rose-400 mt-1">
                              ${msg.actionCard.data.overdueBalance?.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Collection Rate</div>
                            <div className="text-sm font-bold text-purple-400 mt-1">
                              {msg.actionCard.data.collectionRate}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs">
                <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-cyan-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <span>CollectWise AI is querying financial database and analyzing receivables...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Suggested Prompts Pill Carousel */}
        <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/60 overflow-x-auto flex gap-2 shrink-0">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="max-w-4xl mx-auto flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask financial question or command (e.g. 'Draft invoice for Acme $1200 due in 14 days')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-slate-950 items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}

