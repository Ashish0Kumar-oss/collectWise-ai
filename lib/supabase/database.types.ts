export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  tax_id: string | null;
  website: string | null;
  logo_url: string | null;
  default_currency: string;
  payment_terms_days: number;
  paypal_merchant_email: string | null;
  reminder_tone: string;
  auto_remind_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string;
  notes: string | null;
  total_invoiced: number;
  total_paid: number;
  outstanding_balance: number;
  payment_punctuality: 'excellent' | 'good' | 'slow' | 'chronic_late';
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  amount: number;
  currency: string;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  paypal_invoice_id: string | null;
  paypal_payment_url: string | null;
  paypal_status: string | null;
  notes: string | null;
  reminder_count: number;
  last_reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  items?: InvoiceItem[];
}

export interface PaymentEvent {
  id: string;
  user_id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paypal_transaction_id: string | null;
  event_timestamp: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
  payload: Record<string, any>;
  processed_at: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  invoice_id: string | null;
  client_id: string | null;
  activity_type:
    | 'INVOICE_CREATED'
    | 'INVOICE_SENT'
    | 'PAYMENT_RECEIVED'
    | 'REMINDER_SENT'
    | 'AI_INSIGHT'
    | 'PAYPAL_SYNC';
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: any;
  tool_results?: any;
  created_at: string;
}

export interface ActionApproval {
  id: string;
  user_id: string;
  action_type: 'CREATE_PAYPAL_INVOICE' | 'SEND_PAYPAL_INVOICE' | 'SEND_PAYMENT_REMINDER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  payload: Record<string, any>;
  summary: string;
  approved_at: string | null;
  executed_at: string | null;
  created_at: string;
}
