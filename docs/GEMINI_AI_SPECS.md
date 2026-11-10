# Google Gemini AI Specification & Function Calling

**COLLECTWISE AI**  
*Get Paid Faster. Let AI Handle the Follow-ups.*

---

## 1. Overview

CollectWise AI uses Google's modern `@google/genai` TypeScript SDK exclusively on the server side (`lib/ai/gemini.ts`).

- **Model:** `gemini-3.8-flash` (Configurable via `GEMINI_MODEL`)
- **Telemetry:** Header `User-Agent: aistudio-build` configured in `httpOptions`
- **Capabilities:**
  1. Multi-turn Conversational Co-pilot
  2. 8 Operational Financial Tools with Function Calling
  3. Structured Natural Language Invoice Extraction (`responseSchema`)
  4. Algorithmic Collection Risk & DSO Recommendations
  5. Human-in-the-Loop Action Approvals

---

## 2. Gemini Function Declarations (Tools)

### 1. `get_dashboard_summary`
- **Description:** Retrieve real-time financial metrics including total collected, outstanding balance, overdue balance, and collection rate.
- **Parameters:** None.
- **Returns:** `{ totalCollected, outstandingBalance, overdueBalance, activeInvoicesCount, collectionRate, currency }`

### 2. `list_invoices`
- **Description:** List invoices filtered by status (`DRAFT`, `SENT`, `PAID`, `OVERDUE`) or client.
- **Parameters:** `{ status?: string }`

### 3. `get_invoice_details`
- **Description:** Inspect detailed information about a specific invoice by its internal ID or invoice number (e.g. `CW-2026-0089`).
- **Parameters:** `{ invoice_id_or_number: string }` (Required)

### 4. `list_overdue_invoices`
- **Description:** Retrieve all overdue invoices that need immediate follow-up or payment reminders.
- **Parameters:** None.

### 5. `create_invoice_draft`
- **Description:** Prepare an invoice draft from natural language extraction for user review before PayPal creation.
- **Parameters:**
  ```ts
  {
    client_name: string;      // Required
    client_email?: string;    // Optional
    amount: number;           // Required (e.g. 850)
    currency?: string;        // Default "USD"
    description: string;      // Required
    due_in_days?: number;     // Default 14
  }
  ```

### 6. `draft_payment_reminder`
- **Description:** Draft an effective, polite yet firm collection email reminder tailored to the invoice and client punctuality history.
- **Parameters:**
  ```ts
  {
    invoice_id: string;                                 // Required
    tone?: 'polite' | 'firm' | 'urgent' | 'friendly';  // Default "firm"
  }
  ```

### 7. `request_paypal_invoice_action`
- **Description:** Request formal user approval to create or send an authoritative PayPal invoice.
- **Parameters:**
  ```ts
  {
    action: 'CREATE_PAYPAL_INVOICE' | 'SEND_PAYPAL_INVOICE';
    client_name: string;
    amount: number;
    summary: string;
  }
  ```

### 8. `get_collection_insights`
- **Description:** Analyze overall receivables and identify high-risk accounts and collection recommendations.
- **Parameters:** None.

---

## 3. Structured Output Schema (Invoice Extraction)

Endpoint: `POST /api/assistant/extract-invoice`

Gemini uses strict JSON extraction schemas (`responseMimeType: "application/json"`):

```ts
responseSchema: {
  type: Type.OBJECT,
  properties: {
    client_name: { type: Type.STRING },
    client_email: { type: Type.STRING },
    amount: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    description: { type: Type.STRING },
    issue_date: { type: Type.STRING },
    due_date: { type: Type.STRING },
    tax_rate: { type: Type.NUMBER },
  },
  required: ['client_name', 'amount', 'description', 'due_date'],
}
```

---

## 4. Financial Safety & Human-in-the-Loop Rules

1. **No Direct Execution of Financial Transfers:** Gemini suggests actions; it does not unilaterally execute fund transfers or unconfirmed invoice dispatches.
2. **Action Approvals:** When a reminder is drafted, an `ActionApproval` record is inserted with `status: 'PENDING'`. The assistant renders an interactive approval card with the drafted subject and note. The user must click **"Approve & Dispatch"** to trigger the real PayPal reminder.
3. **Punctuality-Aware Tone:** 
   - `chronic_late` debtors receive firm reminders with clear settlement deadlines.
   - `good` and `excellent` debtors receive gentle check-ins to preserve relationship trust.
