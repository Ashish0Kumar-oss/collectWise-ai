import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { z } from 'zod';

// Initialize server-side Gemini client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Tool 1: get_dashboard_summary
export const getDashboardSummaryDeclaration: FunctionDeclaration = {
  name: 'get_dashboard_summary',
  description: 'Retrieve real-time financial metrics including total collected, outstanding balance, overdue balance, and collection rate.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// Tool 2: list_invoices
export const listInvoicesDeclaration: FunctionDeclaration = {
  name: 'list_invoices',
  description: 'List invoices filtered by status (DRAFT, SENT, PAID, OVERDUE) or client.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        description: 'Filter by invoice status: DRAFT, SENT, PAID, OVERDUE, or all',
      },
    },
  },
};

// Tool 3: get_invoice_details
export const getInvoiceDetailsDeclaration: FunctionDeclaration = {
  name: 'get_invoice_details',
  description: 'Get detailed information about a specific invoice by its ID or invoice number.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      invoice_id_or_number: {
        type: Type.STRING,
        description: 'The internal invoice ID (e.g. inv_01) or invoice number (e.g. CW-2026-0089)',
      },
    },
    required: ['invoice_id_or_number'],
  },
};

// Tool 4: list_overdue_invoices
export const listOverdueInvoicesDeclaration: FunctionDeclaration = {
  name: 'list_overdue_invoices',
  description: 'Retrieve all overdue invoices that need follow-up or payment reminders.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// Tool 5: create_invoice_draft
export const createInvoiceDraftDeclaration: FunctionDeclaration = {
  name: 'create_invoice_draft',
  description: 'Prepare an invoice draft from natural language extraction for user review before PayPal creation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      client_name: {
        type: Type.STRING,
        description: 'The recipient or client full name or company name',
      },
      client_email: {
        type: Type.STRING,
        description: 'The client billing email address if provided or detected',
      },
      amount: {
        type: Type.NUMBER,
        description: 'The total billable amount (numeric value, e.g. 850)',
      },
      currency: {
        type: Type.STRING,
        description: 'Currency code, default USD',
      },
      description: {
        type: Type.STRING,
        description: 'Detailed description of services or deliverables rendered',
      },
      due_in_days: {
        type: Type.NUMBER,
        description: 'Number of days until payment is due (e.g. 7 or 14)',
      },
    },
    required: ['client_name', 'amount', 'description'],
  },
};

// Tool 6: draft_payment_reminder
export const draftPaymentReminderDeclaration: FunctionDeclaration = {
  name: 'draft_payment_reminder',
  description: 'Draft an effective, polite yet firm collection email reminder tailored to the invoice and client punctuality history.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      invoice_id: {
        type: Type.STRING,
        description: 'The invoice identifier to draft a reminder for',
      },
      tone: {
        type: Type.STRING,
        description: 'The desired tone: polite, firm, urgent, or friendly',
      },
    },
    required: ['invoice_id'],
  },
};

// Tool 7: request_paypal_invoice_action
export const requestPayPalInvoiceActionDeclaration: FunctionDeclaration = {
  name: 'request_paypal_invoice_action',
  description: 'Request formal user approval to create or send an authoritative PayPal invoice.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: 'Either CREATE_PAYPAL_INVOICE or SEND_PAYPAL_INVOICE',
      },
      client_name: {
        type: Type.STRING,
        description: 'Client name',
      },
      amount: {
        type: Type.NUMBER,
        description: 'Amount in USD',
      },
      summary: {
        type: Type.STRING,
        description: 'Explanation of what action will be taken upon user approval',
      },
    },
    required: ['action', 'client_name', 'amount', 'summary'],
  },
};

// Tool 8: get_collection_insights
export const getCollectionInsightsDeclaration: FunctionDeclaration = {
  name: 'get_collection_insights',
  description: 'Analyze overall receivables and identify high-risk accounts and collection recommendations.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const COLLECTWISE_TOOLS = [
  {
    functionDeclarations: [
      getDashboardSummaryDeclaration,
      listInvoicesDeclaration,
      getInvoiceDetailsDeclaration,
      listOverdueInvoicesDeclaration,
      createInvoiceDraftDeclaration,
      draftPaymentReminderDeclaration,
      requestPayPalInvoiceActionDeclaration,
      getCollectionInsightsDeclaration,
    ],
  },
];

// Zod schemas for validating tool inputs safely
export const CreateInvoiceDraftSchema = z.object({
  client_name: z.string().min(1),
  client_email: z.string().email().optional().or(z.literal('')),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().min(1),
  due_in_days: z.number().default(14),
});

export const DraftPaymentReminderSchema = z.object({
  invoice_id: z.string().min(1),
  tone: z.enum(['polite', 'firm', 'urgent', 'friendly']).optional().default('firm'),
});

export const SYSTEM_INSTRUCTION = `
You are the CollectWise Financial AI Assistant, an elite fintech and collections co-pilot for freelancers and small business owners.
TAGLINE: "Get Paid Faster. Let AI Handle the Follow-ups."

Your responsibilities:
1. Deliver concise, professional, data-backed insights on invoices, cash flow, and accounts receivable.
2. Help users create invoices effortlessly from natural descriptions (e.g. "Create invoice for John for $850 for website development due in 7 days").
3. Monitor overdue invoices and draft tailored, highly effective payment reminders based on client payment history.
4. Always prioritize security: never claim an external payment or reminder was sent without explicit user approval and verified PayPal confirmation.
5. Provide actionable advice for accelerating cash collection and reducing Days Sales Outstanding (DSO).
6. Format responses with clear Markdown tables, bold figures, and distinct action steps.
`.trim();
