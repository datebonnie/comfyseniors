# Medicare/Medicaid Tier — Setup Instructions

A new $397/month Stripe subscription product for facilities that accept
Medicare or Medicaid residents. They can't absorb $5K-$8K placement
fees the way private-pay facilities can, so they get a dedicated tier.

## What's live

- **Page:** `/for-facilities/medicaid` — dedicated landing page with its
  own hero, comparison table, and CTA
- **Hero link on `/for-facilities`:** small lavender line under the main
  CTA ("Primarily Medicare or Medicaid? See the Medicare/Medicaid tier →")
- **Stripe checkout route:** accepts `medicaid_monthly` plan value
- **Email campaign script:** `--medicaid` and `--private-pay` flags that
  filter the send list and auto-route messaging + CTA URL to the right
  tier page per recipient
- **About page:** updated to $397/month (was $300-$500)

## One-time Stripe setup (~5 min, after LLC + bank + live mode)

### Step 1 — Create the Stripe product

In Stripe Dashboard → Products → **+ Add product**:

| Field | Value |
|---|---|
| Name | **ComfySeniors Medicare/Medicaid Listing** |
| Description | Flat monthly listing for facilities accepting Medicare and/or Medicaid. Zero placement fees. |
| Pricing model | Recurring |
| Price | $397.00 USD |
| Billing period | Monthly |
| Currency | USD |

Click **Save product**. On the next page, copy the **Price ID** — it
starts with `price_` and looks like `price_1OaBcDeFgHiJkLmNoPqRsTuV`.

### Step 2 — Add the Price ID to Vercel

Vercel → your project → **Settings → Environment Variables** → add:

| Key | Value |
|---|---|
| `STRIPE_MEDICAID_MONTHLY_PRICE_ID` | `price_xxxxxxxxxxxxxxxxxxxxx` (from Step 1) |

Apply to **Production** environment. Optionally also Preview/Development if you use those.

Redeploy — Vercel may do this automatically on env-var change.

### Step 3 — Mirror locally

Add the same line to your `.env.local`:

```
STRIPE_MEDICAID_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
```

This lets the Next.js dev server use the same product when you run
`npm run dev`.

## How to test (before launching campaign)

**1. Verify the page renders:**
Open `https://comfyseniors.com/for-facilities/medicaid` in your browser.
You should see the hero, comparison table, and $397/mo CTA button.

**2. Test a Stripe checkout session (test-mode):**
Click the "Get Listed — $397/month" button. Stripe hosted checkout
should open with the correct price and description. Use test card
`4242 4242 4242 4242` with any future expiry and any 3-digit CVC.

**3. Verify campaign routing:**

```bash
cd scripts
# Show what an email to a Medicaid facility would look like
python -c "
import sys
sys.path.insert(0, '.')
from email_campaign import build_email
print(build_email({
    'id': 'test',
    'name': 'Sunrise Nursing Center',
    'slug': 'sunrise-nursing-center',
    'city': 'Newark', 'state': 'NJ',
    'email': 'test@example.com',
    'citation_count': 2, 'price_min': None, 'price_max': None,
    'accepts_medicaid': True, 'accepts_medicare': True,
})['text'])
"
```

Expected output: an email that references `/for-facilities/medicaid`
and the $397/mo tier, NOT the $297/mo Verified tier.

## How to run a targeted campaign

```bash
cd scripts

# Test batch of 10 Medicare/Medicaid facilities only
python email_campaign.py --batch 10 --medicaid

# All Medicare/Medicaid facilities in a specific state
python email_campaign.py --state NJ --medicaid

# Opposite: only private-pay facilities (excludes M/M)
python email_campaign.py --state NJ --private-pay
```

The script auto-detects which tier the facility should be pitched and
generates the appropriate email per recipient.

## Revenue model math

At the $397/mo price point:

| Paying facilities | Monthly net (Medicaid tier) |
|---|---|
| 10 | $3,970 |
| 25 | $9,925 |
| 40 | $15,880 |
| 60 | $23,820 |

Combined with the $297/mo Verified tier (private-pay), 40 paying
Verified + 25 paying Medicaid = **$11,880 + $9,925 = $21,805/month**.

## What's NOT built yet

- **Dashboard auto-detection.** A facility logged into their dashboard
  currently sees the Verified upgrade even if they're Medicaid-heavy.
  To fix: read `accepts_medicaid`/`accepts_medicare` from their facility
  row and show the appropriate tier in `/for-facilities/dashboard/billing`.
  ~30 min of work, low priority until you have live customers.
- **Upgrade/downgrade between tiers.** If a Verified subscriber wants to
  switch to Medicaid tier (or vice versa), they'd have to cancel one
  and resubscribe to the other. Stripe Customer Portal supports
  mid-subscription plan changes if you enable "subscription updates" in
  the portal settings, but we haven't wired that UI yet.
- **Invoice-based billing for large chains.** Some nursing-home chains
  prefer net-30 invoicing over credit-card autopay. Can be added later
  via Stripe Invoicing or by routing chain deals through manual
  Stripe invoices.
