"""
Import all NJ senior care facilities from the CMS (Centers for Medicare & Medicaid Services)
federal provider data API into Supabase.

Sources:
  - Nursing homes: dataset 4pq5-n9py (348+ NJ facilities)
  - Home health agencies: dataset 6jpm-sxkc (38+ NJ facilities)

Run: python scripts/import_cms_facilities.py
"""

import re
import requests
from supabase_client import insert, select

CMS_BASE = "https://data.cms.gov/provider-data/api/1/datastore/query"


def slugify(name: str, city: str) -> str:
    text = f"{name} {city} nj".lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text).strip("-")
    return text[:120]  # Max slug length


def title_case(s: str) -> str:
    """Convert 'ALL CAPS NAME' to 'All Caps Name'."""
    if not s:
        return s
    # Handle common abbreviations
    words = s.lower().split()
    result = []
    for word in words:
        if word in ("llc", "inc", "lp", "lp.", "ii", "iii", "iv"):
            result.append(word.upper())
        elif word in ("of", "at", "the", "and", "in", "for", "by"):
            result.append(word)
        else:
            result.append(word.capitalize())
    # Always capitalize first word
    if result:
        result[0] = result[0].capitalize()
    return " ".join(result)


def format_phone(phone: str) -> str:
    """Format 10-digit phone to (XXX) XXX-XXXX."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return phone or ""


def fetch_nursing_homes() -> list[dict]:
    """Fetch all NJ nursing homes from CMS dataset 4pq5-n9py."""
    print("Fetching NJ nursing homes from CMS...")
    all_results = []
    offset = 0
    batch_size = 100

    while True:
        payload = {
            "conditions": [{"property": "state", "value": "NJ", "operator": "="}],
            "limit": batch_size,
            "offset": offset,
        }
        r = requests.post(
            f"{CMS_BASE}/4pq5-n9py/0",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        all_results.extend(results)
        total = data.get("count", 0)
        print(f"  Fetched {len(all_results)}/{total}")

        if len(all_results) >= total or len(results) < batch_size:
            break
        offset += batch_size

    return all_results


def fetch_home_health() -> list[dict]:
    """Fetch all NJ home health agencies from CMS dataset 6jpm-sxkc."""
    print("Fetching NJ home health agencies from CMS...")
    payload = {
        "conditions": [{"property": "state", "value": "NJ", "operator": "="}],
        "limit": 500,
    }
    r = requests.post(
        f"{CMS_BASE}/6jpm-sxkc/0",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    results = data.get("results", [])
    print(f"  Fetched {len(results)}/{data.get('count', '?')}")
    return results


def transform_nursing_home(row: dict) -> dict:
    """Transform a CMS nursing home row into our facility schema."""
    name = title_case(row.get("provider_name", ""))
    city = title_case(row.get("citytown", ""))

    # Map CMS overall rating (1-5) to citation count estimate
    overall_rating = int(row.get("overall_rating", 0) or 0)
    health_rating = int(row.get("health_inspection_rating", 0) or 0)

    # Use actual deficiency counts from inspection cycles
    cycle1_deficiencies = int(
        row.get("rating_cycle_1_total_number_of_health_deficiencies", 0) or 0
    )

    # Determine care types
    care_types = ["Nursing Home"]
    if row.get("continuing_care_retirement_community") == "Y":
        care_types.append("Independent Living")
        care_types.append("Assisted Living")

    # Inspection date
    inspection_date = row.get("rating_cycle_1_standard_survey_health_date")

    # Build inspection summary
    if cycle1_deficiencies == 0:
        summary = "No deficiencies found during last health inspection."
    elif cycle1_deficiencies <= 2:
        summary = f"{cycle1_deficiencies} deficiency found during last health inspection."
    else:
        complaint_defs = int(
            row.get("rating_cycle_1_number_of_complaint_health_deficiencies", 0) or 0
        )
        summary = f"{cycle1_deficiencies} deficiencies found during last health inspection"
        if complaint_defs > 0:
            summary += f", including {complaint_defs} from complaints"
        summary += "."

    return {
        "name": name,
        "slug": slugify(name, city),
        "care_types": care_types,
        "address": title_case(row.get("provider_address", "")),
        "city": city,
        "state": "NJ",
        "zip": row.get("zip_code", ""),
        "county": title_case(row.get("countyparish", "")),
        "phone": format_phone(row.get("telephone_number", "")),
        "website": None,
        "email": None,
        "price_min": None,  # CMS doesn't have pricing
        "price_max": None,
        "beds": int(row.get("number_of_certified_beds", 0) or 0) or None,
        "license_number": row.get("cms_certification_number_ccn", ""),
        "license_status": "Active",
        "citation_count": cycle1_deficiencies,
        "last_inspection": inspection_date,
        "inspection_summary": summary,
        "inspection_url": f"https://www.medicare.gov/care-compare/details/nursing-home/{row.get('cms_certification_number_ccn', '')}",
        "accepts_medicaid": "Medicaid" in (row.get("provider_type", "") or ""),
        "accepts_medicare": "Medicare" in (row.get("provider_type", "") or ""),
        "accepts_private": True,
        "languages": ["English"],
        "description": None,
        "amenities": None,
        "is_featured": False,
        "lat": float(row.get("latitude", 0) or 0) or None,
        "lng": float(row.get("longitude", 0) or 0) or None,
    }


def transform_home_health(row: dict) -> dict:
    """Transform a CMS home health row into our facility schema."""
    name = title_case(row.get("provider_name", ""))
    city = title_case(row.get("city", row.get("citytown", "")))
    address = title_case(row.get("address", row.get("provider_address", "")))
    phone = format_phone(row.get("phone", row.get("telephone_number", "")))
    zip_code = row.get("zip", row.get("zip_code", ""))
    county = title_case(row.get("county", row.get("countyparish", "")))

    return {
        "name": name,
        "slug": slugify(name, city),
        "care_types": ["Home Care"],
        "address": address,
        "city": city,
        "state": "NJ",
        "zip": zip_code,
        "county": county,
        "phone": phone,
        "website": None,
        "email": None,
        "price_min": None,
        "price_max": None,
        "beds": None,
        "license_number": row.get("cms_certification_number_ccn", row.get("ccn", "")),
        "license_status": "Active",
        "citation_count": 0,
        "last_inspection": None,
        "inspection_summary": None,
        "inspection_url": None,
        "accepts_medicaid": True,
        "accepts_medicare": True,
        "accepts_private": True,
        "languages": ["English"],
        "description": None,
        "amenities": None,
        "is_featured": False,
        "lat": None,
        "lng": None,
    }


def main():
    # Clear seed data first (keep only real data)
    print("Fetching existing facility count...")
    existing = select("facilities", {"select": "id", "limit": "1"})
    if existing:
        print(f"  Found existing facilities. New data will be upserted by slug.")

    # Fetch from CMS
    nursing = fetch_nursing_homes()
    home_health = fetch_home_health()

    # Transform
    facilities = []
    seen_slugs = set()

    for row in nursing:
        f = transform_nursing_home(row)
        if f["slug"] not in seen_slugs and f["name"]:
            facilities.append(f)
            seen_slugs.add(f["slug"])

    for row in home_health:
        f = transform_home_health(row)
        if f["slug"] not in seen_slugs and f["name"]:
            facilities.append(f)
            seen_slugs.add(f["slug"])

    print(f"\nTotal facilities to insert: {len(facilities)}")
    print(f"  Nursing homes: {len(nursing)}")
    print(f"  Home health: {len(home_health)}")

    # Insert in batches
    batch_size = 25
    inserted = 0
    errors = 0

    for i in range(0, len(facilities), batch_size):
        batch = facilities[i : i + batch_size]
        try:
            result = insert("facilities", batch, upsert=True)
            inserted += len(result)
            print(f"  Batch {i // batch_size + 1}: {len(result)} rows inserted")
        except Exception as e:
            errors += 1
            print(f"  ERROR batch {i // batch_size + 1}: {e}")
            # Try one by one for failed batches
            for row in batch:
                try:
                    insert("facilities", [row], upsert=True)
                    inserted += 1
                except Exception as e2:
                    print(f"    SKIP: {row['name']} -> {e2}")

    print(f"\nDone! Inserted {inserted} facilities ({errors} batch errors).")


if __name__ == "__main__":
    main()
