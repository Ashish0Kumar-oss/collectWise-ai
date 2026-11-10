# System Architecture & Technical Specifications

**COLLECTWISE AI**  
*Get Paid Faster. Let AI Handle the Follow-ups.*

---

## 1. High-Level Architecture Overview

COLLECTWISE AI is designed as a modern, decoupled, multi-tenant financial SaaS application built on the **Next.js 15+ App Router** and architected for **Vercel Serverless** execution.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│                                                                         │
│   Next.js React 19 Frontend (Tailwind CSS, Lucide React, Recharts)     │
│   • /dashboard       • /assistant    • /invoices     • /clients         │
│   • /invoices/new    • /insights     • /activity     • /settings        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / JSON (Cookies Auth)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS / APP ROUTER                       │
│                                                                         │
│  API Route Handlers (/app/api/*)                                        │
│  ├── /api/assistant/chat          ──► Gemini 3.8 Flash Function Calling │
│  ├── /api/assistant/extract-invoice─► Gemini Structured JSON Output     │
│  ├── /api/invoices/[id]/send      ──► PayPal Invoicing API v2           │
│  ├── /api/invoices/[id]/remind    ──► PayPal Invoicing Reminder API     │
│  ├── /api/invoices/[id]/sync      ──► PayPal Authoritative Verification │
│  ├── /api/webhooks/paypal         ──► Cryptographic Signature Check    │
│  └── /api/approvals               ──► Human-In-The-Loop Safety Gate     │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
               ▼                                           ▼
┌──────────────────────────────┐            ┌─────────────────────────────┐
│    SUPABASE POSTGRESQL       │            │      PAYPAL REST API        │
│                              │            │                             │
│  • 11 Normalized Tables      │            │  • Sandbox REST API         │
│  • Row Level Security (RLS)  │            │  • Invoicing API v2         │
│  • auth.uid() = user_id      │            │  • Webhooks Listener        │
│  • NUMERIC(14, 2) Currency   │            │  • OAuth 2.0 Token Caching  │
└──────────────────────────────┘            └─────────────────────────────┘
```

---

## 2. Core Security Boundaries

### A. API Credential Isolation
- **Browser-Side Code:** Only has access to `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Server-Side Only Secrets:** `SUPABASE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, and `GEMINI_API_KEY` are strictly accessible in Route Handlers and Server Components. They are never transmitted over the wire to the browser.

### B. Tenant Isolation with Row Level Security (RLS)
- Every user-accessible table features a `user_id UUID NOT NULL REFERENCES auth.users(id)` column.
- Row Level Security is enabled on 100% of tenant tables.
- Access policies evaluate `auth.uid() = user_id`.
- The frontend can never dictate or override `user_id`; tenant identity is derived solely from the cryptographically verified session token.
- `webhook_events` is restricted to administrative server operations only (`createAdminClient()`).

### C. Financial Integrity & Authoritative State
- **No Floating Point Calculations:** All monetary values (invoices, balances, payments) use PostgreSQL `NUMERIC(14, 2)` or string-safe decimal parsing.
- **Authoritative Payment Verification:** AI models are never permitted to declare an invoice `PAID`. An invoice transitions to `PAID` only when validated by PayPal's API response or an authenticated webhook event.
- **Human-In-The-Loop Safety:** AI suggestions (such as payment reminders or invoice transmissions) create pending `ActionApproval` records in Supabase that require explicit user approval before execution.

---

## 3. Data Flow Workflows

### Workflow 1: Natural Language Invoice Creation
1. User enters: *"Create an invoice for John for $850 for website development due in 7 days."*
2. Frontend dispatches prompt to `POST /api/assistant/extract-invoice`.
3. Server executes Gemini 3.8 Flash with structured JSON schema (`responseSchema`).
4. Extracted data (client name, email, amount, description, calculated due date) returns to client.
5. Frontend renders interactive preview allowing inline edits.
6. User clicks **"Create PayPal Draft & Save"**.
7. Server validates fields with Zod, creates draft invoice in PayPal Invoicing API v2, and saves records in Supabase `invoices` and `invoice_items`.
8. PayPal returns an official recipient payment link (`https://www.sandbox.paypal.com/invoice/p/#...`).

### Workflow 2: AI-Powered Collection Follow-ups
1. Automated background analysis or user command queries overdue invoices (`list_overdue_invoices`).
2. AI identifies high-risk accounts based on days past due and client punctuality history.
3. Gemini tool `draft_payment_reminder` generates a tailored email reminder.
4. Server registers an `action_approvals` record with `status: 'PENDING'`.
5. Frontend renders an **Action Approval Banner / Card**.
6. User reviews message text and clicks **"Approve & Send via PayPal"**.
7. Server executes `POST /v2/invoicing/invoices/{id}/remind` via PayPal API.
8. Server increments invoice reminder count, logs timestamp, and updates audit history.

### Workflow 3: Webhook Settlement & Ledger Adjustment
1. Client pays invoice via PayPal hosted checkout.
2. PayPal dispatches `INVOICING.INVOICE.PAID` webhook to `POST /api/webhooks/paypal`.
3. Server verifies cryptographic transmission headers (`paypal-transmission-sig`, `paypal-cert-url`).
4. Server verifies event idempotency against `webhook_events`.
5. Server retrieves authoritative transaction amount, updates Supabase invoice status to `PAID`, credits client lifetime payment balance, decrements outstanding receivables, and logs activity in `activities`.

---

## 4. Serverless Compatibility (Vercel)

- **Stateless Execution:** No reliance on long-lived in-memory state or local filesystem storage.
- **Node.js Runtime:** All Route Handlers leverage `runtime = 'nodejs'` for compatibility with cryptographic verification, PayPal REST APIs, and the `@google/genai` SDK.
- **Cold-Start Resilience:** Database connections utilize Supabase connection pooling and REST client wrappers with timeout safeguards.
