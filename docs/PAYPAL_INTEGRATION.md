# PayPal Invoicing API v2 & Webhook Setup Guide

**COLLECTWISE AI**  
*Get Paid Faster. Let AI Handle the Follow-ups.*

---

## 1. PayPal Developer Credentials

CollectWise AI interacts directly with **PayPal Invoicing API v2**.

### Obtaining Sandbox Credentials:
1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Under **Testing Tools**, select **Sandbox Accounts** to view your default merchant and personal test accounts.
3. Under **Apps & Credentials**, click **Create App**:
   - App Type: **Merchant**
   - Sandbox developer account: Select your facilitator/merchant business account.
4. Copy the generated **Client ID** and **Client Secret**.

### Configure Environment Variables:
```ini
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="AVal..."
PAYPAL_CLIENT_SECRET="EK8..."
```

---

## 2. Invoicing API v2 Endpoints Utilized

All calls are routed through `lib/paypal/invoices.ts` and `lib/paypal/client.ts`:

1. **OAuth 2.0 Token Generation:**
   `POST /v1/oauth2/token` (cached in memory with expiration safeguards)
2. **Generate Next Invoice Number:**
   `POST /v2/invoicing/generate-next-invoice-number`
3. **Create Draft Invoice:**
   `POST /v2/invoicing/invoices`
4. **Send Invoice:**
   `POST /v2/invoicing/invoices/{invoice_id}/send`
5. **Get Invoice Details:**
   `GET /v2/invoicing/invoices/{invoice_id}`
6. **Send Payment Reminder:**
   `POST /v2/invoicing/invoices/{invoice_id}/remind`
7. **Cancel Invoice:**
   `POST /v2/invoicing/invoices/{invoice_id}/cancel`

---

## 3. PayPal Webhook Configuration

Webhooks ensure that when a client settles an invoice through PayPal, CollectWise AI automatically verifies the payment, updates the invoice status to `PAID`, credits the client's balance, and logs the activity.

### Setting Up the Webhook:
1. In your PayPal Developer Dashboard, go to your app settings.
2. Under **Webhooks**, click **Add Webhook**.
3. Set the **Webhook URL**:
   ```
   https://your-domain.vercel.app/api/webhooks/paypal
   ```
4. Subscribe to the following Event Types:
   - `INVOICING.INVOICE.CREATED`
   - `INVOICING.INVOICE.SENT`
   - `INVOICING.INVOICE.UPDATED`
   - `INVOICING.INVOICE.PAID`
   - `INVOICING.INVOICE.CANCELLED`
   - `INVOICING.INVOICE.REFUNDED`
5. Copy the **Webhook ID** into `.env.local`:
   ```ini
   PAYPAL_WEBHOOK_ID="WH-..."
   ```

---

## 4. Idempotency & Cryptographic Verification

The webhook endpoint (`POST /api/webhooks/paypal`) executes two critical checks before touching the ledger:

1. **Signature Verification:**
   Verifies transmission headers (`paypal-auth-algo`, `paypal-cert-url`, `paypal-transmission-id`, `paypal-transmission-sig`, `paypal-transmission-time`) against PayPal's verification endpoint:
   `POST /v1/notifications/verify-webhook-signature`
2. **Idempotency Guard:**
   Checks incoming `event_id` against the database to guarantee that network retries never record duplicate payments or double-credit client accounts.

---

## 5. Testing with the Built-In Sandbox Simulator

If you do not have live sandbox credentials yet, CollectWise AI includes a **Sandbox Payment Simulator** (`POST /api/invoices/[id]/pay-sim`):
1. Navigate to **Invoices** in the UI.
2. Click **"Simulate Pay"** on any active invoice.
3. The platform executes the authoritative settlement lifecycle:
   - Invoice marked `PAID`.
   - Outstanding receivables decremented.
   - Client lifetime paid balance credited.
   - Financial audit event logged.
   - Dashboard collection efficiency chart recalculated.
