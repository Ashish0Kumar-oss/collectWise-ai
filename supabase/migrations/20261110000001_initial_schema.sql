-- ==============================================================================
-- COLLECTWISE AI: PostgreSQL Schema for Supabase
-- Tables:
--  1. profiles
--  2. business_profiles
--  3. clients
--  4. invoices
--  5. invoice_items
--  6. payment_events
--  7. webhook_events
--  8. activities
--  9. conversations
-- 10. messages
-- 11. action_approvals
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    tax_id TEXT,
    website TEXT,
    logo_url TEXT,
    default_currency TEXT DEFAULT 'USD' NOT NULL,
    payment_terms_days INTEGER DEFAULT 14 NOT NULL,
    paypal_merchant_email TEXT,
    reminder_tone TEXT DEFAULT 'polite_firm',
    auto_remind_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_business_user UNIQUE(user_id)
);

-- 3. CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country_code TEXT DEFAULT 'US',
    notes TEXT,
    total_invoiced NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    total_paid NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    outstanding_balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    payment_punctuality TEXT DEFAULT 'good', -- 'excellent', 'good', 'slow', 'chronic_late'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT' NOT NULL, -- 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'
    amount NUMERIC(14, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    paid_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    paypal_invoice_id TEXT,
    paypal_payment_url TEXT,
    paypal_status TEXT,
    notes TEXT,
    reminder_count INTEGER DEFAULT 0 NOT NULL,
    last_reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_invoice_user_number UNIQUE(user_id, invoice_number)
);

-- 5. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
    unit_price NUMERIC(14, 2) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PAYMENT EVENTS
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    status TEXT NOT NULL, -- 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
    provider TEXT DEFAULT 'PAYPAL' NOT NULL,
    paypal_transaction_id TEXT,
    event_timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. WEBHOOK EVENTS (Protected: Server/Service-Role access only)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    status TEXT DEFAULT 'PROCESSED' NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- 'INVOICE_CREATED', 'INVOICE_SENT', 'PAYMENT_RECEIVED', 'REMINDER_SENT', 'AI_INSIGHT', 'PAYPAL_SYNC'
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Financial Assistant Session' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    tool_calls JSONB,
    tool_results JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. ACTION APPROVALS (Human-In-The-Loop AI Safety for Financial Operations)
CREATE TABLE IF NOT EXISTS public.action_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'CREATE_PAYPAL_INVOICE', 'SEND_PAYPAL_INVOICE', 'SEND_PAYMENT_REMINDER'
    status TEXT DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'EXECUTED'
    payload JSONB NOT NULL,
    summary TEXT NOT NULL,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_paypal_id ON public.invoices(paypal_invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_user ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_time ON public.activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_action_approvals_user_status ON public.action_approvals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_webhook_event_id ON public.webhook_events(event_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring auth.uid() matches user_id
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_approvals ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view and manage their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Business Profiles
CREATE POLICY "Users can view and manage their business profile"
    ON public.business_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users can manage their clients"
    ON public.clients FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Invoices
CREATE POLICY "Users can manage their invoices"
    ON public.invoices FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Invoice items (linked through invoice user ownership)
CREATE POLICY "Users can manage their invoice items"
    ON public.invoice_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE public.invoices.id = public.invoice_items.invoice_id
            AND public.invoices.user_id = auth.uid()
        )
    );

-- Payment events
CREATE POLICY "Users can view their payment events"
    ON public.payment_events FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Webhook events: NEVER accessible to client/browser tokens. Only service_role can access.
-- No public user policy created for webhook_events, meaning all normal users get denied by default.

-- Activities
CREATE POLICY "Users can manage their activities"
    ON public.activities FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Conversations
CREATE POLICY "Users can manage their conversations"
    ON public.conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can manage their messages"
    ON public.messages FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Action approvals
CREATE POLICY "Users can manage their action approvals"
    ON public.action_approvals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
