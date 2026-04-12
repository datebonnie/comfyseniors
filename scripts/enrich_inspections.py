"""
Enrich NJ nursing home facilities with detailed inspection data from CMS.

Pulls from CMS Health Deficiencies dataset (r5ix-sfxw):
- Deficiency descriptions
- Severity codes (A-L scale)
- Survey dates
- Category breakdown
- Correction status

Builds a plain-English inspection summary for each facility.

Run from scripts/: python enrich_inspections.py
"""

import requests
from collections import defaultdict
from supabase_client import select, update

CMS_DEFICIENCY_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/r5ix-sfxw/0"

# Scope/severity descriptions (CMS F-tag scale)
SEVERITY_DESCRIPTIONS = {
    "A": "isolated, no actual harm, potential for minimal harm",
    "B": "pattern, no actual harm, potential for minimal harm",
    "C": "widespread, no actual harm, potential for minimal harm",
    "D": "isolated, no actual harm, potential for more than minimal harm",
    "E": "pattern, no actual harm, potential for more than minimal harm",
    "F": "widespread, no actual harm, potential for more than minimal harm",
    "G": "isolated, actual harm, not immediate jeopardy",
    "H": "pattern, actual harm, not immediate jeopardy",
    "I": "widespread, actual harm, not immediate jeopardy",
    "J": "isolated, immediate jeopardy to resident health or safety",
    "K": "pattern, immediate jeopardy to resident health or safety",
    "L": "widespread, immediate jeopardy to resident health or safety",
}

# Severity levels (higher = worse)
SEVERITY_RANK = {letter: i for i, letter in enumerate("ABCDEFGHIJKL")}


def fetch_all_nj_deficiencies() -> list:
    """Fetch all NJ deficiencies from CMS, paginated."""
    print("Fetching NJ deficiencies from CMS...")
    all_rows = []
    offset = 0
    batch_size = 500

    while True:
        payload = {
            "conditions": [{"property": "state", "value": "NJ", "operator": "="}],
            "limit": batch_size,
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

        if len(results) < batch_size or len(all_rows) >= total:
            break
        offset += batch_size

    return all_rows


def build_summary(deficiencies: list) -> dict:
    """Build an inspection summary from a list of deficiencies for one facility."""
    if not deficiencies:
        return {
            "citation_count": 0,
            "last_inspection": None,
            "inspection_summary": "No recent inspection data available.",
        }

    # Latest survey date
    dates = [d.get("survey_date") for d in deficiencies if d.get("survey_date")]
    last_inspection = max(dates) if dates else None

    # Only count deficiencies from the most recent survey cycle
    recent_cycle = [d for d in deficiencies if d.get("inspection_cycle") == "1"]
    cycle_to_use = recent_cycle if recent_cycle else deficiencies

    # Total count
    total_count = len(cycle_to_use)

    # Categorize
    by_category = defaultdict(int)
    by_severity = defaultdict(int)
    serious_count = 0  # Severity G or higher = actual harm
    jeopardy_count = 0  # J/K/L = immediate jeopardy
    complaint_count = 0

    for d in cycle_to_use:
        cat = d.get("deficiency_category", "Other")
        by_category[cat] += 1

        sev = d.get("scope_severity_code", "")
        if sev:
            by_severity[sev] += 1
            rank = SEVERITY_RANK.get(sev, 0)
            if rank >= 6:  # G or higher
                serious_count += 1
            if rank >= 9:  # J or higher
                jeopardy_count += 1

        if d.get("complaint_deficiency") == "Y":
            complaint_count += 1

    # Build plain-English summary
    parts = []
    if total_count == 0:
        summary = "No deficiencies found during the last health inspection."
    else:
        parts.append(
            f"{total_count} deficienc{'y' if total_count == 1 else 'ies'} found during last health inspection"
        )

        if jeopardy_count > 0:
            parts.append(
                f" (including {jeopardy_count} flagged as immediate jeopardy to residents)"
            )
        elif serious_count > 0:
            parts.append(
                f" (including {serious_count} that caused actual harm to residents)"
            )

        if complaint_count > 0:
            parts.append(
                f", with {complaint_count} stemming from resident or family complaints"
            )

        parts.append(".")

        # Top category
        if by_category:
            top_cat = sorted(by_category.items(), key=lambda x: -x[1])[:2]
            cat_names = [c[0] for c in top_cat]
            parts.append(f" Main areas: {', '.join(cat_names)}.")

        summary = "".join(parts)

    return {
        "citation_count": total_count,
        "last_inspection": last_inspection,
        "inspection_summary": summary,
    }


def main():
    # Fetch all NJ deficiencies
    deficiencies = fetch_all_nj_deficiencies()
    print(f"\nTotal NJ deficiencies: {len(deficiencies)}")

    # Group by CCN (CMS certification number)
    by_ccn = defaultdict(list)
    for d in deficiencies:
        ccn = d.get("cms_certification_number_ccn", "")
        if ccn:
            by_ccn[ccn].append(d)

    print(f"Deficiencies across {len(by_ccn)} unique facilities")

    # Load all nursing homes from our database that have a CMS CCN
    print("\nLoading our facilities with CMS IDs...")
    all_facilities = []
    for offset in range(0, 3000, 1000):
        batch = select(
            "facilities",
            {
                "select": "id,name,license_number,care_types",
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
    print(f"Found {len(nursing_homes)} nursing homes with CMS certification numbers")

    # Match and update
    updated = 0
    no_data = 0

    for facility in nursing_homes:
        ccn = facility["license_number"]
        # CCN format in CMS: pad with zeros to 6 digits
        ccn_padded = ccn.zfill(6) if ccn.isdigit() else ccn
        ccn_stripped = ccn.lstrip("0")

        # Try multiple formats
        facility_deficiencies = (
            by_ccn.get(ccn)
            or by_ccn.get(ccn_padded)
            or by_ccn.get(ccn_stripped)
            or []
        )

        summary_data = build_summary(facility_deficiencies)

        # Add DOH report URL
        summary_data["inspection_url"] = (
            f"https://www.medicare.gov/care-compare/details/nursing-home/{ccn}"
        )

        try:
            update("facilities", {"id": facility["id"]}, summary_data)
            updated += 1
            if not facility_deficiencies:
                no_data += 1
        except Exception as e:
            print(f"  ERR: {facility['name']}: {e}")

        if updated % 50 == 0 and updated > 0:
            print(f"  Updated {updated}/{len(nursing_homes)}...")

    print(f"\nDone!")
    print(f"  Nursing homes updated: {updated}")
    print(f"  With deficiency data: {updated - no_data}")
    print(f"  No deficiency data: {no_data}")


if __name__ == "__main__":
    main()
