# COLLECTWISE AI
> **Get Paid Faster. Let AI Handle the Follow-ups.**

[![License: MIT](https://img.shields.io/badge/License-MIT-dc2626.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase PostgreSQL](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![PayPal Invoicing API v2](https://img.shields.io/badge/Payment-PayPal%20Invoicing%20v2-003087?style=flat&logo=paypal)](https://developer.paypal.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/AI-Google%20Gemini%203.8%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Deploy with Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)](https://github.com/)

**COLLECTWISE AI** is a production-grade, AI-powered accounts receivable and financial management platform engineered for freelancers, agencies, and small businesses. It connects directly with **PayPal Invoicing API v2**, stores and isolates tenant financials in **Supabase PostgreSQL** via **Row Level Security (RLS)**, and leverages **Google Gemini 3.8 Flash** with **Function Calling** and **Structured Outputs** to draft invoices, predict collection risks, and dispatch personalized, polite yet firm follow-ups with human-in-the-loop safety.

---

## 🌟 Key Features

### 1. Natural Language Invoicing (Gemini 3.8 Flash)
- Type conversational instructions such as:  
  `"Create an invoice for John for $850 for website development due in 7 days."`
- The AI extracts structured line items, computes due dates, matches or creates clients, and displays an editable invoice preview.
- One-click creates an authoritative draft in **PayPal Sandbox** and records the invoice in **Supabase**.

### 2. Official PayPal Invoicing API v2 Integration
- Direct server-side OAuth 2.0 token caching and requests to `https://api-m.sandbox.paypal.com`.
- **Draft Creation & Dispatch:** Draft invoices are registered in PayPal and sent to client billing emails with official hosted payment links.
- **Payment Reminders:** Native PayPal reminder operations (`/v2/invoicing/invoices/{id}/remind`) with custom tone and notes.
- **Status Sync:** Live status checks querying authoritative PayPal ledger data.
- **Sandbox Payment Simulator:** Built-in tool to simulate instant payment completions for demos and local testing.

### 3. Cryptographically Verified PayPal Webhooks
- Webhook route: `POST /api/webhooks/paypal`
- Validates transmission signatures with PayPal API.
- Idempotent processing prevents duplicate ledger adjustments.
- Handles `INVOICING.INVOICE.CREATED`, `INVOICING.INVOICE.SENT`, `INVOICING.INVOICE.PAID`, `INVOICING.INVOICE.CANCELLED`, and `INVOICING.INVOICE.REFUNDED`.

### 4. Human-In-The-Loop AI Action Approvals
- Gemini evaluates overdue invoices and debtor punctuality history to propose tailored collection reminders.
- **Zero Hallucination or Unauthorized Actions:** AI generates formal `ActionApproval` requests that require explicit 1-click user review before dispatching any external PayPal communication.

### 5. Supabase PostgreSQL with Strict Row Level Security (RLS)
- 11 normalized relational tables covering profiles, businesses, clients, invoices, invoice items, payment events, webhook events, activities, conversations, messages, and action approvals.
- Enforces strict tenant data isolation using `auth.uid() = user_id`.
- Monetary values stored in PostgreSQL `NUMERIC(14, 2)` to eliminate JavaScript floating-point errors.

### 6. Executive Financial Intelligence Dashboard
- Real-time KPIs: Total Collected, Outstanding Receivables, Overdue Payments, Active Invoices, and Collection Efficiency Rate.
- Monthly revenue vs. outstanding trajectory powered by **Recharts**.
- Client receivables concentration breakdown.
- Chronological audit log of all financial events.

---

## 🏗️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript | Server and Client Components with Turbopack |
| **Styling** | Tailwind CSS v4, tw-animate-css | Pitch black & crimson/rose fintech aesthetic inspired by Linear |
| **Icons & Charts** | Lucide React, Recharts | Accessible SVG icons and responsive SVG financial charts |
| **Database** | Supabase PostgreSQL | 11 tables with Row Level Security (RLS) policies |
| **Authentication** | Supabase Auth & SSR | `@supabase/ssr` with cookie session persistence |
| **AI Intelligence** | Google Gemini 3.8 Flash (`@google/genai`) | Server-side SDK, 8 Function Calling tools, Zod schemas |
| **Payments** | PayPal REST API (Invoicing v2) | Server-side OAuth 2.0, Webhook verification, Idempotency |
| **Deployment** | Vercel Serverless | Node.js runtime for Route Handlers under `/app/api/` |

---

## 📁 Project Architecture & File Structure

```
collectwise-ai/
├── app/                                 # Next.js App Router
│   ├── api/                             # Server-side API Route Handlers
│   │   ├── activity/route.ts            # Audit activity feed
│   │   ├── approvals/route.ts           # Human-in-the-loop action approvals
│   │   ├── assistant/
│   │   │   ├── chat/route.ts            # Gemini conversational AI with function calling
│   │   │   └── extract-invoice/route.ts # Gemini structured natural language extraction
│   │   ├── clients/                     # Client management endpoints
│   │   │   ├── route.ts                 # List and create clients
│   │   │   └── [id]/route.ts            # Client details and balance ledger
│   │   ├── insights/route.ts            # Financial analytics & AI recommendations
│   │   ├── invoices/                    # Invoice operations
│   │   │   ├── route.ts                 # List invoices & create PayPal drafts
│   │   │   └── [id]/
│   │   │       ├── route.ts             # Invoice details & updates
│   │   │       ├── pay-sim/route.ts     # Sandbox Payment Simulator
│   │   │       ├── remind/route.ts      # Send PayPal payment reminder
│   │   │       ├── send/route.ts        # Send PayPal invoice to client
│   │   │       └── sync/route.ts        # Query authoritative PayPal status
│   │   ├── settings/route.ts            # Merchant preferences & credentials status
│   │   └── webhooks/
│   │       └── paypal/route.ts          # Idempotent PayPal webhook handler
│   ├── activity/page.tsx                # Chronological audit log UI
│   ├── assistant/page.tsx               # AI Assistant multi-turn chat UI
│   ├── clients/                         # Client directory & profiles
│   │   ├── page.tsx                     # Clients list with punctuality ratings
│   │   └── [id]/page.tsx                # Client details with invoice history
│   ├── dashboard/page.tsx               # Executive dashboard & Recharts
│   ├── docs/page.tsx                    # In-app Documentation & Setup guides
│   ├── insights/page.tsx                # Financial analytics & DSO metrics
│   ├── invoices/                        # Invoices ledger & creation
│   │   ├── page.tsx                     # Invoices table with status filtering
│   │   ├── new/page.tsx                 # AI extraction form & live invoice preview
│   │   └── [id]/page.tsx                # Invoice document view & PayPal portal link
│   ├── login/page.tsx                   # Supabase authentication login
│   ├── signup/page.tsx                  # Supabase authentication sign-up
│   ├── onboarding/page.tsx              # Merchant onboarding workflow
│   ├── settings/page.tsx                # Merchant profile & DB schema inspector
│   ├── globals.css                      # Tailwind CSS v4 styling & dark theme
│   ├── layout.tsx                       # Root layout with metadata
│   └── page.tsx                         # SaaS landing page with live demo CTAs
├── components/                          # Reusable UI components
│   ├── header.tsx                       # App header with quick AI prompt bar
│   └── sidebar.tsx                      # Navigation sidebar with status badges
├── docs/                                # Detailed technical documentation
│   ├── ARCHITECTURE.md                  # System design & data flow diagrams
│   ├── SUPABASE_SETUP.md                # PostgreSQL schema & RLS setup
│   ├── PAYPAL_INTEGRATION.md            # PayPal Invoicing v2 & Webhooks guide
│   ├── GEMINI_AI_SPECS.md               # Function calling & AI tools specification
│   └── VERCEL_DEPLOYMENT.md             # Vercel production deployment guide
├── lib/                                 # Shared libraries and utilities
│   ├── ai/
│   │   └── gemini.ts                    # Google GenAI client, system prompts, 8 tools
│   ├── db/
│   │   ├── mock-data.ts                 # High-fidelity realistic seed data
│   │   └── repository.ts                # Financial repository & state manager
│   ├── paypal/
│   │   ├── client.ts                    # PayPal REST client & OAuth 2.0 token cache
│   │   ├── invoices.ts                  # PayPal Invoicing v2 draft/send/remind service
│   │   ├── types.ts                     # TypeScript interfaces for PayPal Invoicing
│   │   └── webhooks.ts                  # Webhook signature verification helper
│   ├── supabase/
│   │   ├── admin.ts                     # Server-only administrative Supabase client
│   │   ├── client.ts                    # Browser Supabase client
│   │   ├── database.types.ts            # TypeScript definitions for all 11 tables
│   │   └── server.ts                    # Server component / route handler client
│   └── utils.ts                         # CSS class mergers (clsx & twMerge)
├── supabase/
│   └── migrations/
│       └── 20261110000001_initial_schema.sql # Complete 11-table PostgreSQL migration
├── .env.example                         # Environment variable definitions
├── package.json                         # Dependencies and scripts
└── tsconfig.json                        # TypeScript configuration
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** >= 20.0.0
- **npm** or **bun**
- (Optional for live external calls) Google Gemini API Key, PayPal Sandbox account, Supabase project.  
  *Note: CollectWise AI features built-in fallback state with realistic financial records so you can test all UI flows, AI extraction, and payment lifecycles immediately without configuring external accounts.*

### 1. Clone the repository
```bash
git clone https://github.com/your-username/collectwise-ai.git
cd collectwise-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file:
```bash
cp .env.example .env.local
```

Populate the required keys in `.env.local`:
```ini
# Google Gemini API
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-3.8-flash"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"

# Supabase PostgreSQL & Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SECRET_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# PayPal REST API (Sandbox)
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="AVal...your-sandbox-client-id"
PAYPAL_CLIENT_SECRET="EK8...your-sandbox-client-secret"
PAYPAL_WEBHOOK_ID="WH-..."
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase)

CollectWise AI uses a normalized PostgreSQL schema with 11 core tables:
1. `profiles` - User identity & timezone
2. `business_profiles` - Legal business entity, tax ID, and default currency
3. `clients` - Client contacts, credit health, and payment punctuality scores
4. `invoices` - Authoritative invoice ledger with PayPal IDs and payment URLs
5. `invoice_items` - Granular line items (unit price, quantity, deliverables)
6. `payment_events` - Transaction records of settled funds
7. `webhook_events` - Idempotent PayPal notification records (server-only)
8. `activities` - Chronological audit trail of all financial actions
9. `conversations` - Chat session metadata
10. `messages` - Multi-turn conversational records and tool invocation cards
11. `action_approvals` - Human-in-the-loop gates for financial actions

### Applying Migrations
You can execute the migration script via the Supabase Dashboard or CLI:

#### Option A: Supabase Dashboard SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Paste the contents of `supabase/migrations/20261110000001_initial_schema.sql`.
4. Click **Run**.

#### Option B: Supabase CLI
```bash
supabase login
supabase link --project-ref your-project-id
supabase db push
```

See [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) for full policy details.

---

## 💳 PayPal Invoicing API v2 Setup

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Under **Apps & Credentials**, select the **Sandbox** tab and create a **REST API App**.
3. Copy the **Client ID** and **Secret** to your `.env.local`:
   ```ini
   PAYPAL_CLIENT_ID="your_client_id"
   PAYPAL_CLIENT_SECRET="your_client_secret"
   PAYPAL_ENV="sandbox"
   ```
4. Under **Webhooks**, create a webhook pointing to:
   ```
   https://your-domain.vercel.app/api/webhooks/paypal
   ```
   Select event types:
   - `INVOICING.INVOICE.CREATED`
   - `INVOICING.INVOICE.SENT`
   - `INVOICING.INVOICE.PAID`
   - `INVOICING.INVOICE.CANCELLED`
   - `INVOICING.INVOICE.REFUNDED`
5. Copy the generated **Webhook ID** to `PAYPAL_WEBHOOK_ID`.

See [`docs/PAYPAL_INTEGRATION.md`](docs/PAYPAL_INTEGRATION.md) for endpoint contracts and simulation workflows.

---

## 🤖 Gemini AI Tools & Function Calling

CollectWise Assistant uses `@google/genai` with model `gemini-3.8-flash`. All AI operations execute strictly on the server:

| Tool Name | Purpose |
|---|---|
| `get_dashboard_summary` | Fetches real-time receivables, total collected, and collection rate. |
| `list_invoices` | Filters and retrieves active or historical invoices. |
| `get_invoice_details` | Inspects specific invoice line items and payment statuses. |
| `list_overdue_invoices` | Identifies past-due invoices requiring follow-ups. |
| `create_invoice_draft` | Prepares draft from conversational text with date calculations. |
| `draft_payment_reminder` | Composes polite/firm reminders based on client punctuality. |
| `request_paypal_invoice_action` | Gates external PayPal actions behind user approval cards. |
| `get_collection_insights` | Analyzes cash flow velocity and recommends DSO reduction tactics. |

See [`docs/GEMINI_AI_SPECS.md`](docs/GEMINI_AI_SPECS.md) for JSON schemas and safety design.

---

## 🚀 Vercel Deployment Guide

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy CollectWise AI"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/new) and **Import** your repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (`gemini-3.8-flash`)
   - `NEXT_PUBLIC_APP_URL` (`https://your-app.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENV` (`sandbox` or `production`)
   - `PAYPAL_WEBHOOK_ID`
4. Click **Deploy**. Vercel will build the Next.js App Router project and deploy all API route handlers as serverless functions.

See [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md) for zero-downtime configurations.

---

## 🛡️ Security & Financial Compliance

- **No Secret Exposure:** Neither `SUPABASE_SECRET_KEY`, `PAYPAL_CLIENT_SECRET`, nor `GEMINI_API_KEY` are ever sent to or bundled in client browsers.
- **Tenant Isolation:** Every Supabase table enforces PostgreSQL Row Level Security keyed to `auth.uid() = user_id`.
- **Financial Precision:** Currency computations use integer/numeric fixed-point logic (`NUMERIC(14, 2)`) to prevent JavaScript floating-point errors.
- **Authoritative Ledger:** An invoice is marked `PAID` exclusively when confirmed by verified PayPal API responses or signed webhooks—never based on AI hallucinations.
- **Human-in-the-Loop:** Automated follow-ups create pending action approvals that require human verification before dispatching emails or payment requests.

---

## 📄 Open Source License

This project is licensed under the **[MIT License](LICENSE)**:

```text
MIT License

Copyright (c) 2026 COLLECTWISE AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/) to contribute to COLLECTWISE AI.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

