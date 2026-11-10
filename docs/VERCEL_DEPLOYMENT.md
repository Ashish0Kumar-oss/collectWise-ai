# Vercel Production Deployment Guide

**COLLECTWISE AI**  
*Get Paid Faster. Let AI Handle the Follow-ups.*

---

## 1. Quick Deploy with Vercel

COLLECTWISE AI is built with the Next.js App Router and is fully optimized for Vercel serverless execution.

### Step-by-Step Instructions:

1. **Push to GitHub / GitLab / Bitbucket:**
   ```bash
   git add .
   git commit -m "Deploy CollectWise AI"
   git push origin main
   ```

2. **Import into Vercel:**
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New...** > **Project**.
   - Select your repository and click **Import**.

3. **Configure Project Settings:**
   - **Framework Preset:** `Next.js` (automatically detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Add Environment Variables:**
   Add each of the following variables in the Vercel project settings:

   | Variable Name | Required? | Example Value |
   |---|---|---|
   | `GEMINI_API_KEY` | **Yes** | `AIzaSy...` |
   | `GEMINI_MODEL` | No | `gemini-3.8-flash` |
   | `NEXT_PUBLIC_APP_URL` | **Yes** | `https://your-domain.vercel.app` |
   | `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://xyz.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes** | `eyJhbGci...` |
   | `SUPABASE_SECRET_KEY` | **Yes** | `eyJhbGci...` |
   | `PAYPAL_CLIENT_ID` | **Yes** | `AVal...` |
   | `PAYPAL_CLIENT_SECRET` | **Yes** | `EK8...` |
   | `PAYPAL_ENV` | **Yes** | `sandbox` (or `production`) |
   | `PAYPAL_WEBHOOK_ID` | Optional | `WH-456...` |

5. **Deploy:**
   Click **Deploy**. Vercel will build the project and output your live deployment URL.

---

## 2. Post-Deployment Verification Checklist

- [ ] Visit `https://your-app.vercel.app/` and ensure the landing page loads cleanly.
- [ ] Visit `/dashboard` and check that financial metric cards, Recharts trends, and receivables ledger populate.
- [ ] Test `/assistant` with a query like *"Show overdue invoices"* to verify Gemini function calling.
- [ ] Test `/invoices/new` by typing *"Create an invoice for John for $850 for website development due in 7 days."* and verify extraction.
- [ ] Update your PayPal webhook URL to `https://your-app.vercel.app/api/webhooks/paypal`.
