"""
1. Scrape MORE assisted living / memory care facilities from Google Places
   to close the gap toward 260 assisted living.
2. Enrich ALL existing facilities with website + phone from Google Places.
3. Remove duplicates.

Run: python scripts/enrich_and_expand.py
"""

import re
import time
import requests
from supabase_client import select, insert, update

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"
DETAILS_URL = "https://places.googleapis.com/v1/places"

# NJ cities with high senior populations — targeted search for assisted living
NJ_CITIES = [
    "Hackensack", "Paramus", "Teaneck", "Fort Lee", "Ridgewood",
    "Montclair", "West Orange", "Livingston", "Millburn", "Short Hills",
    "Summit", "Westfield", "Cranford", "Scotch Plains", "Clark",
    "Edison", "Woodbridge", "Piscataway", "New Brunswick", "Old Bridge",
    "Marlboro", "Freehold", "Red Bank", "Long Branch", "Asbury Park",
    "Toms River", "Lakewood", "Brick", "Jackson", "Manchester",
    "Cherry Hill", "Voorhees", "Moorestown", "Mount Laurel", "Marlton",
    "Princeton", "Hamilton", "Lawrenceville", "Trenton", "Ewing",
    "Wayne", "Parsippany", "Morristown", "Dover", "Denville",
    "Hoboken", "Jersey City", "Bayonne", "Secaucus", "North Bergen",
    "Elizabeth", "Union", "Plainfield", "Linden", "Rahway",
    "Vineland", "Millville", "Bridgeton", "Salem",
    "Atlantic City", "Egg Harbor", "Galloway", "Pleasantville",
    "Newton", "Sparta", "Vernon",
    "Flemington", "Clinton", "Lambertville",
    "Somerville", "Bernardsville", "Bound Brook", "Bridgewater",
    "Cape May", "Wildwood", "Ocean City",
    "Paterson", "Clifton", "Passaic", "Hawthorne",
    "Gloucester", "Deptford", "Washington Township",
]


def slugify(name: str, city: str) -> str:
    text = f"{name} {city} nj".lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text[:120]


def extract_component(components: list, comp_type: str) -> str:
    for comp in components or []:
        if comp_type in comp.get("types", []):
            return comp.get("longText", comp.get("shortText", ""))
    return ""


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


def place_to_facility(place: dict) -> dict | None:
    name = place.get("displayName", {}).get("text", "")
    if not name:
        return None

    components = place.get("addressComponents", [])
    state = extract_component(components, "administrative_area_level_1")
    if state and state not in ("NJ", "New Jersey"):
        return None

    city = extract_component(components, "locality") or extract_component(components, "sublocality_level_1")
    county = extract_component(components, "administrative_area_level_2").replace(" County", "")
    zip_code = extract_component(components, "postal_code")
    street_num = extract_component(components, "street_number")
    route = extract_component(components, "route")
    address = f"{street_num} {route}".strip() or None

    location = place.get("location", {})
    phone = place.get("nationalPhoneNumber", "") or None
    website = place.get("websiteUri", "") or None

    # Determine care types from name
    name_lower = name.lower()
    care_types = []
    if "memory" in name_lower or "alzheimer" in name_lower or "dementia" in name_lower:
        care_types.append("Memory Care")
    if "assisted" in name_lower:
        care_types.append("Assisted Living")
    if "independent" in name_lower:
        care_types.append("Independent Living")
    if "nursing" in name_lower or "rehab" in name_lower or "skilled" in name_lower:
        care_types.append("Nursing Home")
    if "home care" in name_lower or "home health" in name_lower:
        care_types.append("Home Care")
    if not care_types:
        care_types.append("Assisted Living")

    return {
        "name": name,
        "slug": slugify(name, city or "nj"),
        "care_types": care_types,
        "address": address,
        "city": city or None,
        "state": "NJ",
        "zip": zip_code or None,
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


def phase1_expand_assisted_living():
    """Find more assisted living / memory care facilities."""
    print("=" * 60)
    print("PHASE 1: Expanding assisted living / memory care coverage")
    print("=" * 60)

    existing = select("facilities", {"select": "slug", "limit": "2000"})
    existing_slugs = {f["slug"] for f in existing}
    print(f"Existing facilities: {len(existing_slugs)}")

    new_facilities = []
    seen_ids = set()
    request_count = 0

    queries = [
        "assisted living facility in {city}, NJ",
        "memory care facility in {city}, NJ",
        "senior assisted living in {city}, NJ",
    ]

    for query_tpl in queries:
        for city in NJ_CITIES:
            query = query_tpl.format(city=city)
            try:
                places = search_google(query)
                request_count += 1

                for place in places:
                    pid = place.get("id", "")
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)

                    f = place_to_facility(place)
                    if f and f["slug"] not in existing_slugs:
                        # Only keep if it has actual contact info
                        if f.get("phone") or f.get("website"):
                            new_facilities.append(f)
                            existing_slugs.add(f["slug"])

                time.sleep(0.25)
            except Exception as e:
                print(f"  ERROR: {query}: {e}")
                time.sleep(1)

        print(f"  After '{queries.index(query_tpl)+1}/{len(queries)}' queries: {len(new_facilities)} new facilities ({request_count} API calls)")

    print(f"\nNew facilities with contact info: {len(new_facilities)}")

    if new_facilities:
        # Insert in batches
        inserted = 0
        for i in range(0, len(new_facilities), 20):
            batch = new_facilities[i:i + 20]
            try:
                result = insert("facilities", batch, upsert=True)
                inserted += len(result)
            except Exception as e:
                for row in batch:
                    try:
                        insert("facilities", [row], upsert=True)
                        inserted += 1
                    except:
                        pass
        print(f"Inserted {inserted} new assisted living / memory care facilities")

    return request_count


def phase2_enrich_contacts():
    """Enrich existing facilities missing website with Google data."""
    print("\n" + "=" * 60)
    print("PHASE 2: Enriching facilities with website + phone")
    print("=" * 60)

    # Get facilities missing website
    all_facilities = select("facilities", {"select": "id,name,city,phone,website", "limit": "2000"})
    missing_website = [f for f in all_facilities if not f.get("website")]
    print(f"Facilities missing website: {len(missing_website)}")

    enriched = 0
    request_count = 0

    for f in missing_website:
        query = f"{f['name']} {f.get('city', '')} NJ"
        try:
            places = search_google(query)
            request_count += 1

            if places:
                top = places[0]
                website = top.get("websiteUri")
                phone = top.get("nationalPhoneNumber")

                updates = {}
                if website:
                    updates["website"] = website
                if phone and not f.get("phone"):
                    updates["phone"] = phone

                if updates:
                    update("facilities", {"id": f["id"]}, updates)
                    enriched += 1

            time.sleep(0.25)
        except Exception as e:
            time.sleep(0.5)

        # Progress update every 50
        if request_count % 50 == 0:
            print(f"  Progress: {request_count}/{len(missing_website)} checked, {enriched} enriched")

    print(f"Enriched {enriched} facilities with contact info ({request_count} API calls)")
    return request_count


def phase3_dedup():
    """Remove duplicate facilities by similar name + city."""
    print("\n" + "=" * 60)
    print("PHASE 3: Removing duplicates")
    print("=" * 60)

    all_facilities = select("facilities", {"select": "id,name,city,slug,phone,website,care_types", "limit": "2000"})
    print(f"Total before dedup: {len(all_facilities)}")

    # Group by normalized name + city
    def normalize(name):
        return re.sub(r"[^a-z0-9]", "", (name or "").lower())

    groups = {}
    for f in all_facilities:
        key = normalize(f["name"]) + "|" + normalize(f.get("city") or "")
        if key not in groups:
            groups[key] = []
        groups[key].append(f)

    duplicates_to_remove = []
    for key, group in groups.items():
        if len(group) > 1:
            # Keep the one with the most contact info
            group.sort(key=lambda f: (
                1 if f.get("website") else 0,
                1 if f.get("phone") else 0,
            ), reverse=True)
            # Remove all but the best one
            for dup in group[1:]:
                duplicates_to_remove.append(dup)

    print(f"Duplicates found: {len(duplicates_to_remove)}")

    if duplicates_to_remove:
        from supabase_client import delete
        for dup in duplicates_to_remove:
            try:
                delete("facilities", {"id": dup["id"]})
            except Exception as e:
                print(f"  Could not delete {dup['name']}: {e}")
        print(f"Removed {len(duplicates_to_remove)} duplicates")

    final = select("facilities", {"select": "id", "limit": "2000"})
    print(f"Total after dedup: {len(final)}")


def main():
    total_api_calls = 0

    total_api_calls += phase1_expand_assisted_living()
    total_api_calls += phase2_enrich_contacts()
    phase3_dedup()

    # Final stats
    print("\n" + "=" * 60)
    print("FINAL STATS")
    print("=" * 60)
    all_f = select("facilities", {"select": "id,phone,website,email,care_types", "limit": "2000"})
    print(f"Total facilities: {len(all_f)}")
    print(f"Has phone:   {sum(1 for f in all_f if f.get('phone'))}")
    print(f"Has website: {sum(1 for f in all_f if f.get('website'))}")

    from collections import Counter
    types = Counter()
    for f in all_f:
        for t in (f.get("care_types") or []):
            types[t] += 1
    for t, c in types.most_common():
        print(f"  {t}: {c}")

    print(f"\nTotal Google API calls: {total_api_calls}")


if __name__ == "__main__":
    main()
