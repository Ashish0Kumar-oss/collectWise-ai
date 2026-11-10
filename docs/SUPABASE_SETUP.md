# Supabase PostgreSQL & Authentication Setup Guide

**COLLECTWISE AI**  
*Get Paid Faster. Let AI Handle the Follow-ups.*

---

## 1. Prerequisites
1. A Supabase account ([supabase.com](https://supabase.com)).
2. A new or existing Supabase project.

---

## 2. Environment Variables

In your project `.env.local` or Vercel Environment Variables:

```ini
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SECRET_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> **Warning:** Never expose `SUPABASE_SECRET_KEY` (service role) to the browser. It should only be used by server-side operations (such as webhook verification or administrative database seeding).

---

## 3. Database Schema Migration

The complete SQL migration script is located at:
`supabase/migrations/20261110000001_initial_schema.sql`

### How to Apply:

#### Method A: Supabase Web Console
1. Navigate to your Supabase Project dashboard.
2. Click on the **SQL Editor** icon in the left navigation.
3. Click **New Query**.
4. Open `supabase/migrations/20261110000001_initial_schema.sql` and paste the entire SQL content into the editor.
5. Click **Run**.

#### Method B: Supabase CLI
```bash
# Log in to Supabase CLI
supabase login

# Link your local project to your remote Supabase instance
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

---

## 4. Tables Created

| Table Name | Description | RLS Policy |
|---|---|---|
| `profiles` | User account settings, name, and timezone. | `auth.uid() = id` |
| `business_profiles` | Merchant business profile, tax ID, and default currency. | `auth.uid() = user_id` |
| `clients` | Client directory, address, and payment punctuality scores. | `auth.uid() = user_id` |
| `invoices` | Authoritative invoice ledger with PayPal IDs & statuses. | `auth.uid() = user_id` |
| `invoice_items` | Individual line items and deliverables. | Linked through invoice user ownership |
| `payment_events` | Ledger of settled payment transactions. | `auth.uid() = user_id` |
| `webhook_events` | PayPal webhook event history for idempotent processing. | **Service-role only** (No public access) |
| `activities` | Chronological audit trail of all financial actions. | `auth.uid() = user_id` |
| `conversations` | AI chat session records. | `auth.uid() = user_id` |
| `messages` | Chat messages and function calling invocation cards. | `auth.uid() = user_id` |
| `action_approvals` | Human-in-the-loop action approval gates. | `auth.uid() = user_id` |

---

## 5. Row Level Security (RLS) Verification

You can verify that RLS is active by executing:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All 11 tables will return `rowsecurity = true`.

---

## 6. Authentication Setup (Google & Email)

1. In the Supabase Dashboard, navigate to **Authentication** > **Providers**.
2. **Email Provider:**
   - Ensure "Email" is enabled.
   - For rapid development/demo, you may uncheck "Confirm email" if desired.
3. **Google OAuth:**
   - Enable "Google".
   - Enter your **Google Client ID** and **Google Client Secret** from Google Cloud Console.
   - Add the Authorized Redirect URI provided by Supabase into your Google Cloud OAuth Consent settings.
