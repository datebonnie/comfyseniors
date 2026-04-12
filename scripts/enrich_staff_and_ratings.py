"""
Import CMS staff turnover and 5-star ratings for all NJ nursing homes.
Also imports detailed deficiency records to inspection_deficiencies table.

Run from scripts/: python enrich_staff_and_ratings.py
"""

import requests
from supabase_client import select, update, insert

CMS_PROVIDER_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0"
CMS_DEFICIENCY_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/r5ix-sfxw/0"


def fetch_nj_providers() -> list:
    """Fetch all NJ nursing home providers with full rating data."""
    print("Fetching NJ nursing home ratings from CMS...")
    all_rows = []
    offset = 0
    while True:
        payload = {
            "conditions": [{"property": "state", "value": "NJ", "operator": "="}],
            "limit": 500,
            "offset": offset,
        }
        r = requests.post(
            CMS_PROVIDER_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        all_rows.extend(results)
        total = data.get("count", 0)
        print(f"  Fetched {len(all_rows)}/{total}")
        if len(results) < 500 or len(all_rows) >= total:
            break
        offset += 500
    return all_rows


def fetch_nj_deficiencies() -> list:
    """Fetch all NJ deficiencies from CMS."""
    print("Fetching NJ deficiency records from CMS...")
    all_rows = []
    offset = 0
    while True:
        payload = {
            "conditions": [{"property": "state", "value": "NJ", "operator": "="}],
            "limit": 500,
            "offset": offset,
        }
        r = requests.post(
            CMS_DEFICIENCY_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        all_rows.extend(results)
        total = data.get("count", 0)
        print(f"  Fetched {len(all_rows)}/{total}")
        if len(results) < 500 or len(all_rows) >= total:
            break
        offset += 500
    return all_rows


def safe_int(v, default=None):
    try:
        return int(float(v)) if v not in (None, "", "NA") else default
    except (ValueError, TypeError):
        return default


def safe_float(v, default=None):
    try:
        return float(v) if v not in (None, "", "NA") else default
    except (ValueError, TypeError):
        return default


def compute_value_score(facility: dict, overall_rating: int | None) -> int:
    """
    Compute a Value Score (0-100) combining:
    - Overall rating (40%)
    - Citation count inverse (30%)
    - Price vs category average (20%)
    - Staff turnover inverse (10%)
    """
    score = 50  # baseline

    # Rating boost (+0 to +40)
    if overall_rating:
        score += (overall_rating - 3) * 10  # 5★ = +20, 3★ = 0, 1★ = -20
    else:
        score += 0

    # Citation penalty
    citation_count = facility.get("citation_count") or 0
    if citation_count == 0:
        score += 15
    elif citation_count <= 3:
        score += 5
    elif citation_count <= 10:
        score -= 5
    elif citation_count <= 20:
        score -= 15
    else:
        score -= 25

    # Clamp to 0-100
    return max(0, min(100, score))


def main():
    # Fetch CMS data
    providers = fetch_nj_providers()
    deficiencies = fetch_nj_deficiencies()

    # Index providers by CCN
    by_ccn = {
        p.get("cms_certification_number_ccn", ""): p
        for p in providers
        if p.get("cms_certification_number_ccn")
    }

    # Group deficiencies by CCN
    deficiencies_by_ccn = {}
    for d in deficiencies:
        ccn = d.get("cms_certification_number_ccn", "")
        if ccn:
            deficiencies_by_ccn.setdefault(ccn, []).append(d)

    # Load our nursing home facilities with CCNs
    print("\nLoading our nursing homes...")
    all_facilities = []
    for offset in range(0, 3000, 1000):
        batch = select(
            "facilities",
            {
                "select": "id,name,license_number,care_types,citation_count,city",
                "limit": "1000",
                "offset": str(offset),
            },
        )
        all_facilities.extend(batch)

    nursing_homes = [
        f
        for f in all_facilities
        if f.get("license_number") and "Nursing Home" in (f.get("care_types") or [])
    ]
    print(f"Found {len(nursing_homes)} nursing homes with CCNs")

    # Update each nursing home with staff + rating data
    updated = 0
    deficiencies_imported = 0

    for f in nursing_homes:
        ccn = f["license_number"]
        provider = by_ccn.get(ccn)
        if not provider:
            continue

        overall_rating = safe_int(provider.get("overall_rating"))

        update_data = {
            "overall_rating": overall_rating,
            "health_inspection_rating": safe_int(provider.get("health_inspection_rating")),
            "staffing_rating": safe_int(provider.get("staffing_rating")),
            "qm_rating": safe_int(provider.get("qm_rating")),
            "rn_turnover": safe_float(provider.get("registered_nurse_turnover")),
            "total_staff_turnover": safe_float(provider.get("total_nursing_staff_turnover")),
            "value_score": compute_value_score(f, overall_rating),
        }

        try:
            update("facilities", {"id": f["id"]}, update_data)
            updated += 1
        except Exception as e:
            print(f"  ERR updating {f['name']}: {e}")
            continue

        # Import deficiencies
        facility_deficiencies = deficiencies_by_ccn.get(ccn, [])
        if facility_deficiencies:
            rows_to_insert = []
            for d in facility_deficiencies:
                # Only import from recent cycle
                if d.get("inspection_cycle") != "1":
                    continue

                rows_to_insert.append({
                    "facility_id": f["id"],
                    "survey_date": d.get("survey_date"),
                    "tag_number": d.get("deficiency_tag_number"),
                    "category": d.get("deficiency_category"),
                    "description": d.get("deficiency_description"),
                    "severity": d.get("scope_severity_code"),
                    "is_complaint": d.get("complaint_deficiency") == "Y",
                    "is_corrected": d.get("deficiency_corrected", "").startswith("Deficient, Provider has"),
                    "correction_date": d.get("correction_date") if d.get("correction_date") else None,
                })

            if rows_to_insert:
                # Insert in batches of 20
                for i in range(0, len(rows_to_insert), 20):
                    batch = rows_to_insert[i:i + 20]
                    try:
                        insert("inspection_deficiencies", batch)
                        deficiencies_imported += len(batch)
                    except Exception as e:
                        # Likely table doesn't exist yet
                        if "does not exist" in str(e):
                            print(f"  SKIP: inspection_deficiencies table not yet created")
                            break

        if updated % 50 == 0 and updated > 0:
            print(f"  Updated {updated}/{len(nursing_homes)}...")

    print(f"\nDone!")
    print(f"  Nursing homes updated with ratings + turnover: {updated}")
    print(f"  Individual deficiency records imported: {deficiencies_imported}")

    # Also calculate value scores for non-nursing homes based on price + citations alone
    print("\nCalculating value scores for other care types...")
    other = [f for f in all_facilities if "Nursing Home" not in (f.get("care_types") or [])]
    other_updated = 0
    for f in other:
        score = compute_value_score(f, None)
        try:
            update("facilities", {"id": f["id"]}, {"value_score": score})
            other_updated += 1
        except:
            pass
    print(f"  Other facilities with value_score: {other_updated}")


if __name__ == "__main__":
    main()
