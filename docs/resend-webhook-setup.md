# Resend Webhook — Setup Guide

The admin CRM tracks **open rate, click rate, and bounce rate** by listening
to events from Resend. Resend sends an HTTP POST to your site every time
something happens to an email you sent (delivered, opened, clicked, bounced,
or marked as spam).

This document walks through wiring it up. ~5 minutes total.

---

## What's already built

- `/api/webhooks/resend` — Next.js route that receives + verifies Resend
  webhook events and updates the corresponding `email_sends` row in
  Supabase
- `email_sends` table (migration 011) — one row per send, with timestamp
  columns for each engagement event
- Admin overview tiles for **Sent / Open rate / Click rate / Bounce rate**
- Per-facility email history on `/admin/leads/[id]`

What's missing: the Resend secret + webhook subscription. That's manual
config in the Resend dashboard, then one env var in Vercel.

---

## Step 1 — Run migration 011 in Supabase (~30 sec)

Supabase Dashboard → SQL Editor → paste the contents of
`supabase/migrations/011_email_sends.sql` and click **Run**.

Verify with:

```sql
select count(*) from email_sends;
```

Should return `0`.

---

## Step 2 — Create the webhook in Resend (~2 min)

1. Go to [resend.com/webhooks](https://resend.com/webhooks)
2. Click **+ Add Webhook**
3. Configure:

| Field | Value |
|---|---|
| **Endpoint URL** | `https://www.comfyseniors.com/api/webhooks/resend` |
| **Events** | Check all of these: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained` |

4. Click **Add**
5. On the webhook detail page, click **Show signing secret** (or "Reveal")
6. Copy the secret. It looks like `whsec_BASE64STUFFHEREXXXXXXXX`

---

## Step 3 — Add the secret to Vercel (~1 min)

Vercel → your project → **Settings → Environment Variables** → add:

| Key | Value |
|---|---|
| `RESEND_WEBHOOK_SECRET` | `whsec_xxxxxxx` (from Step 2) |

Apply to **Production**. Trigger a redeploy (Vercel will usually
auto-redeploy on env-var changes).

Optionally mirror to your local `.env.local` if you want to test webhook
verification locally with `ngrok` or similar.

---

## Step 4 — Smoke-test the integration (~2 min)

### A. Send a test email so there's something to track

```bash
cd C:/Users/emipe/comfyseniors/scripts
python email_campaign.py --test
```

Enter your own email when prompted (e.g. `brandol.monter@gmail.com`).

Check Supabase:

```sql
select recipient_email, subject, resend_id, sent_at
from email_sends
order by sent_at desc
limit 5;
```

You should see one row with a non-null `resend_id` (looks like a UUID).

### B. Trigger Resend events

Open the email in your inbox → that fires `email.opened`.

Click any link inside → that fires `email.clicked`.

Wait ~30 seconds for Resend to call the webhook. Re-run the SQL query —
`opened_at` and `clicked_at` should now be populated.

### C. Confirm in the admin UI

Visit `/admin`. The **Sent** tile should read `1` (or higher), **Open
rate** should be `100%`, **Click rate** should match.

---

## How it works under the hood

1. **Send time**: `email_campaign.py` calls Resend's send API. Resend
   returns a message ID. We insert one row into `email_sends` with that
   ID + the recipient + the subject.

2. **Engagement time**: When the recipient opens or clicks, Resend
   POSTs to `/api/webhooks/resend` with a JSON event body and three
   `svix-*` headers (id, timestamp, signature).

3. **Verification**: The route HMAC-SHA256-signs `${id}.${ts}.${body}`
   using the secret and compares against `svix-signature`. Mismatched
   or stale (>5 min old) requests are rejected with 401.

4. **Update**: Verified events trigger an UPDATE on the matching
   `email_sends` row by `resend_id`, setting the appropriate
   timestamp column (`opened_at`, `clicked_at`, etc.).

5. **Display**: `/admin` aggregates counts via Supabase HEAD queries
   (no row data fetched — fast even at millions of sends).

---

## Why open rates aren't 100% accurate (and that's OK)

Open tracking works by embedding a 1×1 invisible pixel in the email body.
Many clients block it:

| Client | Tracks opens? |
|---|---|
| Gmail web | Yes (proxied through Google's image cache) |
| Apple Mail | **No** — Apple Mail Privacy Protection (since iOS 15) pre-fetches every pixel, inflating opens |
| Outlook desktop | Sometimes — depends on settings |
| Plain-text-only readers | No |

**Effect:** Apple Mail users inflate your open rate. Gmail users undercount
slightly. For B2B outreach to facility administrators (mostly Outlook +
Gmail), expect open rates of **20-40% on healthy lists**. Click rates are
more reliable — anything **3-7%** is solid B2B cold email performance.

Bounce and complaint rates are precise (Resend reports them definitively).
Watch:
- **Bounce > 3%** → pause sends; clean the list
- **Complaint > 0.3%** → URGENT, pause and investigate; risks
  permanent domain damage

---

## Troubleshooting

**"All my counters say 0 even after sending":**
1. Run the SQL from Step 4A. If `email_sends` is empty, the campaign
   script isn't logging — check that `RESEND_API_KEY` is in `.env.local`.
2. If `email_sends` has rows but `resend_id` is null, Resend's API
   isn't returning IDs — confirm your API key is valid.

**"Sends show up but engagement timestamps stay null":**
1. The webhook isn't firing. Check Resend → Webhooks → click your
   webhook → look at **Recent deliveries** tab. Failed deliveries are
   marked red with the response code.
2. If you see `401 Invalid signature`, your `RESEND_WEBHOOK_SECRET` in
   Vercel doesn't match what Resend has. Re-copy from Resend, re-paste,
   redeploy.
3. If you see `400 Stale timestamp`, your server clock is drifting.
   Should never happen on Vercel. If you see this, contact me.
4. If you see `500`, check Vercel function logs for the actual error
   from the Supabase update.

**"How do I replay missed events?":**
Resend's webhook UI has a **"Replay"** button next to each event. You
can also click "Test" on any event type to send a synthetic event for
debugging.
