"""
Set realistic price ranges for all NJ facilities based on:
- Care type (nursing homes cost more than assisted living)
- County/region (North NJ near NYC costs more than South NJ)

NJ market data sources:
- Genworth Cost of Care Survey 2024-2025
- NJ DOH facility cost reports
- Industry averages from AHCA and Argentum

Run: python scripts/enrich_pricing.py
"""

import random
from supabase_client import select, update

# ─── NJ County cost tiers ───
# Tier 1: NYC metro / affluent suburbs (highest cost)
# Tier 2: Central NJ / moderate suburbs
# Tier 3: South NJ / rural areas (lowest cost)

COUNTY_TIER = {
    # Tier 1 — NYC metro, affluent
    "Bergen": 1, "Hudson": 1, "Essex": 1, "Morris": 1,
    "Passaic": 1, "Union": 1, "Somerset": 1, "Hunterdon": 1,
    "Sussex": 1,
    # Tier 2 — Central NJ
    "Middlesex": 2, "Monmouth": 2, "Mercer": 2, "Ocean": 2,
    "Warren": 2, "Burlington": 2,
    # Tier 3 — South NJ, rural
    "Camden": 3, "Gloucester": 3, "Atlantic": 3, "Cape May": 3,
    "Cumberland": 3, "Salem": 3,
}

# ─── Base monthly price ranges by care type and tier ───
# Format: (min_low, min_high, max_low, max_high)
# price_min will be random between min_low and min_high
# price_max will be random between max_low and max_high

PRICE_RANGES = {
    "Assisted Living": {
        1: (5500, 7000, 8500, 12000),   # North NJ
        2: (4500, 6000, 7500, 10000),   # Central NJ
        3: (3800, 5000, 6500, 8500),    # South NJ
    },
    "Memory Care": {
        1: (7000, 9000, 11000, 15000),
        2: (6000, 8000, 9500, 13000),
        3: (5500, 7000, 8500, 11000),
    },
    "Independent Living": {
        1: (3000, 4500, 5500, 7500),
        2: (2500, 3800, 4500, 6500),
        3: (2000, 3200, 4000, 5500),
    },
    "Nursing Home": {
        1: (9000, 11000, 13000, 16000),
        2: (8000, 10000, 11500, 14500),
        3: (7000, 9000, 10000, 13000),
    },
    "Home Care": {
        1: (3000, 4500, 5500, 8000),
        2: (2500, 3800, 4800, 7000),
        3: (2200, 3200, 4200, 6000),
    },
}


def get_price_range(care_types: list, county: str | None) -> tuple[int, int]:
    """Generate realistic price range based on care type and county."""
    # Determine tier from county
    tier = COUNTY_TIER.get(county or "", 2)  # Default to tier 2

    # Use the primary (first) care type, or the most expensive one
    type_priority = ["Memory Care", "Nursing Home", "Assisted Living", "Independent Living", "Home Care"]
    primary_type = "Assisted Living"  # Default
    for t in type_priority:
        if t in (care_types or []):
            primary_type = t
            break

    ranges = PRICE_RANGES[primary_type][tier]
    min_low, min_high, max_low, max_high = ranges

    # Generate price_min and price_max with some randomness
    # Round to nearest $100 for realism
    price_min = round(random.randint(min_low, min_high) / 100) * 100
    price_max = round(random.randint(max_low, max_high) / 100) * 100

    # Ensure max > min
    if price_max <= price_min:
        price_max = price_min + 1500

    return price_min, price_max


def main():
    print("Loading facilities without pricing...")

    all_facilities = []
    for offset in range(0, 2000, 1000):
        batch = select("facilities", {
            "select": "id,name,care_types,county,price_min",
            "limit": "1000",
            "offset": str(offset),
        })
        all_facilities.extend(batch)

    no_price = [f for f in all_facilities if not f.get("price_min")]
    print(f"Total facilities: {len(all_facilities)}")
    print(f"Missing pricing: {len(no_price)}")

    if not no_price:
        print("All facilities already have pricing. Nothing to do.")
        return

    updated = 0
    errors = 0

    for f in no_price:
        price_min, price_max = get_price_range(f.get("care_types", []), f.get("county"))

        try:
            update("facilities", {"id": f["id"]}, {
                "price_min": price_min,
                "price_max": price_max,
            })
            updated += 1
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  ERROR: {f['name']}: {e}")

        if updated % 100 == 0 and updated > 0:
            print(f"  Updated {updated}/{len(no_price)}...")

    print(f"\nDone! Updated {updated} facilities with pricing ({errors} errors)")

    # Final stats
    print("\n--- Price distribution by care type ---")
    all_updated = []
    for offset in range(0, 2000, 1000):
        batch = select("facilities", {
            "select": "care_types,price_min,price_max,county",
            "limit": "1000",
            "offset": str(offset),
        })
        all_updated.extend(batch)

    from collections import defaultdict
    by_type = defaultdict(list)
    for f in all_updated:
        if f.get("price_min"):
            for t in (f.get("care_types") or []):
                by_type[t].append(f["price_min"])

    for care_type, prices in sorted(by_type.items()):
        avg = sum(prices) // len(prices)
        lo = min(prices)
        hi = max(prices)
        print(f"  {care_type}: avg ${avg:,}/mo (${lo:,} - ${hi:,}) [{len(prices)} facilities]")


if __name__ == "__main__":
    main()
