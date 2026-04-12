"""
Calculate county-level price benchmarks for every care type.
Stores results in the county_benchmarks table for fast lookup.

Run from scripts/: python calculate_benchmarks.py
"""

from collections import defaultdict
from statistics import median
from supabase_client import select, insert, delete


def main():
    print("Loading all facilities...")
    all_facilities = []
    for offset in range(0, 3000, 1000):
        batch = select(
            "facilities",
            {
                "select": "county,care_types,price_min,price_max",
                "limit": "1000",
                "offset": str(offset),
            },
        )
        all_facilities.extend(batch)

    print(f"Loaded {len(all_facilities)} facilities")

    # Group by (county, care_type)
    groups = defaultdict(list)
    for f in all_facilities:
        county = f.get("county")
        if not county:
            continue
        for care_type in f.get("care_types") or []:
            if f.get("price_min"):
                groups[(county, care_type)].append(
                    {
                        "min": f.get("price_min"),
                        "max": f.get("price_max") or f.get("price_min"),
                    }
                )

    # Calculate benchmarks
    benchmarks = []
    for (county, care_type), prices in groups.items():
        if len(prices) < 2:
            continue  # Skip if not enough data

        mins = [p["min"] for p in prices]
        maxs = [p["max"] for p in prices]

        benchmarks.append(
            {
                "county": county,
                "care_type": care_type,
                "avg_price_min": int(sum(mins) / len(mins)),
                "avg_price_max": int(sum(maxs) / len(maxs)),
                "median_price": int(median(mins)),
                "facility_count": len(prices),
            }
        )

    print(f"Generated {len(benchmarks)} county-type benchmarks")

    # Clear existing benchmarks and insert new ones
    # Since county_benchmarks may not exist yet, we try and skip gracefully
    try:
        # Delete all existing
        for b in benchmarks[:1]:
            # Test if table exists
            from supabase_client import SUPABASE_URL, HEADERS
            import requests
            test = requests.get(
                f"{SUPABASE_URL}/rest/v1/county_benchmarks?limit=1",
                headers=HEADERS,
            )
            if test.status_code != 200:
                print(
                    "SKIP: county_benchmarks table not yet created. "
                    "Run migration 004 first."
                )
                return
            break

        # Clear and re-insert
        requests.delete(
            f"{SUPABASE_URL}/rest/v1/county_benchmarks?county=neq.__placeholder__",
            headers=HEADERS,
        )

        # Insert in batches
        for i in range(0, len(benchmarks), 20):
            batch = benchmarks[i : i + 20]
            insert("county_benchmarks", batch, upsert=True)

        print(f"Inserted {len(benchmarks)} benchmark rows")

        # Show some stats
        print("\n--- Sample benchmarks ---")
        sample = sorted(benchmarks, key=lambda b: -b["facility_count"])[:10]
        for b in sample:
            print(
                f"  {b['county']} / {b['care_type']}: "
                f"${b['avg_price_min']:,} - ${b['avg_price_max']:,} "
                f"(median ${b['median_price']:,}) [{b['facility_count']} facilities]"
            )
    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()
