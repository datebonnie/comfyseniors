"""
Scrape top-rated assisted living, memory care, and senior care facilities
in NJ from Google Places API, then import the top 25% by rating.

Run: python scripts/import_google_places.py
"""

import re
import time
import requests
from supabase_client import insert

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"

PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.userRatingCount",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.location",
    "places.types",
    "places.addressComponents",
])

HEADERS = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": API_KEY,
    "X-Goog-FieldMask": FIELD_MASK,
}

# All 21 NJ counties
NJ_COUNTIES = [
    "Atlantic", "Bergen", "Burlington", "Camden", "Cape May",
    "Cumberland", "Essex", "Gloucester", "Hudson", "Hunterdon",
    "Mercer", "Middlesex", "Monmouth", "Morris", "Ocean",
    "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren",
]

# Search queries to cover all senior care types
SEARCH_QUERIES = [
    "assisted living facilities",
    "memory care facilities",
    "senior living communities",
    "independent living for seniors",
]


def slugify(name: str, city: str) -> str:
    text = f"{name} {city} nj".lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text[:120]


def search_places(query: str, next_page_token: str = None) -> dict:
    """Search Google Places API."""
    payload = {
        "textQuery": query,
        "maxResultCount": 20,
    }
    if next_page_token:
        payload["pageToken"] = next_page_token

    r = requests.post(PLACES_URL, json=payload, headers=HEADERS, timeout=20)
    r.raise_for_status()
    return r.json()


def extract_address_component(components: list, comp_type: str) -> str:
    """Extract a specific address component by type."""
    for comp in components or []:
        if comp_type in comp.get("types", []):
            return comp.get("longText", comp.get("shortText", ""))
    return ""


def determine_care_types(place: dict) -> list[str]:
    """Determine care types from Google place types and name."""
    name = (place.get("displayName", {}).get("text", "") or "").lower()
    types = place.get("types", [])

    care_types = []

    if "memory care" in name or "alzheimer" in name or "dementia" in name:
        care_types.append("Memory Care")
    if "assisted living" in name or "assisted" in name:
        care_types.append("Assisted Living")
    if "independent living" in name or "independent" in name:
        care_types.append("Independent Living")
    if "nursing" in name or "skilled nursing" in name or "rehab" in name:
        care_types.append("Nursing Home")
    if "home care" in name or "home health" in name or "visiting" in name:
        care_types.append("Home Care")

    # Default based on search context
    if not care_types:
        if "senior_living" in types or "senior" in name:
            care_types.append("Assisted Living")
        else:
            care_types.append("Assisted Living")

    return care_types


def transform_place(place: dict) -> dict:
    """Transform a Google Places result into our facility schema."""
    name = place.get("displayName", {}).get("text", "")
    address = place.get("formattedAddress", "")
    components = place.get("addressComponents", [])
    location = place.get("location", {})

    city = extract_address_component(components, "locality")
    if not city:
        city = extract_address_component(components, "sublocality_level_1")
    if not city:
        city = extract_address_component(components, "administrative_area_level_3")

    county = extract_address_component(components, "administrative_area_level_2")
    # Remove " County" suffix
    county = county.replace(" County", "").strip()

    zip_code = extract_address_component(components, "postal_code")
    street = extract_address_component(components, "street_number")
    route = extract_address_component(components, "route")
    street_address = f"{street} {route}".strip() if street or route else ""

    state = extract_address_component(components, "administrative_area_level_1")

    # Skip non-NJ results
    if state and state not in ("NJ", "New Jersey"):
        return None

    rating = place.get("rating", 0) or 0
    review_count = place.get("userRatingCount", 0) or 0
    phone = place.get("nationalPhoneNumber", "")
    website = place.get("websiteUri", "")

    care_types = determine_care_types(place)

    return {
        "name": name,
        "slug": slugify(name, city or "nj"),
        "care_types": care_types,
        "address": street_address or address.split(",")[0] if address else None,
        "city": city or None,
        "state": "NJ",
        "zip": zip_code or None,
        "county": county or None,
        "phone": phone or None,
        "website": website or None,
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
        "google_rating": rating,
        "google_review_count": review_count,
    }


def main():
    all_places = {}  # Dedupe by Google place ID
    request_count = 0

    for query_template in SEARCH_QUERIES:
        for county in NJ_COUNTIES:
            query = f"{query_template} in {county} County, New Jersey"
            print(f"Searching: {query}")

            try:
                data = search_places(query)
                request_count += 1
                places = data.get("places", [])

                for place in places:
                    place_id = place.get("id", "")
                    if place_id and place_id not in all_places:
                        all_places[place_id] = place

                print(f"  Found {len(places)} results (total unique: {len(all_places)})")

                # Rate limiting — be polite
                time.sleep(0.3)

            except Exception as e:
                print(f"  ERROR: {e}")
                time.sleep(1)

    print(f"\n--- Scraping complete ---")
    print(f"API requests made: {request_count}")
    print(f"Total unique places found: {len(all_places)}")

    # Transform all places
    facilities = []
    for place in all_places.values():
        f = transform_place(place)
        if f and f["name"]:
            facilities.append(f)

    print(f"Valid NJ facilities: {len(facilities)}")

    if not facilities:
        print("No facilities found. Exiting.")
        return

    # Sort by rating descending
    facilities.sort(key=lambda f: (f.get("google_rating", 0), f.get("google_review_count", 0)), reverse=True)

    # Take top 25%
    cutoff = max(1, len(facilities) // 4)
    top_facilities = facilities[:cutoff]

    # Find the minimum rating in the top 25%
    min_rating = top_facilities[-1].get("google_rating", 0)
    print(f"\nTop 25% cutoff: {cutoff} facilities (minimum rating: {min_rating})")

    # Remove google-specific fields before inserting
    for f in top_facilities:
        f.pop("google_rating", None)
        f.pop("google_review_count", None)

    # Dedupe slugs
    seen_slugs = set()
    deduped = []
    for f in top_facilities:
        if f["slug"] not in seen_slugs:
            deduped.append(f)
            seen_slugs.add(f["slug"])
    top_facilities = deduped

    print(f"After dedup: {len(top_facilities)} facilities to insert")

    # Insert in batches
    batch_size = 20
    inserted = 0

    for i in range(0, len(top_facilities), batch_size):
        batch = top_facilities[i : i + batch_size]
        try:
            result = insert("facilities", batch, upsert=True)
            inserted += len(result)
            print(f"  Batch {i // batch_size + 1}: {len(result)} rows")
        except Exception as e:
            print(f"  ERROR batch {i // batch_size + 1}: {e}")
            # Try individually
            for row in batch:
                try:
                    insert("facilities", [row], upsert=True)
                    inserted += 1
                except Exception as e2:
                    print(f"    SKIP: {row['name']} -> {e2}")

    print(f"\nDone! Inserted {inserted} top-rated facilities.")


if __name__ == "__main__":
    main()
