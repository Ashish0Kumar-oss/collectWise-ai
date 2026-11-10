import {
  Profile,
  BusinessProfile,
  Client,
  Invoice,
  InvoiceItem,
  Activity,
  ActionApproval,
  Message,
} from '@/lib/supabase/database.types';
import {
  INITIAL_PROFILE,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_ACTIVITIES,
  INITIAL_ACTION_APPROVALS,
  INITIAL_MESSAGES,
} from './mock-data';

// In-memory persistent state for serverless execution and preview demonstrations
class MemoryStore {
  profile: Profile = { ...INITIAL_PROFILE };
  businessProfile: BusinessProfile = { ...INITIAL_BUSINESS_PROFILE };
  clients: Client[] = [...INITIAL_CLIENTS];
  invoices: Invoice[] = [...INITIAL_INVOICES];
  activities: Activity[] = [...INITIAL_ACTIVITIES];
  actionApprovals: ActionApproval[] = [...INITIAL_ACTION_APPROVALS];
  messages: Message[] = [...INITIAL_MESSAGES];
}

// Global singleton to preserve state across Route Handler invocations in same node process
const globalForStore = globalThis as unknown as { collectWiseStore?: MemoryStore };
export const store = globalForStore.collectWiseStore ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.collectWiseStore = store;

/**
 * Repository interface providing high level financial operations
 */
export const db = {
  // Profiles
  async getProfile(): Promise<Profile> {
    return store.profile;
  },

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    store.profile = { ...store.profile, ...updates, updated_at: new Date().toISOString() };
    return store.profile;
  },

  async getBusinessProfile(): Promise<BusinessProfile> {
    return store.businessProfile;
  },

  async updateBusinessProfile(updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    store.businessProfile = { ...store.businessProfile, ...updates, updated_at: new Date().toISOString() };
    return store.businessProfile;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    return [...store.clients];
  },

  async getClientById(id: string): Promise<Client | null> {
    const client = store.clients.find((c) => c.id === id);
    return client ? { ...client } : null;
  },

  async createClient(data: { name: string; email: string } & Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Client> {
    const newClient: Client = {
      id: `cli_${Date.now().toString().slice(-6)}`,
      user_id: store.profile.id,
      name: data.name,
      email: data.email,
      company_name: data.company_name || data.name,
      phone: data.phone || null,
      address_line1: data.address_line1 || null,
      city: data.city || null,
      state: data.state || null,
      postal_code: data.postal_code || null,
      country_code: data.country_code || 'US',
      notes: data.notes || null,
      total_invoiced: data.total_invoiced ?? 0,
      total_paid: data.total_paid ?? 0,
      outstanding_balance: data.outstanding_balance ?? 0,
      payment_punctuality: data.payment_punctuality ?? 'good',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.clients.unshift(newClient);

    await this.logActivity({
      activity_type: 'AI_INSIGHT',
      title: 'New Client Profile Created',
      description: `Added ${newClient.name} (${newClient.email}) to client database.`,
      client_id: newClient.id,
    });

    return newClient;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const index = store.clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    store.clients[index] = {
      ...store.clients[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.clients[index];
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    // Attach client objects
    return store.invoices.map((inv) => {
      const client = store.clients.find((c) => c.id === inv.client_id);
      return {
        ...inv,
        client,
      };
    });
  },

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const inv = store.invoices.find((i) => i.id === id || i.invoice_number === id);
    if (!inv) return null;
    const client = store.clients.find((c) => c.id === inv.client_id);
    return { ...inv, client };
  },

  async createInvoice(data: {
    client_id: string;
    invoice_number?: string;
    amount: number;
    currency?: string;
    tax_rate?: number;
    issue_date?: string;
    due_date: string;
    notes?: string;
    items: Array<{ description: string; quantity: number; unit_price: number }>;
    paypal_invoice_id?: string | null;
    paypal_payment_url?: string | null;
    paypal_status?: string | null;
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  }): Promise<Invoice> {
    const invId = `inv_${Date.now().toString().slice(-6)}`;
    const taxRate = data.tax_rate ?? 0;
    const taxAmount = Number(((data.amount * taxRate) / 100).toFixed(2));
    const totalAmount = Number((data.amount + taxAmount).toFixed(2));

    const invoiceItems: InvoiceItem[] = data.items.map((item, idx) => ({
      id: `itm_${Date.now().toString().slice(-4)}_${idx}`,
      invoice_id: invId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: Number((item.quantity * item.unit_price).toFixed(2)),
      created_at: new Date().toISOString(),
    }));

    const invoice: Invoice = {
      id: invId,
      user_id: store.profile.id,
      client_id: data.client_id,
      invoice_number: data.invoice_number || `CW-2026-${Date.now().toString().slice(-4)}`,
      status: data.status || 'DRAFT',
      amount: data.amount,
      currency: data.currency || 'USD',
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: data.status === 'PAID' ? totalAmount : 0,
      issue_date: data.issue_date || new Date().toISOString().split('T')[0],
      due_date: data.due_date,
      paid_date: data.status === 'PAID' ? new Date().toISOString() : null,
      paypal_invoice_id: data.paypal_invoice_id || null,
      paypal_payment_url: data.paypal_payment_url || null,
      paypal_status: data.paypal_status || (data.status === 'DRAFT' ? 'DRAFT' : 'SENT'),
      notes: data.notes || null,
      reminder_count: 0,
      last_reminder_sent_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: invoiceItems,
    };

    store.invoices.unshift(invoice);

    // Update client balance
    const client = store.clients.find((c) => c.id === data.client_id);
    if (client) {
      client.total_invoiced = Number((client.total_invoiced + totalAmount).toFixed(2));
      if (invoice.status !== 'PAID') {
        client.outstanding_balance = Number((client.outstanding_balance + totalAmount).toFixed(2));
      } else {
        client.total_paid = Number((client.total_paid + totalAmount).toFixed(2));
      }
    }

    await this.logActivity({
      activity_type: 'INVOICE_CREATED',
      title: `Invoice ${invoice.invoice_number} Created`,
      description: `Created invoice for ${client?.name || 'Client'} for $${totalAmount.toFixed(2)} USD.`,
      invoice_id: invoice.id,
      client_id: invoice.client_id,
    });

    return invoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const index = store.invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = store.invoices[index];
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    store.invoices[index] = updated;

    // If marked paid, update client statistics
    if (updates.status === 'PAID' && current.status !== 'PAID') {
      const client = store.clients.find((c) => c.id === updated.client_id);
      if (client) {
        client.outstanding_balance = Math.max(0, Number((client.outstanding_balance - updated.total_amount).toFixed(2)));
        client.total_paid = Number((client.total_paid + updated.total_amount).toFixed(2));
      }

      await this.logActivity({
        activity_type: 'PAYMENT_RECEIVED',
        title: `Payment Received: ${updated.invoice_number}`,
        description: `Full payment of $${updated.total_amount.toFixed(2)} received and marked as PAID.`,
        invoice_id: updated.id,
        client_id: updated.client_id,
      });
    }

    return updated;
  },

  async markInvoiceSent(id: string, paypalId?: string, paymentUrl?: string): Promise<Invoice | null> {
    const inv = store.invoices.find((i) => i.id === id);
    if (!inv) return null;

    inv.status = 'SENT';
    inv.paypal_status = 'SENT';
    if (paypalId) inv.paypal_invoice_id = paypalId;
    if (paymentUrl) inv.paypal_payment_url = paymentUrl;
    inv.updated_at = new Date().toISOString();

    const client = store.clients.find((c) => c.id === inv.client_id);

    await this.logActivity({
      activity_type: 'INVOICE_SENT',
      title: `Invoice ${inv.invoice_number} Dispatched`,
      description: `Sent to ${client?.email || 'client'} via PayPal Invoicing.`,
      invoice_id: inv.id,
      client_id: inv.client_id,
    });

    return inv;
  },

  async recordReminderSent(id: string): Promise<Invoice | null> {
    const inv = store.invoices.find((i) => i.id === id);
    if (!inv) return null;

    inv.reminder_count += 1;
    inv.last_reminder_sent_at = new Date().toISOString();
    inv.updated_at = new Date().toISOString();

    const client = store.clients.find((c) => c.id === inv.client_id);

    await this.logActivity({
      activity_type: 'REMINDER_SENT',
      title: `Payment Reminder #${inv.reminder_count} Sent`,
      description: `Delivered follow-up notification to ${client?.email} for invoice ${inv.invoice_number} ($${inv.total_amount.toFixed(2)}).`,
      invoice_id: inv.id,
      client_id: inv.client_id,
    });

    return inv;
  },

  // Activities
  async getActivities(limit = 20): Promise<Activity[]> {
    return store.activities.slice(0, limit);
  },

  async logActivity(data: {
    activity_type: Activity['activity_type'];
    title: string;
    description: string;
    invoice_id?: string | null;
    client_id?: string | null;
    metadata?: Record<string, any>;
  }): Promise<Activity> {
    const act: Activity = {
      id: `act_${Date.now().toString().slice(-6)}`,
      user_id: store.profile.id,
      activity_type: data.activity_type,
      title: data.title,
      description: data.description,
      invoice_id: data.invoice_id || null,
      client_id: data.client_id || null,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
    };
    store.activities.unshift(act);
    return act;
  },

  // Action Approvals (Safety gate for AI actions)
  async getActionApprovals(): Promise<ActionApproval[]> {
    return [...store.actionApprovals];
  },

  async createActionApproval(data: {
    action_type: ActionApproval['action_type'];
    summary: string;
    payload: Record<string, any>;
  }): Promise<ActionApproval> {
    const approval: ActionApproval = {
      id: `apr_${Date.now().toString().slice(-6)}`,
      user_id: store.profile.id,
      action_type: data.action_type,
      status: 'PENDING',
      summary: data.summary,
      payload: data.payload,
      approved_at: null,
      executed_at: null,
      created_at: new Date().toISOString(),
    };
    store.actionApprovals.unshift(approval);
    return approval;
  },

  async updateActionApproval(id: string, status: 'APPROVED' | 'REJECTED' | 'EXECUTED'): Promise<ActionApproval | null> {
    const item = store.actionApprovals.find((a) => a.id === id);
    if (!item) return null;
    item.status = status;
    if (status === 'APPROVED') item.approved_at = new Date().toISOString();
    if (status === 'EXECUTED') item.executed_at = new Date().toISOString();
    return item;
  },

  // Chat Messages
  async getMessages(): Promise<Message[]> {
    return [...store.messages];
  },

  async addMessage(role: 'user' | 'assistant' | 'system', content: string, toolCalls?: any, toolResults?: any): Promise<Message> {
    const msg: Message = {
      id: `msg_${Date.now().toString().slice(-6)}`,
      conversation_id: 'conv_01',
      user_id: store.profile.id,
      role,
      content,
      tool_calls: toolCalls,
      tool_results: toolResults,
      created_at: new Date().toISOString(),
    };
    store.messages.push(msg);
    return msg;
  },

  // Dashboard Financial Analytics Calculations
  async getDashboardSummary() {
    const invoices = store.invoices;
    const now = new Date();

    let totalCollected = 0;
    let outstandingBalance = 0;
    let overdueBalance = 0;
    let activeInvoicesCount = 0;
    let overdueInvoicesCount = 0;

    for (const inv of invoices) {
      if (inv.status === 'PAID') {
        totalCollected += inv.paid_amount || inv.total_amount;
      } else if (inv.status === 'CANCELLED' || inv.status === 'REFUNDED') {
        // Ignored
      } else {
        // Active (DRAFT, SENT, OVERDUE)
        activeInvoicesCount += 1;
        const due = new Date(inv.due_date);
        const isPastDue = due < now || inv.status === 'OVERDUE';

        outstandingBalance += inv.total_amount - (inv.paid_amount || 0);

        if (isPastDue) {
          overdueBalance += inv.total_amount - (inv.paid_amount || 0);
          overdueInvoicesCount += 1;
        }
      }
    }

    const collectionRate = totalCollected + outstandingBalance > 0
      ? Number(((totalCollected / (totalCollected + outstandingBalance)) * 100).toFixed(1))
      : 100;

    return {
      totalCollected: Number(totalCollected.toFixed(2)),
      outstandingBalance: Number(outstandingBalance.toFixed(2)),
      overdueBalance: Number(overdueBalance.toFixed(2)),
      activeInvoicesCount,
      overdueInvoicesCount,
      collectionRate,
      currency: store.businessProfile.default_currency,
      clientCount: store.clients.length,
    };
  },
};
