"""
Phase 2: Find emails for facilities that have NO website.
Uses Google Places API to first find their website, then scrapes it for emails.
Also re-checks facilities with websites where Phase 1 found no email.

Run from scripts/: python scrape_emails_phase2.py
"""

import re
import time
import requests
from supabase_client import select, update

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

SKIP_DOMAINS = {
    'example.com', 'sentry.io', 'wixpress.com', 'squarespace.com',
    'wordpress.com', 'godaddy.com', 'cloudflare.com', 'googleapis.com',
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'youtube.com', 'w3.org', 'schema.org',
    'jquery.com', 'bootstrap.com', 'gstatic.com', 'googletagmanager.com',
}

SKIP_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster', 'webmaster']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html',
}


def is_valid_email(email: str) -> bool:
    email = email.lower().strip()
    domain = email.split('@')[-1] if '@' in email else ''
    if domain in SKIP_DOMAINS:
        return False
    for p in SKIP_PREFIXES:
        if email.startswith(p):
            return False
    if any(x in email for x in ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.php']):
        return False
    if len(email) < 6 or len(email) > 80:
        return False
    return True


def extract_best_email(html: str) -> str | None:
    emails = EMAIL_PATTERN.findall(html)
    mailto = re.findall(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', html)
    all_emails = list(set(emails + mailto))
    valid = [e.lower().strip().rstrip('.') for e in all_emails if is_valid_email(e)]
    if not valid:
        return None

    # Prioritize contact-type emails
    for prefix in ['info', 'contact', 'admin', 'office', 'hello', 'admissions', 'intake']:
        for e in valid:
            if e.startswith(prefix + '@'):
                return e
    return valid[0]


def find_website_via_google(name: str, city: str, state: str) -> str | None:
    """Use Google Places to find a facility's website."""
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.websiteUri',
    }
    payload = {'textQuery': f'{name} {city} {state}', 'maxResultCount': 1}
    try:
        r = requests.post(PLACES_URL, json=payload, headers=headers, timeout=15)
        if r.status_code == 200:
            places = r.json().get('places', [])
            if places:
                return places[0].get('websiteUri')
    except:
        pass
    return None


def scrape_email_from_url(url: str) -> str | None:
    """Fetch URL and extract email."""
    if not url:
        return None
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        r = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
        if r.status_code == 200:
            email = extract_best_email(r.text)
            if email:
                return email

            # Try /contact
            for path in ['/contact', '/contact-us', '/about']:
                try:
                    r2 = requests.get(url.rstrip('/') + path, headers=HEADERS, timeout=8, allow_redirects=True)
                    if r2.status_code == 200:
                        email = extract_best_email(r2.text)
                        if email:
                            return email
                except:
                    pass
    except:
        pass
    return None


def main():
    print("Loading facilities without email...")
    all_facilities = []
    for offset in range(0, 100000, 1000):
        batch = select('facilities', {
            'select': 'id,name,city,state,website,email',
            'limit': '1000',
            'offset': str(offset),
        })
        all_facilities.extend(batch)
        if len(batch) < 1000:
            break

    no_email = [f for f in all_facilities if not f.get('email')]
    no_email_no_website = [f for f in no_email if not f.get('website')]
    no_email_has_website = [f for f in no_email if f.get('website')]

    print(f"Total: {len(all_facilities)}")
    print(f"Already have email: {len(all_facilities) - len(no_email)}")
    print(f"No email + no website: {len(no_email_no_website)}")
    print(f"No email + has website (retry): {len(no_email_has_website)}")

    found_total = 0
    api_calls = 0

    # Phase 2A: Find websites via Google for facilities without one, then scrape
    print(f"\n{'='*60}")
    print(f"PHASE 2A: Finding websites + emails for {len(no_email_no_website)} facilities")
    print(f"{'='*60}")

    for i, f in enumerate(no_email_no_website):
        # Find website via Google Places
        website = find_website_via_google(f['name'], f.get('city', ''), f.get('state', ''))
        api_calls += 1

        if website:
            # Update website in DB
            try:
                update('facilities', {'id': f['id']}, {'website': website})
            except:
                pass

            # Scrape email from website
            email = scrape_email_from_url(website)
            if email:
                try:
                    update('facilities', {'id': f['id']}, {'email': email})
                    found_total += 1
                except:
                    pass

        time.sleep(0.2)

        if (i + 1) % 200 == 0:
            print(f"  {i+1}/{len(no_email_no_website)} — {found_total} emails found ({api_calls} API calls)")

    print(f"Phase 2A: {found_total} emails found ({api_calls} API calls)")

    # Phase 2B: Retry facilities that have website but Phase 1 missed email
    print(f"\n{'='*60}")
    print(f"PHASE 2B: Retrying {len(no_email_has_website)} websites with deeper scraping")
    print(f"{'='*60}")

    found_2b = 0
    for i, f in enumerate(no_email_has_website):
        email = scrape_email_from_url(f['website'])
        if email:
            try:
                update('facilities', {'id': f['id']}, {'email': email})
                found_2b += 1
            except:
                pass

        if (i + 1) % 200 == 0:
            print(f"  {i+1}/{len(no_email_has_website)} — {found_2b} new emails")

    found_total += found_2b
    print(f"Phase 2B: {found_2b} new emails from retry")

    # Final stats
    print(f"\n{'='*60}")
    print(f"FINAL STATS")
    print(f"{'='*60}")

    total_email = 0
    for offset in range(0, 100000, 1000):
        batch = select('facilities', {'select': 'email', 'limit': '1000', 'offset': str(offset), 'email': 'not.is.null'})
        total_email += len(batch)
        if len(batch) < 1000:
            break

    print(f"Total with email now: {total_email}")
    print(f"New emails this run: {found_total}")
    print(f"Google API calls: {api_calls}")


if __name__ == "__main__":
    main()
