"""
Facility outreach email campaign.
Sends personalized welcome emails to facilities with a link to their
listing page showing the "Not Verified" warning.

Usage:
  python email_campaign.py --test           # Send 1 test email to yourself
  python email_campaign.py --batch 100      # Send to first 100 facilities
  python email_campaign.py --all            # Send to all facilities with emails
  python email_campaign.py --state NJ       # Send to all NJ facilities with emails

Rate limited to 50 emails/hour to warm up the domain.
Tracks sent emails to avoid duplicates on re-run.

Run from scripts/: python email_campaign.py
"""

import sys
import time
import json
import os
import requests
from datetime import datetime
from supabase_client import select

RESEND_API_KEY = os.getenv("RESEND_API_KEY") or ""
FROM_EMAIL = "hello@comfyseniors.com"
SITE_URL = "https://comfyseniors.com"

# Track sent emails to avoid duplicates
SENT_LOG = os.path.join(os.path.dirname(__file__), "email_sent_log.json")


def load_sent_log() -> set:
    if os.path.exists(SENT_LOG):
        with open(SENT_LOG, "r") as f:
            return set(json.load(f))
    return set()


def save_sent_log(sent: set):
    with open(SENT_LOG, "w") as f:
        json.dump(list(sent), f)


def build_email(facility: dict) -> dict:
    """Build a personalized email for a facility."""
    name = facility.get("name", "Your Facility")
    city = facility.get("city", "")
    state = facility.get("state", "")
    slug = facility.get("slug", "")
    citation_count = facility.get("citation_count", 0)
    price_min = facility.get("price_min")
    price_max = facility.get("price_max")

    listing_url = f"{SITE_URL}/facility/{slug}"
    verified_url = f"{SITE_URL}/for-facilities"

    price_text = ""
    if price_min and price_max:
        price_text = f"${price_min:,} – ${price_max:,}/month"
    elif price_min:
        price_text = f"From ${price_min:,}/month"

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

Get Verified: {verified_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One empty bed costs you $5,000–$15,000 per month in lost revenue.
ComfySeniors Verified costs less than $10/day.

See your listing: {listing_url}
Get Verified: {verified_url}

— The ComfySeniors Team
hello@comfyseniors.com

P.S. You're receiving this because {name} is listed on ComfySeniors.com.
To update your listing information, reply to this email or log in at
{SITE_URL}/for-facilities/login
"""

    return {
        "from": f"ComfySeniors <{FROM_EMAIL}>",
        "to": facility["email"],
        "subject": subject,
        "text": body.strip(),
        "headers": {
            "X-Entity-Ref-ID": facility["id"],
        },
    }


def send_email(email_data: dict) -> bool:
    """Send an email via Resend API."""
    r = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json=email_data,
        timeout=15,
    )
    return r.status_code == 200


def load_facilities(state: str = None, limit: int = None) -> list:
    """Load facilities with emails."""
    all_f = []
    for offset in range(0, 200000, 1000):
        params = {
            "select": "id,name,slug,city,state,email,citation_count,price_min,price_max",
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

    if limit:
        all_f = all_f[:limit]

    return all_f


def main():
    args = sys.argv[1:]

    if not RESEND_API_KEY:
        # Try loading from .env.local
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("RESEND_API_KEY="):
                        globals()["RESEND_API_KEY"] = line.strip().split("=", 1)[1]
                        break

    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not set. Add it to .env.local")
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
        if send_email(email_data):
            print(f"Test email sent to {test_email}")
        else:
            print("Failed to send test email")
        return

    state = None
    limit = None

    if "--state" in args:
        idx = args.index("--state")
        state = args[idx + 1].upper() if idx + 1 < len(args) else None

    if "--batch" in args:
        idx = args.index("--batch")
        limit = int(args[idx + 1]) if idx + 1 < len(args) else 100

    if "--all" in args:
        limit = None

    if not any(x in args for x in ["--all", "--batch", "--state"]):
        print("Usage:")
        print("  python email_campaign.py --test")
        print("  python email_campaign.py --batch 100")
        print("  python email_campaign.py --state NJ")
        print("  python email_campaign.py --all")
        sys.exit(0)

    # Load facilities
    facilities = load_facilities(state=state, limit=limit)
    sent_log = load_sent_log()

    # Filter out already sent
    to_send = [f for f in facilities if f["id"] not in sent_log]

    print(f"Facilities with email: {len(facilities)}")
    print(f"Already sent: {len(facilities) - len(to_send)}")
    print(f"To send: {len(to_send)}")

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

        if send_email(email_data):
            sent += 1
            sent_log.add(facility["id"])

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
