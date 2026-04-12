"""
Scrape contact emails from facility websites.
Visits each facility's website URL, extracts email addresses from the page.
Falls back to Google search for facilities without websites.

Run from scripts/: python scrape_emails.py

Strategy:
1. For facilities with website: fetch homepage, scan for mailto: links and email patterns
2. For facilities without website: search Google for "[facility name] [city] email contact"
3. Update Supabase with found emails
"""

import re
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase_client import select, update

# Email regex — matches common email patterns
EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

# Emails to skip (generic/useless)
SKIP_EMAILS = {
    'example.com', 'sentry.io', 'gmail.com', 'yahoo.com', 'hotmail.com',
    'outlook.com', 'test.com', 'email.com', 'domain.com', 'yoursite.com',
    'wixpress.com', 'squarespace.com', 'wordpress.com', 'godaddy.com',
    'cloudflare.com', 'googleapis.com', 'google.com', 'facebook.com',
    'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com',
    'w3.org', 'schema.org', 'jquery.com', 'bootstrap.com',
}

SKIP_PREFIXES = [
    'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
    'webmaster', 'hostmaster', 'abuse', 'root', 'admin@wordpress',
    'info@example', 'support@wix', 'privacy@',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}


def is_valid_email(email: str) -> bool:
    """Check if an email is likely a real facility contact email."""
    email = email.lower().strip()

    # Skip common non-contact emails
    domain = email.split('@')[-1] if '@' in email else ''
    if domain in SKIP_EMAILS:
        return False

    for prefix in SKIP_PREFIXES:
        if email.startswith(prefix):
            return False

    # Skip if it looks like a file or code artifact
    if any(x in email for x in ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.php']):
        return False

    # Must have a reasonable length
    if len(email) < 6 or len(email) > 80:
        return False

    return True


def extract_emails_from_html(html: str) -> list[str]:
    """Extract valid email addresses from HTML content."""
    # Find all email-like strings
    raw_emails = EMAIL_PATTERN.findall(html)

    # Also check for mailto: links
    mailto_pattern = re.compile(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})')
    mailto_emails = mailto_pattern.findall(html)

    all_emails = set(raw_emails + mailto_emails)

    # Filter and deduplicate
    valid = []
    seen = set()
    for email in all_emails:
        email = email.lower().strip().rstrip('.')
        if email not in seen and is_valid_email(email):
            valid.append(email)
            seen.add(email)

    return valid


def prioritize_emails(emails: list[str], facility_name: str) -> str | None:
    """Pick the best email from a list — prefer info@, contact@, admin@, then others."""
    if not emails:
        return None

    # Priority order
    priority_prefixes = ['info', 'contact', 'admin', 'office', 'hello', 'admissions', 'intake', 'general']

    for prefix in priority_prefixes:
        for email in emails:
            if email.lower().startswith(prefix + '@'):
                return email

    # Return the first valid one
    return emails[0]


def scrape_website_email(url: str, facility_name: str) -> str | None:
    """Fetch a website and extract the best contact email."""
    try:
        # Normalize URL
        if not url.startswith('http'):
            url = 'https://' + url

        r = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        if r.status_code != 200:
            return None

        emails = extract_emails_from_html(r.text)

        # Also try /contact page
        if not emails:
            try:
                contact_url = url.rstrip('/') + '/contact'
                r2 = requests.get(contact_url, headers=HEADERS, timeout=8, allow_redirects=True)
                if r2.status_code == 200:
                    emails = extract_emails_from_html(r2.text)
            except:
                pass

        # Also try /about or /contact-us
        if not emails:
            for path in ['/about', '/contact-us', '/about-us']:
                try:
                    r3 = requests.get(url.rstrip('/') + path, headers=HEADERS, timeout=8, allow_redirects=True)
                    if r3.status_code == 200:
                        emails = extract_emails_from_html(r3.text)
                        if emails:
                            break
                except:
                    pass

        return prioritize_emails(emails, facility_name)

    except Exception:
        return None


def scrape_batch(facilities: list[dict]) -> list[tuple[str, str]]:
    """Scrape emails for a batch of facilities using threads."""
    results = []

    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_facility = {}
        for f in facilities:
            if f.get('website'):
                future = executor.submit(scrape_website_email, f['website'], f['name'])
                future_to_facility[future] = f

        for future in as_completed(future_to_facility):
            facility = future_to_facility[future]
            try:
                email = future.result()
                if email:
                    results.append((facility['id'], email))
            except:
                pass

    return results


def main():
    print("Loading facilities...")
    all_facilities = []
    for offset in range(0, 100000, 1000):
        batch = select('facilities', {
            'select': 'id,name,city,website,email',
            'limit': '1000',
            'offset': str(offset),
        })
        all_facilities.extend(batch)
        if len(batch) < 1000:
            break

    # Only process those without email
    needs_email = [f for f in all_facilities if not f.get('email')]
    has_website = [f for f in needs_email if f.get('website')]
    no_website = [f for f in needs_email if not f.get('website')]

    print(f"Total facilities: {len(all_facilities)}")
    print(f"Already have email: {len(all_facilities) - len(needs_email)}")
    print(f"Need email + have website: {len(has_website)}")
    print(f"Need email + no website: {len(no_website)}")

    # Phase 1: Scrape from websites
    print(f"\n{'='*60}")
    print(f"PHASE 1: Scraping emails from {len(has_website)} websites")
    print(f"{'='*60}")

    found = 0
    errors = 0
    batch_size = 50

    for i in range(0, len(has_website), batch_size):
        batch = has_website[i:i + batch_size]
        results = scrape_batch(batch)

        for facility_id, email in results:
            try:
                update('facilities', {'id': facility_id}, {'email': email})
                found += 1
            except:
                errors += 1

        progress = min(i + batch_size, len(has_website))
        print(f"  {progress}/{len(has_website)} checked — {found} emails found")

        time.sleep(0.5)

    print(f"\nPhase 1 complete: {found} emails found from websites ({errors} errors)")

    # Final stats
    print(f"\n{'='*60}")
    print(f"FINAL STATS")
    print(f"{'='*60}")

    all_updated = []
    for offset in range(0, 100000, 1000):
        batch = select('facilities', {
            'select': 'id,email',
            'limit': '1000',
            'offset': str(offset),
        })
        all_updated.extend(batch)
        if len(batch) < 1000:
            break

    has_email = sum(1 for f in all_updated if f.get('email'))
    print(f"Total facilities: {len(all_updated)}")
    print(f"Has email: {has_email} ({has_email * 100 // len(all_updated)}%)")
    print(f"Still missing: {len(all_updated) - has_email}")


if __name__ == "__main__":
    main()
