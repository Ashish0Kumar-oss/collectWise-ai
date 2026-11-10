export interface PayPalTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PayPalMoney {
  currency_code: string;
  value: string; // "850.00"
}

export interface PayPalInvoiceItem {
  name: string;
  description?: string;
  quantity: string; // "1"
  unit_amount: PayPalMoney;
  tax?: {
    name?: string;
    percent?: string;
    amount?: PayPalMoney;
  };
}

export interface PayPalRecipient {
  billing_info: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address: string;
    phones?: Array<{
      country_code?: string;
      national_number?: string;
      phone_type?: string;
    }>;
  };
}

export interface PayPalInvoicePayload {
  detail: {
    invoice_number?: string;
    reference?: string;
    invoice_date: string; // "YYYY-MM-DD"
    currency_code: string;
    note?: string;
    term?: string;
    payment_term?: {
      term_type?: string;
      due_date?: string; // "YYYY-MM-DD"
    };
  };
  invoicer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
    business_name?: string;
  };
  primary_recipients: PayPalRecipient[];
  items: PayPalInvoiceItem[];
  configuration?: {
    allow_tip?: boolean;
    tax_calculated_after_discount?: boolean;
    tax_inclusive?: boolean;
  };
  amount?: {
    breakdown?: {
      custom?: PayPalMoney;
      shipping?: PayPalMoney;
      discount?: {
        invoice_discount?: PayPalMoney;
      };
      tax_total?: PayPalMoney;
      item_total?: PayPalMoney;
    };
  };
}

export interface PayPalInvoiceResponse {
  id: string;
  status: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'PAID' | 'MARKED_AS_PAID' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_PAID' | 'PAYMENT_PENDING';
  detail: {
    invoice_number: string;
    invoice_date: string;
    currency_code: string;
    note?: string;
    payment_term?: {
      due_date?: string;
    };
    metadata?: {
      create_time?: string;
      recipient_view_url?: string;
      invoicer_view_url?: string;
    };
  };
  amount: {
    currency_code: string;
    value: string;
    breakdown?: any;
  };
  due_amount?: {
    currency_code: string;
    value: string;
  };
  primary_recipients: PayPalRecipient[];
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalReminderPayload {
  subject?: string;
  note?: string;
  send_to_invoicer?: boolean;
  additional_recipients?: string[];
}

export interface PayPalWebhookVerificationPayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: Record<string, any>;
}
