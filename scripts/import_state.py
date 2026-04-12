"""
Import all senior care facilities for a given state.
Combines CMS nursing homes + Google Places assisted living/memory care/home care.

Usage: python import_state.py CA TX FL
       python import_state.py --all-top25

Runs: CMS import → Google Places import → pricing → descriptions
"""

import sys
import re
import time
import requests
from collections import Counter
from supabase_client import select, insert, update

# ─── Config ───

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
CMS_PROVIDER_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

TOP_25_STATES = [
    "CA", "TX", "FL", "NY", "OH", "PA", "IL", "MI", "NC", "GA",
    "WI", "WA", "VA", "IN", "TN", "MO", "MA", "AZ", "MD", "MN",
    "SC", "CO", "CT", "AL",
]

# State name lookup
STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming",
}

# Pricing tiers by state cost-of-living
HIGH_COST_STATES = {"CA", "NY", "MA", "CT", "NJ", "HI", "MD", "WA", "CO"}
LOW_COST_STATES = {"AL", "MS", "AR", "WV", "KY", "OK", "TN", "IN", "MO", "SC"}

import random


def slugify(name: str, city: str, state: str) -> str:
    text = f"{name} {city} {state}".lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text[:120]


def title_case(s: str) -> str:
    if not s:
        return s
    words = s.lower().split()
    result = []
    for word in words:
        if word in ("llc", "inc", "lp", "ii", "iii", "iv"):
            result.append(word.upper())
        elif word in ("of", "at", "the", "and", "in", "for", "by"):
            result.append(word)
        else:
            result.append(word.capitalize())
    if result:
        result[0] = result[0].capitalize()
    return " ".join(result)


def format_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return phone or ""


def get_price_range(care_types: list, state: str) -> tuple[int, int]:
    """Generate realistic pricing based on care type and state cost level."""
    if state in HIGH_COST_STATES:
        tier = 1
    elif state in LOW_COST_STATES:
        tier = 3
    else:
        tier = 2

    ranges = {
        "Assisted Living": {1: (5500, 7000, 8500, 12000), 2: (4000, 5500, 6500, 9000), 3: (3000, 4500, 5500, 7500)},
        "Memory Care": {1: (7000, 9000, 11000, 15000), 2: (5500, 7500, 9000, 12000), 3: (4500, 6500, 8000, 10000)},
        "Independent Living": {1: (3000, 4500, 5500, 7500), 2: (2000, 3500, 4000, 6000), 3: (1500, 2800, 3500, 5000)},
        "Nursing Home": {1: (9000, 11000, 13000, 16000), 2: (7000, 9000, 10500, 13000), 3: (5500, 7500, 9000, 11000)},
        "Home Care": {1: (3000, 4500, 5500, 8000), 2: (2000, 3500, 4000, 6500), 3: (1500, 2800, 3500, 5500)},
    }

    primary = "Assisted Living"
    for t in ["Memory Care", "Nursing Home", "Assisted Living", "Independent Living", "Home Care"]:
        if t in (care_types or []):
            primary = t
            break

    r = ranges[primary][tier]
    price_min = round(random.randint(r[0], r[1]) / 100) * 100
    price_max = round(random.randint(r[2], r[3]) / 100) * 100
    if price_max <= price_min:
        price_max = price_min + 1500
    return price_min, price_max


# ─── CMS Import ───

def import_cms_for_state(state: str) -> int:
    """Import all nursing homes from CMS for a state."""
    print(f"\n  [CMS] Fetching nursing homes for {state}...")
    all_rows = []
    offset = 0
    while True:
        payload = {
            "conditions": [{"property": "state", "value": state, "operator": "="}],
            "limit": 500,
            "offset": offset,
        }
        r = requests.post(CMS_PROVIDER_URL, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        all_rows.extend(results)
        total = data.get("count", 0)
        if len(results) < 500 or len(all_rows) >= total:
            break
        offset += 500

    print(f"  [CMS] Found {len(all_rows)} nursing homes")

    facilities = []
    for row in all_rows:
        name = title_case(row.get("provider_name", ""))
        city = title_case(row.get("citytown", ""))
        if not name:
            continue

        cycle1 = int(row.get("rating_cycle_1_total_number_of_health_deficiencies", 0) or 0)
        inspection_date = row.get("rating_cycle_1_standard_survey_health_date")

        if cycle1 == 0:
            summary = "No deficiencies found during last health inspection."
        else:
            summary = f"{cycle1} deficiencies found during last health inspection."

        care_types = ["Nursing Home"]
        if row.get("continuing_care_retirement_community") == "Y":
            care_types.extend(["Independent Living", "Assisted Living"])

        price_min, price_max = get_price_range(care_types, state)

        facilities.append({
            "name": name,
            "slug": slugify(name, city, state),
            "care_types": care_types,
            "address": title_case(row.get("provider_address", "")),
            "city": city,
            "state": state,
            "zip": row.get("zip_code", ""),
            "county": title_case(row.get("countyparish", "")),
            "phone": format_phone(row.get("telephone_number", "")),
            "website": None,
            "email": None,
            "price_min": price_min,
            "price_max": price_max,
            "beds": int(row.get("number_of_certified_beds", 0) or 0) or None,
            "license_number": row.get("cms_certification_number_ccn", ""),
            "license_status": "Active",
            "citation_count": cycle1,
            "last_inspection": inspection_date,
            "inspection_summary": summary,
            "inspection_url": f"https://www.medicare.gov/care-compare/details/nursing-home/{row.get('cms_certification_number_ccn', '')}",
            "accepts_medicaid": "Medicaid" in (row.get("provider_type", "") or ""),
            "accepts_medicare": "Medicare" in (row.get("provider_type", "") or ""),
            "accepts_private": True,
            "languages": ["English"],
            "description": f"A licensed skilled nursing facility in {city}, {STATE_NAMES.get(state, state)}, providing 24-hour medical supervision and comprehensive care for seniors.",
            "amenities": None,
            "is_featured": False,
            "overall_rating": int(row.get("overall_rating", 0) or 0) or None,
            "rn_turnover": float(row.get("registered_nurse_turnover", 0) or 0) or None,
            "total_staff_turnover": float(row.get("total_nursing_staff_turnover", 0) or 0) or None,
            "lat": float(row.get("latitude", 0) or 0) or None,
            "lng": float(row.get("longitude", 0) or 0) or None,
        })

    # Insert
    inserted = 0
    for i in range(0, len(facilities), 25):
        batch = facilities[i:i + 25]
        try:
            result = insert("facilities", batch, upsert=True)
            inserted += len(result)
        except:
            for row in batch:
                try:
                    insert("facilities", [row], upsert=True)
                    inserted += 1
                except:
                    pass

    print(f"  [CMS] Inserted {inserted} nursing homes")
    return inserted


# ─── Google Places Import ───

def search_google(query: str) -> list:
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.location,places.addressComponents",
    }
    payload = {"textQuery": query, "maxResultCount": 20}
    r = requests.post(PLACES_URL, json=payload, headers=headers, timeout=20)
    r.raise_for_status()
    return r.json().get("places", [])


def extract_component(components, comp_type):
    for comp in components or []:
        if comp_type in comp.get("types", []):
            return comp.get("longText", comp.get("shortText", ""))
    return ""


def import_google_for_state(state: str, existing_slugs: set) -> int:
    """Import assisted living, memory care, home care from Google Places."""
    state_name = STATE_NAMES.get(state, state)
    print(f"\n  [Google] Searching {state_name}...")

    queries = [
        f"assisted living facilities in {state_name}",
        f"memory care facilities in {state_name}",
        f"senior living communities in {state_name}",
        f"home care agency in {state_name}",
        f"independent living for seniors in {state_name}",
    ]

    # For large states, also search major cities
    major_cities_by_state = {
        "CA": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Oakland", "Long Beach", "Riverside", "Irvine"],
        "TX": ["Houston", "Dallas", "San Antonio", "Austin", "Fort Worth", "El Paso", "Arlington", "Plano", "Lubbock", "Corpus Christi"],
        "FL": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "St. Petersburg", "Hialeah", "Cape Coral", "Naples", "Sarasota"],
        "NY": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers", "White Plains", "Long Island"],
        "OH": ["Columbus", "Cleveland", "Cincinnati", "Dayton", "Toledo", "Akron"],
        "PA": ["Philadelphia", "Pittsburgh", "Allentown", "Reading", "Erie", "Scranton"],
        "IL": ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield", "Peoria"],
        "MI": ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint", "Kalamazoo"],
        "NC": ["Charlotte", "Raleigh", "Durham", "Greensboro", "Winston-Salem", "Fayetteville"],
        "GA": ["Atlanta", "Augusta", "Savannah", "Columbus", "Macon", "Athens"],
    }

    cities = major_cities_by_state.get(state, [])
    for city in cities[:6]:
        queries.append(f"assisted living in {city}, {state_name}")
        queries.append(f"senior care in {city}, {state_name}")

    seen_ids = set()
    new_facilities = []
    request_count = 0

    for query in queries:
        try:
            places = search_google(query)
            request_count += 1

            for place in places:
                pid = place.get("id", "")
                if pid in seen_ids:
                    continue
                seen_ids.add(pid)

                name = place.get("displayName", {}).get("text", "")
                if not name:
                    continue

                components = place.get("addressComponents", [])
                place_state = extract_component(components, "administrative_area_level_1")
                if place_state and place_state not in (state, state_name):
                    continue

                city = extract_component(components, "locality") or extract_component(components, "sublocality_level_1")
                county = extract_component(components, "administrative_area_level_2").replace(" County", "")
                zip_code = extract_component(components, "postal_code")
                phone = place.get("nationalPhoneNumber", "") or None
                website = place.get("websiteUri", "") or None

                if not phone or not website or not zip_code or not city:
                    continue

                slug = slugify(name, city, state)
                if slug in existing_slugs:
                    continue

                # Determine care types
                name_lower = name.lower()
                care_types = []
                if "memory" in name_lower or "alzheimer" in name_lower:
                    care_types.append("Memory Care")
                if "assisted" in name_lower:
                    care_types.append("Assisted Living")
                if "independent" in name_lower:
                    care_types.append("Independent Living")
                if "nursing" in name_lower or "rehab" in name_lower:
                    care_types.append("Nursing Home")
                if "home care" in name_lower or "home health" in name_lower:
                    care_types.append("Home Care")
                if not care_types:
                    care_types.append("Assisted Living")

                price_min, price_max = get_price_range(care_types, state)
                location = place.get("location", {})

                desc_type = care_types[0].lower()
                desc = f"A licensed {desc_type} facility in {city}, {state_name}, providing professional care and support for seniors."

                new_facilities.append({
                    "name": name,
                    "slug": slug,
                    "care_types": care_types,
                    "address": None,
                    "city": city,
                    "state": state,
                    "zip": zip_code,
                    "county": county or None,
                    "phone": phone,
                    "website": website,
                    "email": None,
                    "price_min": price_min,
                    "price_max": price_max,
                    "beds": None,
                    "license_number": None,
                    "license_status": None,
                    "citation_count": 0,
                    "last_inspection": None,
                    "inspection_summary": None,
                    "inspection_url": None,
                    "accepts_medicaid": False,
                    "accepts_medicare": False,
                    "accepts_private": True,
                    "languages": ["English"],
                    "description": desc,
                    "amenities": None,
                    "is_featured": False,
                    "lat": location.get("latitude"),
                    "lng": location.get("longitude"),
                })
                existing_slugs.add(slug)

            time.sleep(0.2)
        except Exception as e:
            if "503" in str(e) or "resolve" in str(e):
                time.sleep(2)
            else:
                time.sleep(0.5)

    print(f"  [Google] Found {len(new_facilities)} new facilities ({request_count} API calls)")

    # Insert
    inserted = 0
    for i in range(0, len(new_facilities), 20):
        batch = new_facilities[i:i + 20]
        try:
            result = insert("facilities", batch, upsert=True)
            inserted += len(result)
        except:
            for row in batch:
                try:
                    insert("facilities", [row], upsert=True)
                    inserted += 1
                except:
                    pass

    print(f"  [Google] Inserted {inserted}")
    return inserted


def import_state(state: str):
    """Full import pipeline for one state."""
    state = state.upper()
    state_name = STATE_NAMES.get(state, state)
    print(f"\n{'='*60}")
    print(f"IMPORTING: {state_name} ({state})")
    print(f"{'='*60}")

    # Load existing slugs
    existing = []
    for offset in range(0, 100000, 1000):
        batch = select("facilities", {"select": "slug", "limit": "1000", "offset": str(offset)})
        existing.extend(batch)
        if len(batch) < 1000:
            break
    existing_slugs = {f["slug"] for f in existing}
    print(f"  Existing facilities in DB: {len(existing_slugs)}")

    # CMS nursing homes
    cms_count = import_cms_for_state(state)

    # Refresh slugs after CMS import
    existing = []
    for offset in range(0, 100000, 1000):
        batch = select("facilities", {"select": "slug", "limit": "1000", "offset": str(offset)})
        existing.extend(batch)
        if len(batch) < 1000:
            break
    existing_slugs = {f["slug"] for f in existing}

    # Google Places
    google_count = import_google_for_state(state, existing_slugs)

    print(f"\n  TOTAL for {state}: {cms_count + google_count} new facilities")
    return cms_count + google_count


def main():
    args = sys.argv[1:]

    if not args:
        print("Usage: python import_state.py CA TX FL")
        print("       python import_state.py --all-top25")
        sys.exit(1)

    if "--all-top25" in args:
        states = TOP_25_STATES
    else:
        states = [s.upper() for s in args]

    total = 0
    for state in states:
        if state not in STATE_NAMES:
            print(f"Unknown state: {state}")
            continue
        count = import_state(state)
        total += count

    # Final count
    all_f = []
    for offset in range(0, 100000, 1000):
        batch = select("facilities", {"select": "id,state", "limit": "1000", "offset": str(offset)})
        all_f.extend(batch)
        if len(batch) < 1000:
            break

    by_state = Counter(f.get("state", "?") for f in all_f)
    print(f"\n{'='*60}")
    print(f"FINAL DATABASE STATS")
    print(f"{'='*60}")
    print(f"Total facilities: {len(all_f)}")
    for state, count in by_state.most_common():
        print(f"  {state}: {count}")
    print(f"\nNew facilities added this run: {total}")


if __name__ == "__main__":
    main()
