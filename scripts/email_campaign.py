"""
Facility outreach email campaign.
Sends personalized welcome emails to facilities with a link to their
listing page showing the "Not Verified" warning.

Usage:
  python email_campaign.py --test           # Send 1 test email to yourself
  python email_campaign.py --batch 100      # Send to first 100 facilities
  python email_campaign.py --all            # Send to all facilities with emails
  python email_campaign.py --state NJ       # Send to all NJ facilities with emails
  python email_campaign.py --medicaid       # Only Medicare/Medicaid-accepting facilities
                                            # (pitches /for-facilities/medicaid tier)
  python email_campaign.py --private-pay    # Only private-pay facilities
                                            # (excludes Medicare/Medicaid)

Rate limited to 50 emails/hour to warm up the domain.
Tracks sent emails to avoid duplicates on re-run.

Run from scripts/: python email_campaign.py
"""

import sys
import time
import json
import os
import hmac
import hashlib
import base64
import requests
from datetime import datetime
from supabase_client import select, insert

RESEND_API_KEY = os.getenv("RESEND_API_KEY") or ""
UNSUBSCRIBE_SECRET = os.getenv("UNSUBSCRIBE_SECRET") or ""
FROM_EMAIL = "hello@comfyseniors.com"
SITE_URL = "https://comfyseniors.com"

# Track sent emails to avoid duplicates
SENT_LOG = os.path.join(os.path.dirname(__file__), "email_sent_log.json")


def sign_unsubscribe_token(email: str) -> str:
    """HMAC-SHA256 of lowercased email, base64url-encoded, truncated to 16 bytes.
    MUST match the logic in src/lib/unsubscribe-token.ts exactly."""
    if not UNSUBSCRIBE_SECRET:
        raise RuntimeError("UNSUBSCRIBE_SECRET missing — add it to .env.local")
    normalized = email.strip().lower().encode("utf-8")
    mac = hmac.new(UNSUBSCRIBE_SECRET.encode("utf-8"), normalized, hashlib.sha256).digest()[:16]
    return base64.urlsafe_b64encode(mac).rstrip(b"=").decode("ascii")


def unsubscribe_url(email: str) -> str:
    token = sign_unsubscribe_token(email)
    from urllib.parse import quote
    return f"{SITE_URL}/unsubscribe?e={quote(email)}&t={token}"


def load_unsubscribes() -> set:
    """Pull every unsubscribed email from Supabase. Called once per campaign run."""
    all_rows = []
    for offset in range(0, 1_000_000, 1000):
        batch = select("email_unsubscribes", {
            "select": "email",
            "limit": "1000",
            "offset": str(offset),
        })
        all_rows.extend(batch)
        if len(batch) < 1000:
            break
    return {r["email"].strip().lower() for r in all_rows if r.get("email")}


def load_sent_log() -> set:
    if os.path.exists(SENT_LOG):
        with open(SENT_LOG, "r") as f:
            return set(json.load(f))
    return set()


def save_sent_log(sent: set):
    with open(SENT_LOG, "w") as f:
        json.dump(list(sent), f)


def is_medicaid_facility(facility: dict) -> bool:
    """True if this facility primarily serves Medicare/Medicaid residents."""
    return bool(facility.get("accepts_medicaid") or facility.get("accepts_medicare"))


def build_email(facility: dict) -> dict:
    """Build a personalized email for a facility.

    Automatically routes Medicare/Medicaid facilities to the $397/mo
    Medicare/Medicaid Listing tier, and private-pay facilities to the
    $297/mo Verified tier.
    """
    name = facility.get("name", "Your Facility")
    city = facility.get("city", "")
    state = facility.get("state", "")
    slug = facility.get("slug", "")
    citation_count = facility.get("citation_count", 0)
    price_min = facility.get("price_min")
    price_max = facility.get("price_max")

    listing_url = f"{SITE_URL}/facility/{slug}"

    price_text = ""
    if price_min and price_max:
        price_text = f"${price_min:,} – ${price_max:,}/month"
    elif price_min:
        price_text = f"From ${price_min:,}/month"

    # ── Branch: Medicare/Medicaid vs. private-pay ──────────────────
    if is_medicaid_facility(facility):
        signup_url = f"{SITE_URL}/for-facilities/medicaid"
        price_line = "ComfySeniors Medicare/Medicaid Listing: $397/month. Zero placement fees. Ever."
        cta_label = "Get Listed"
        subject = f"A flat-fee listing for {name} — built for reimbursement caps"
        body = f"""Hi,

{name} is already listed on ComfySeniors.com — America's most honest senior care directory.

Your listing is live here:
{listing_url}

Right now, your page shows a "Not Verified" warning. This is what families see when they search for senior care in {city}, {state}.

{f"Your listed price range: {price_text}" if price_text else ""}
{f"Inspection citations: {citation_count}" if citation_count > 0 else "Inspection record: Clean"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILT FOR FACILITIES LIKE YOURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Most placement services charge $5,000–$8,000 per move-in. That math doesn't work under Medicare or Medicaid reimbursement caps — if it did, you'd have to refuse new Medicaid admissions to stay in business.

So we built a different tier for facilities that accept government payers:

{price_line}

What you get for $397/month:
✓ "Verified" badge replaces the "Not Verified" warning
✓ Your photos, description, and care philosophy — not our auto-generated copy
✓ Priority placement when families filter for "Accepts Medicare" or "Accepts Medicaid"
✓ Every family inquiry sent directly to your inbox with a tracking code
✓ Inspection response — add your context next to any CMS citation
✓ Real-time analytics dashboard
✓ ZERO placement fees when a family moves in — ever

No contracts. Cancel anytime. No per-resident charges regardless of census.

{cta_label}: {signup_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One bed at your facility generates $5,000–$10,000/month in billed revenue.
ComfySeniors Medicare/Medicaid Listing costs less than $14/day.

See your listing: {listing_url}
{cta_label}: {signup_url}

— The ComfySeniors Team
hello@comfyseniors.com

P.S. You're receiving this because {name} is listed on ComfySeniors.com.
To update your listing information, reply to this email or log in at
{SITE_URL}/for-facilities/login
"""
    else:
        # Private-pay: route to /for-facilities ($297/mo Verified tier)
        signup_url = f"{SITE_URL}/for-facilities"
        subject = f"Your facility page on ComfySeniors — and a $5,000 question"
        body = f"""Hi,

{name} is now listed on ComfySeniors.com — America's most honest senior care directory.

Your listing is live here:
{listing_url}

Right now, your page shows a "Not Verified" warning. This is what families see when they search for senior care in {city}, {state}.

{f"Your listed price range: {price_text}" if price_text else ""}
{f"Inspection citations: {citation_count}" if citation_count > 0 else "Inspection record: Clean"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE $5,000 QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every time a family moves into your facility through a referral service, you lose $5,000–$8,000 in placement fees. That's one month's rent — gone.

ComfySeniors Verified: $297/month. Zero placement fees. Ever.

If we help you fill just one bed this year, that's a 20x return on your investment. And you keep every dollar of that first month's rent.

What you get as a Verified member:
✓ "Verified" badge replaces the "Not Verified" warning
✓ Priority placement in search results for {city}
✓ Direct family inquiries — no middleman
✓ Zero placement fees on every move-in
✓ Respond to reviews publicly
✓ Analytics dashboard
✓ Competitive pricing intelligence

Get Verified: {signup_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One empty bed costs you $5,000–$15,000 per month in lost revenue.
ComfySeniors Verified costs less than $10/day.

See your listing: {listing_url}
Get Verified: {signup_url}

— The ComfySeniors Team
hello@comfyseniors.com

P.S. You're receiving this because {name} is listed on ComfySeniors.com.
To update your listing information, reply to this email or log in at
{SITE_URL}/for-facilities/login
"""

    unsub_url = unsubscribe_url(facility["email"])

    return {
        "from": f"ComfySeniors <{FROM_EMAIL}>",
        "to": facility["email"],
        "subject": subject,
        "text": body.strip(),
        "headers": {
            "X-Entity-Ref-ID": facility["id"],
            # RFC 2369 + RFC 8058: Gmail, Yahoo, Apple Mail show a native
            # "Unsubscribe" button at the top of the inbox when these are set.
            "List-Unsubscribe": f"<{unsub_url}>, <mailto:unsubscribe@comfyseniors.com?subject=unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    }


def send_email(email_data: dict) -> tuple[bool, str | None]:
    """Send an email via Resend API. Returns (ok, resend_id)."""
    r = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json=email_data,
        timeout=15,
    )
    if r.status_code != 200:
        return (False, None)
    try:
        return (True, r.json().get("id"))
    except Exception:
        return (True, None)


def log_send_to_db(facility: dict, email_data: dict, resend_id: str | None,
                   variant: str | None = None) -> None:
    """Insert an email_sends row in Supabase. Best-effort — never block
    the campaign loop on logging failures."""
    try:
        insert("email_sends", [{
            "facility_id": facility.get("id") if facility.get("id") != "test" else None,
            "recipient_email": email_data["to"],
            "subject": email_data.get("subject"),
            "variant": variant,
            "resend_id": resend_id,
        }])
    except Exception as e:
        # Don't crash the campaign on a log failure — just print.
        print(f"  [log] failed to log send for {email_data.get('to')}: {e}")


def load_facilities(state: str = None, limit: int = None,
                    segment: str = None) -> list:
    """Load facilities with emails.

    segment:
      None          → all facilities with emails
      'medicaid'    → only facilities accepting Medicare OR Medicaid
      'private-pay' → only facilities NOT accepting Medicare/Medicaid
                      (private-pay assisted living, memory care, etc.)
    """
    all_f = []
    for offset in range(0, 200000, 1000):
        params = {
            "select": "id,name,slug,city,state,email,citation_count,price_min,price_max,"
                      "accepts_medicaid,accepts_medicare,care_types",
            "limit": "1000",
            "offset": str(offset),
            "email": "not.is.null",
        }
        if state:
            params["state"] = f"eq.{state}"

        batch = select("facilities", params)
        all_f.extend(batch)
        if len(batch) < 1000:
            break

    # Apply segment filter in Python (PostgREST OR filtering is finicky)
    if segment == "medicaid":
        all_f = [
            f for f in all_f
            if f.get("accepts_medicaid") or f.get("accepts_medicare")
        ]
    elif segment == "private-pay":
        all_f = [
            f for f in all_f
            if not f.get("accepts_medicaid") and not f.get("accepts_medicare")
        ]

    if limit:
        all_f = all_f[:limit]

    return all_f


def main():
    args = sys.argv[1:]

    # Load secrets from .env.local if not already in env
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("RESEND_API_KEY=") and not RESEND_API_KEY:
                    globals()["RESEND_API_KEY"] = line.split("=", 1)[1]
                elif line.startswith("UNSUBSCRIBE_SECRET=") and not UNSUBSCRIBE_SECRET:
                    globals()["UNSUBSCRIBE_SECRET"] = line.split("=", 1)[1]

    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not set. Add it to .env.local")
        sys.exit(1)

    if not UNSUBSCRIBE_SECRET:
        print("ERROR: UNSUBSCRIBE_SECRET not set. Add it to .env.local")
        print("Generate with: python -c \"import secrets; print(secrets.token_urlsafe(32))\"")
        sys.exit(1)

    # Parse args
    if "--test" in args:
        test_email = input("Enter your test email address: ").strip()
        test_facility = {
            "id": "test",
            "name": "Test Facility",
            "slug": "test-facility-nj",
            "city": "Newark",
            "state": "NJ",
            "email": test_email,
            "citation_count": 3,
            "price_min": 5500,
            "price_max": 8200,
        }
        email_data = build_email(test_facility)
        email_data["to"] = test_email
        ok, resend_id = send_email(email_data)
        if ok:
            print(f"Test email sent to {test_email} (resend_id={resend_id})")
            # Log test sends too — useful to verify webhook plumbing
            log_send_to_db(test_facility, email_data, resend_id, variant="test")
        else:
            print("Failed to send test email")
        return

    state = None
    limit = None
    segment = None

    if "--state" in args:
        idx = args.index("--state")
        state = args[idx + 1].upper() if idx + 1 < len(args) else None

    if "--batch" in args:
        idx = args.index("--batch")
        limit = int(args[idx + 1]) if idx + 1 < len(args) else 100

    if "--all" in args:
        limit = None

    if "--medicaid" in args:
        segment = "medicaid"

    if "--private-pay" in args:
        segment = "private-pay"

    if not any(x in args for x in ["--all", "--batch", "--state", "--medicaid", "--private-pay"]):
        print("Usage:")
        print("  python email_campaign.py --test")
        print("  python email_campaign.py --batch 100")
        print("  python email_campaign.py --state NJ")
        print("  python email_campaign.py --medicaid           # M/M facilities only")
        print("  python email_campaign.py --private-pay        # private-pay only")
        print("  python email_campaign.py --all")
        sys.exit(0)

    # Load facilities + unsubscribe list
    facilities = load_facilities(state=state, limit=limit, segment=segment)
    if segment:
        print(f"Segment filter: {segment}")
        medicaid_count = sum(1 for f in facilities if is_medicaid_facility(f))
        print(f"  Medicare/Medicaid facilities in batch: {medicaid_count:,}")
    sent_log = load_sent_log()
    unsubscribed = load_unsubscribes()

    # Filter: skip already-sent AND skip unsubscribed addresses
    to_send = [
        f for f in facilities
        if f["id"] not in sent_log
        and (f.get("email") or "").strip().lower() not in unsubscribed
    ]

    skipped_unsub = sum(
        1 for f in facilities
        if (f.get("email") or "").strip().lower() in unsubscribed
    )

    print(f"Facilities with email:     {len(facilities)}")
    print(f"Already sent:              {len(facilities) - len(to_send) - skipped_unsub}")
    print(f"Unsubscribed (skipped):    {skipped_unsub}")
    print(f"To send:                   {len(to_send)}")

    if not to_send:
        print("Nothing to send.")
        return

    # Confirm
    confirm = input(f"\nSend {len(to_send)} emails? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        return

    # Send with rate limiting (50/hour = ~1 every 72 seconds)
    sent = 0
    errors = 0

    for i, facility in enumerate(to_send):
        email_data = build_email(facility)
        variant = "medicaid" if is_medicaid_facility(facility) else "verified"

        ok, resend_id = send_email(email_data)
        if ok:
            sent += 1
            sent_log.add(facility["id"])

            # Log to DB so the admin CRM can show sent/open/click stats
            log_send_to_db(facility, email_data, resend_id, variant=variant)

            # Save log every 10 emails
            if sent % 10 == 0:
                save_sent_log(sent_log)
        else:
            errors += 1

        # Rate limit: 50/hour = 72 seconds between emails
        # Start slower for domain warmup
        if sent <= 20:
            delay = 120  # First 20: 1 every 2 minutes
        elif sent <= 100:
            delay = 90   # Next 80: 1 every 90 seconds
        else:
            delay = 72   # After 100: 1 every 72 seconds

        if i < len(to_send) - 1:
            print(f"  [{sent}/{len(to_send)}] Sent to {facility['name']} ({facility['city']}, {facility['state']})")
            time.sleep(delay)

    # Final save
    save_sent_log(sent_log)

    print(f"\n{'='*60}")
    print(f"CAMPAIGN COMPLETE")
    print(f"{'='*60}")
    print(f"Sent: {sent}")
    print(f"Errors: {errors}")
    print(f"Total in sent log: {len(sent_log)}")


if __name__ == "__main__":
    main()
