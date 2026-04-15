"""
Aggressive email scraper — targets 10,000+ emails.

Strategy:
1. For facilities WITH website but no email: deep scrape (homepage, /contact,
   /contact-us, /about, /about-us, /careers, /team, /staff, footer links)
2. For facilities WITHOUT website: find website via Google Places, then deep scrape
3. Multi-threaded for speed (10 workers)
4. Extended email pattern matching (looks for obfuscated emails too)

Run from scripts/: python scrape_emails_aggressive.py
"""

import re
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase_client import select, update

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

# Also match obfuscated emails like "info [at] facility [dot] com"
OBFUSCATED_PATTERN = re.compile(
    r'([a-zA-Z0-9._%+\-]+)\s*[\[\(]\s*(?:at|AT)\s*[\]\)]\s*([a-zA-Z0-9.\-]+)\s*[\[\(]\s*(?:dot|DOT)\s*[\]\)]\s*([a-zA-Z]{2,})',
)

SKIP_DOMAINS = {
    'example.com', 'sentry.io', 'wixpress.com', 'squarespace.com',
    'wordpress.com', 'godaddy.com', 'cloudflare.com', 'googleapis.com',
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'youtube.com', 'w3.org', 'schema.org',
    'gstatic.com', 'googletagmanager.com', 'jquery.com', 'jsdelivr.net',
    'fontawesome.com', 'bootstrapcdn.com', 'cdnjs.com', 'unpkg.com',
    'gravatar.com', 'wp.com', 'amazonaws.com', 'azurewebsites.net',
}

SKIP_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
                 'webmaster', 'hostmaster', 'root', 'null', 'test', 'demo']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Contact page paths to try
CONTACT_PATHS = [
    '/contact', '/contact-us', '/contact-us/', '/contactus',
    '/about', '/about-us', '/about-us/', '/aboutus',
    '/team', '/staff', '/our-team', '/leadership',
    '/careers', '/jobs', '/locations',
    '/get-in-touch', '/reach-us', '/connect',
]


def is_valid_email(email: str) -> bool:
    email = email.lower().strip()
    domain = email.split('@')[-1] if '@' in email else ''
    if domain in SKIP_DOMAINS:
        return False
    for p in SKIP_PREFIXES:
        if email.startswith(p + '@'):
            return False
    if any(x in email for x in ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.php', '.woff']):
        return False
    if len(email) < 6 or len(email) > 80:
        return False
    # Must have a real TLD
    tld = domain.split('.')[-1] if '.' in domain else ''
    if len(tld) < 2:
        return False
    return True


def extract_all_emails(html: str) -> list[str]:
    """Extract emails from HTML including mailto: and obfuscated forms."""
    emails = set()

    # Standard pattern
    for e in EMAIL_PATTERN.findall(html):
        emails.add(e.lower().strip().rstrip('.'))

    # Mailto links
    for e in re.findall(r'mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})', html):
        emails.add(e.lower().strip().rstrip('.'))

    # Obfuscated: "info [at] domain [dot] com"
    for match in OBFUSCATED_PATTERN.finditer(html):
        e = f"{match.group(1)}@{match.group(2)}.{match.group(3)}"
        emails.add(e.lower())

    # href="mailto:" with encoding
    for e in re.findall(r'href=["\']mailto:([^"\'?]+)', html):
        decoded = e.replace('%40', '@').replace('%2E', '.')
        if '@' in decoded:
            emails.add(decoded.lower().strip())

    return [e for e in emails if is_valid_email(e)]


def pick_best_email(emails: list[str]) -> str | None:
    if not emails:
        return None
    priority = ['info', 'contact', 'admin', 'office', 'hello', 'admissions',
                'intake', 'general', 'inquiries', 'reception', 'frontdesk']
    for prefix in priority:
        for e in emails:
            if e.startswith(prefix + '@'):
                return e
    return emails[0]


def deep_scrape(url: str) -> str | None:
    """Deep scrape a website for emails — checks multiple pages."""
    if not url:
        return None
    if not url.startswith('http'):
        url = 'https://' + url

    all_emails = []

    # Scrape homepage
    try:
        r = requests.get(url, headers=HEADERS, timeout=8, allow_redirects=True)
        if r.status_code == 200:
            all_emails.extend(extract_all_emails(r.text))
    except:
        pass

    if all_emails:
        return pick_best_email(all_emails)

    # Try contact pages
    for path in CONTACT_PATHS:
        try:
            r = requests.get(url.rstrip('/') + path, headers=HEADERS, timeout=6, allow_redirects=True)
            if r.status_code == 200:
                found = extract_all_emails(r.text)
                all_emails.extend(found)
                if found:
                    break  # Found on a contact page, stop
        except:
            pass

    return pick_best_email(all_emails)


def find_website_google(name: str, city: str, state: str) -> str | None:
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.websiteUri',
    }
    payload = {'textQuery': f'{name} {city} {state} senior care', 'maxResultCount': 1}
    try:
        r = requests.post(PLACES_URL, json=payload, headers=headers, timeout=12)
        if r.status_code == 200:
            places = r.json().get('places', [])
            if places:
                return places[0].get('websiteUri')
    except:
        pass
    return None


def process_facility(f: dict) -> tuple[str, str | None, str | None]:
    """Process one facility — returns (id, email, website)."""
    fid = f['id']
    website = f.get('website')
    email = None

    # If has website, deep scrape it
    if website:
        email = deep_scrape(website)
    else:
        # Find website via Google
        website = find_website_google(f['name'], f.get('city', ''), f.get('state', ''))
        if website:
            email = deep_scrape(website)

    return (fid, email, website if not f.get('website') else None)


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
    print(f"Total: {len(all_facilities)} | Need email: {len(no_email)}")

    found = 0
    websites_found = 0
    processed = 0
    batch_size = 100

    for i in range(0, len(no_email), batch_size):
        batch = no_email[i:i + batch_size]

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(process_facility, f): f for f in batch}

            for future in as_completed(futures):
                try:
                    fid, email, new_website = future.result()

                    updates = {}
                    if email:
                        updates['email'] = email
                        found += 1
                    if new_website:
                        updates['website'] = new_website
                        websites_found += 1

                    if updates:
                        try:
                            update('facilities', {'id': fid}, updates)
                        except:
                            pass
                except:
                    pass

        processed += len(batch)
        print(f"  {processed}/{len(no_email)} — {found} emails, {websites_found} new websites")

        time.sleep(0.3)

    print(f"\n{'='*60}")
    print(f"COMPLETE")
    print(f"{'='*60}")
    print(f"Processed: {processed}")
    print(f"Emails found: {found}")
    print(f"New websites found: {websites_found}")

    # Final count
    total_email = 0
    for offset in range(0, 100000, 1000):
        batch = select('facilities', {'select': 'email', 'limit': '1000', 'offset': str(offset), 'email': 'not.is.null'})
        total_email += len(batch)
        if len(batch) < 1000:
            break
    print(f"\nTotal emails in database: {total_email}")


if __name__ == "__main__":
    main()
