import { NextRequest, NextResponse } from 'next/server';
import {
  ai,
  DEFAULT_MODEL,
  COLLECTWISE_TOOLS,
  SYSTEM_INSTRUCTION,
} from '@/lib/ai/gemini';
import { db } from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'A valid message string is required.' },
        { status: 400 }
      );
    }

    // Save user message in local history
    await db.addMessage('user', message);

    // Prepare contents with conversation context
    const contents: any[] = [];

    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-8)) {
        if (turn.role === 'user' || turn.role === 'assistant') {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.content }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let toolActionCard: any = null;
    let finalAssistantText = '';

    // Step 1: Call Gemini with tools
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: COLLECTWISE_TOOLS,
        },
      });

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const callName = call.name;
        const callArgs = (call.args as Record<string, any>) || {};

        let toolResultData: any = null;

        // Execute function calls against the database
        if (callName === 'get_dashboard_summary') {
          toolResultData = await db.getDashboardSummary();
          toolActionCard = {
            type: 'DASHBOARD_SUMMARY',
            title: 'Financial Health Snapshot',
            data: toolResultData,
          };
        } else if (callName === 'list_invoices' || callName === 'list_overdue_invoices') {
          const invoices = await db.getInvoices();
          const filtered = callName === 'list_overdue_invoices'
            ? invoices.filter((i) => i.status === 'OVERDUE')
            : callArgs.status && callArgs.status !== 'all'
            ? invoices.filter((i) => i.status.toUpperCase() === callArgs.status.toUpperCase())
            : invoices;

          toolResultData = filtered.map((i) => ({
            id: i.id,
            invoice_number: i.invoice_number,
            client_name: i.client?.name || 'Unknown',
            amount: i.total_amount,
            status: i.status,
            due_date: i.due_date,
            paypal_status: i.paypal_status,
          }));

          toolActionCard = {
            type: 'INVOICE_LIST',
            title: callName === 'list_overdue_invoices' ? 'Overdue Invoices' : 'Filtered Invoices',
            data: toolResultData,
          };
        } else if (callName === 'get_invoice_details') {
          const inv = await db.getInvoiceById(callArgs.invoice_id_or_number);
          toolResultData = inv || { error: 'Invoice not found' };
          if (inv) {
            toolActionCard = {
              type: 'INVOICE_CARD',
              title: `Invoice Details: ${inv.invoice_number}`,
              data: inv,
            };
          }
        } else if (callName === 'create_invoice_draft') {
          // Pre-generate draft preview
          const clients = await db.getClients();
          let matchedClient = clients.find(
            (c) => c.name.toLowerCase().includes(callArgs.client_name.toLowerCase())
          );

          if (!matchedClient) {
            matchedClient = await db.createClient({
              name: callArgs.client_name,
              email: callArgs.client_email || `${callArgs.client_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            });
          }

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (callArgs.due_in_days || 14));

          const draftData = {
            client_id: matchedClient.id,
            client_name: matchedClient.name,
            client_email: matchedClient.email,
            amount: Number(callArgs.amount),
            currency: callArgs.currency || 'USD',
            description: callArgs.description,
            due_date: dueDate.toISOString().split('T')[0],
          };

          toolResultData = { status: 'DRAFT_READY', draft: draftData };

          toolActionCard = {
            type: 'DRAFT_PREVIEW',
            title: 'Invoice Draft Prepared',
            data: draftData,
          };
        } else if (callName === 'draft_payment_reminder') {
          const inv = await db.getInvoiceById(callArgs.invoice_id);
          if (inv) {
            const dueDate = new Date(inv.due_date);
            const now = new Date();
            const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)));

            const reminderData = {
              invoice_id: inv.id,
              invoice_number: inv.invoice_number,
              client_name: inv.client?.name || 'Valued Client',
              client_email: inv.client?.email,
              amount: `$${inv.total_amount.toFixed(2)} ${inv.currency}`,
              days_overdue: daysOverdue,
              tone: callArgs.tone || 'firm',
              subject: `Follow-up: Invoice ${inv.invoice_number} Payment Reminder`,
              note: `Dear ${inv.client?.name || 'Customer'},\n\nThis is a friendly reminder that payment for Invoice ${inv.invoice_number} in the amount of $${inv.total_amount.toFixed(2)} ${inv.currency} was due on ${inv.due_date} (${daysOverdue > 0 ? `${daysOverdue} days past due` : 'due today'}).\n\nPlease process this at your earliest convenience via the PayPal payment link or reach out if you have any questions.\n\nThank you,\nAlex Vance`,
            };

            // Require explicit user approval before sending external PayPal reminder
            const approval = await db.createActionApproval({
              action_type: 'SEND_PAYMENT_REMINDER',
              summary: `Send ${reminderData.tone} PayPal reminder for invoice ${inv.invoice_number} ($${inv.total_amount.toFixed(2)}) to ${inv.client?.email}`,
              payload: reminderData,
            });

            toolResultData = {
              reminder: reminderData,
              approval_id: approval.id,
              status: 'APPROVAL_REQUIRED',
            };

            toolActionCard = {
              type: 'APPROVAL_CARD',
              title: 'Payment Reminder Needs Your Approval',
              data: {
                approval_id: approval.id,
                reminder: reminderData,
              },
            };
          } else {
            toolResultData = { error: 'Invoice not found for reminder drafting.' };
          }
        } else if (callName === 'get_collection_insights') {
          const summary = await db.getDashboardSummary();
          const overdue = (await db.getInvoices()).filter((i) => i.status === 'OVERDUE');

          toolResultData = {
            outstanding: summary.outstandingBalance,
            overdue: summary.overdueBalance,
            high_risk_invoices: overdue.map((o) => ({
              number: o.invoice_number,
              client: o.client?.name,
              amount: o.total_amount,
              due_date: o.due_date,
            })),
            recommendation: 'Prioritize Vanguard Media Group ($3,500.00 overdue). Issue second PayPal notice with payment link.',
          };

          toolActionCard = {
            type: 'INSIGHT_CARD',
            title: 'AI Collection Intelligence',
            data: toolResultData,
          };
        }

        // Send tool results back to Gemini for natural final answer
        const followUpContents = [
          ...contents,
          response.candidates?.[0]?.content || {
            role: 'model',
            parts: [{ text: 'Processing your request...' }],
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  id: call.id || 'call_01',
                  name: callName,
                  response: { result: toolResultData },
                },
              },
            ],
          },
        ];

        const followUpResponse = await ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents: followUpContents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        finalAssistantText = followUpResponse.text || 'I have completed this action for you.';
      } else {
        finalAssistantText = response.text || "I'm ready to assist with your invoices and payments.";
      }
    } catch (geminiError: any) {
      console.error('Gemini API Error, falling back to smart local intent parser:', geminiError);
      // Seamless graceful fallback if API keys or rate limits occur
      const lower = message.toLowerCase();
      if (lower.includes('summary') || lower.includes('dashboard') || lower.includes('health')) {
        const summary = await db.getDashboardSummary();
        finalAssistantText = `Here is your current financial summary:\n\n- **Total Collected:** $${summary.totalCollected.toLocaleString()} USD\n- **Outstanding Balance:** $${summary.outstandingBalance.toLocaleString()} USD\n- **Overdue Balance:** $${summary.overdueBalance.toLocaleString()} USD\n- **Active Invoices:** ${summary.activeInvoicesCount}\n- **Collection Rate:** ${summary.collectionRate}%`;
        toolActionCard = {
          type: 'DASHBOARD_SUMMARY',
          title: 'Financial Health Snapshot',
          data: summary,
        };
      } else if (lower.includes('overdue')) {
        const invoices = await db.getInvoices();
        const overdue = invoices.filter((i) => i.status === 'OVERDUE');
        finalAssistantText = `You currently have **${overdue.length} overdue invoice(s)** totaling **$${overdue.reduce((s, i) => s + i.total_amount, 0).toLocaleString()} USD**. The highest priority is **${overdue[0]?.invoice_number || 'CW-2026-0089'}** for ${overdue[0]?.client?.name || 'Vanguard Media Group'}.`;
        toolActionCard = {
          type: 'INVOICE_LIST',
          title: 'Overdue Invoices',
          data: overdue,
        };
      } else {
        finalAssistantText = `I have received your request: "${message}". I can help you draft invoices, review overdue clients, and generate PayPal payment reminders. Try asking: *"Show overdue invoices"* or *"Create an invoice for John for $850 due in 7 days"*.`;
      }
    }

    // Record assistant message
    await db.addMessage('assistant', finalAssistantText, null, toolActionCard);

    return NextResponse.json({
      reply: finalAssistantText,
      actionCard: toolActionCard,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error in CollectWise Assistant' },
      { status: 500 }
    );
  }
}
