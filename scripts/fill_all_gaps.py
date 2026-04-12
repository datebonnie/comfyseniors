"""
Fill all remaining senior care gaps in the NJ database:
- Home care agencies (biggest gap)
- Memory care facilities
- Adult day care centers
- Hospice care
- CCRCs (Continuing Care Retirement Communities)
- Residential care homes

Scrapes Google Places API across all 21 NJ counties with targeted queries.
Only inserts facilities with phone number AND website.

Run from scripts/: python fill_all_gaps.py
"""

import re
import time
import requests
from supabase_client import select, insert

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

NJ_COUNTIES = [
    "Atlantic", "Bergen", "Burlington", "Camden", "Cape May",
    "Cumberland", "Essex", "Gloucester", "Hudson", "Hunterdon",
    "Mercer", "Middlesex", "Monmouth", "Morris", "Ocean",
    "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren",
]

# ─── Search queries by category ───
# Each query template will run for every NJ county

QUERY_CATEGORIES = {
    "Home Care": [
        "home care agency",
        "senior home care",
        "in-home senior care",
        "visiting nurse association",
        "companion care services",
        "home health aide agency",
    ],
    "Memory Care": [
        "memory care community",
        "alzheimer's care facility",
        "dementia care",
    ],
    "Adult Day Care": [
        "adult day care center",
        "senior day program",
        "adult day services",
    ],
    "Hospice": [
        "hospice care",
        "hospice services",
    ],
    "Independent Living": [
        "continuing care retirement community",
        "CCRC senior community",
        "retirement community",
    ],
    "Assisted Living": [
        "residential care home",
        "small assisted living home",
    ],
}


def slugify(name: str, city: str) -> str:
    text = f"{name} {city} nj".lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text[:120]


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


def extract_component(components: list, comp_type: str) -> str:
    for comp in components or []:
        if comp_type in comp.get("types", []):
            return comp.get("longText", comp.get("shortText", ""))
    return ""


def place_to_facility(place: dict, primary_care_type: str) -> dict | None:
    name = place.get("displayName", {}).get("text", "")
    if not name:
        return None

    components = place.get("addressComponents", [])
    state = extract_component(components, "administrative_area_level_1")
    if state and state not in ("NJ", "New Jersey"):
        return None

    city = extract_component(components, "locality") or extract_component(
        components, "sublocality_level_1"
    )
    county = extract_component(components, "administrative_area_level_2").replace(
        " County", ""
    )
    zip_code = extract_component(components, "postal_code")
    street_num = extract_component(components, "street_number")
    route = extract_component(components, "route")
    address = f"{street_num} {route}".strip() or None

    location = place.get("location", {})
    phone = place.get("nationalPhoneNumber", "") or None
    website = place.get("websiteUri", "") or None

    # REQUIRE both phone and website
    if not phone or not website:
        return None

    # Require zip and city
    if not zip_code or not city:
        return None

    # Map Adult Day Care and Hospice to closest existing care types
    # (database only supports 5 care types per schema)
    care_types_map = {
        "Adult Day Care": ["Home Care"],  # Closest: day-only, similar to home care
        "Hospice": ["Home Care"],  # Closest: in-home support
        "Home Care": ["Home Care"],
        "Memory Care": ["Memory Care"],
        "Independent Living": ["Independent Living"],
        "Assisted Living": ["Assisted Living"],
    }
    care_types = care_types_map.get(primary_care_type, ["Assisted Living"])

    # Detect additional care types from name
    name_lower = name.lower()
    if "memory" in name_lower or "alzheimer" in name_lower or "dementia" in name_lower:
        if "Memory Care" not in care_types:
            care_types.append("Memory Care")
    if "assisted" in name_lower and "Assisted Living" not in care_types:
        care_types.append("Assisted Living")
    if "nursing" in name_lower and "Nursing Home" not in care_types:
        care_types.append("Nursing Home")

    return {
        "name": name,
        "slug": slugify(name, city),
        "care_types": care_types,
        "address": address,
        "city": city,
        "state": "NJ",
        "zip": zip_code,
        "county": county or None,
        "phone": phone,
        "website": website,
        "email": None,
        "price_min": None,
        "price_max": None,
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
        "description": None,
        "amenities": None,
        "is_featured": False,
        "lat": location.get("latitude"),
        "lng": location.get("longitude"),
    }


def main():
    # Load existing slugs to avoid duplicates
    print("Loading existing facility slugs...")
    existing = []
    for offset in range(0, 2000, 1000):
        batch = select(
            "facilities",
            {"select": "slug", "limit": "1000", "offset": str(offset)},
        )
        existing.extend(batch)
    existing_slugs = {f["slug"] for f in existing}
    print(f"  {len(existing_slugs)} existing facilities")

    new_facilities = []
    seen_place_ids = set()
    request_count = 0
    stats_by_category = {}

    for category, queries in QUERY_CATEGORIES.items():
        print(f"\n{'=' * 60}")
        print(f"Category: {category}")
        print(f"{'=' * 60}")
        category_count = 0

        for query_template in queries:
            for county in NJ_COUNTIES:
                query = f"{query_template} in {county} County, New Jersey"
                try:
                    places = search_google(query)
                    request_count += 1

                    for place in places:
                        pid = place.get("id", "")
                        if pid in seen_place_ids:
                            continue
                        seen_place_ids.add(pid)

                        f = place_to_facility(place, category)
                        if f and f["slug"] not in existing_slugs:
                            new_facilities.append(f)
                            existing_slugs.add(f["slug"])
                            category_count += 1

                    time.sleep(0.2)
                except Exception as e:
                    print(f"  ERR: {query}: {e}")
                    time.sleep(0.5)

            print(f"  After '{query_template}': {category_count} new in category")

        stats_by_category[category] = category_count

    print(f"\n{'=' * 60}")
    print("SCRAPING COMPLETE")
    print(f"{'=' * 60}")
    print(f"API requests made: {request_count}")
    print(f"Total new facilities: {len(new_facilities)}")
    print(f"\nNew facilities by category:")
    for cat, count in stats_by_category.items():
        print(f"  {cat}: {count}")

    if not new_facilities:
        print("\nNo new facilities to insert.")
        return

    # Insert in batches
    print(f"\nInserting {len(new_facilities)} new facilities...")
    inserted = 0
    for i in range(0, len(new_facilities), 20):
        batch = new_facilities[i : i + 20]
        try:
            result = insert("facilities", batch, upsert=True)
            inserted += len(result)
        except Exception as e:
            # Retry individually on conflict
            for row in batch:
                try:
                    insert("facilities", [row], upsert=True)
                    inserted += 1
                except:
                    pass
        if i % 100 == 0 and i > 0:
            print(f"  {inserted} inserted...")

    print(f"\nDone! Inserted {inserted} new facilities")

    # Final stats
    print("\n--- Final database stats ---")
    all_f = []
    for offset in range(0, 3000, 1000):
        batch = select(
            "facilities",
            {"select": "care_types", "limit": "1000", "offset": str(offset)},
        )
        all_f.extend(batch)

    from collections import Counter
    types = Counter()
    for f in all_f:
        for t in (f.get("care_types") or []):
            types[t] += 1
    print(f"Total facilities: {len(all_f)}")
    for t, c in types.most_common():
        print(f"  {t}: {c}")


if __name__ == "__main__":
    main()
