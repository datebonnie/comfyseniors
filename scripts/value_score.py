"""
Value Score formula for ComfySeniors facilities.

Single source of truth — imported by full_enrichment.py and
recalculate_value_scores.py. Any future tweaks happen here, in one place.

The score blends two axes:
  1. QUALITY (0-60 pts) — CMS overall rating + recent citation count
  2. PRICE  (0-40 pts) — facility price relative to county median

Weighting: quality dominates (60%), price modifies (40%). A high-quality
facility at a fair price scores 100; a low-quality facility at a premium
price scores near 0; an average facility at the median scores ~67.

Missing data is handled gracefully:
  - No CMS rating (e.g. assisted living, home care): quality contribution
    falls back to citation-only signal
  - No citation data: assume "neutral" (4 citations bucket)
  - No price OR no county benchmark: price contribution falls back to
    neutral 20 pts (treats the facility as priced at median)

Range: 0-100, clamped.
"""

from typing import Optional


def quality_component(
    overall_rating: Optional[int],
    citation_count: Optional[int],
) -> int:
    """
    QUALITY signal — 0 to 60 points.

    Base 30. CMS rating moves ±20. Citations move +10/-15.
    """
    pts = 30

    # CMS overall rating (1-5 stars). None = neutral, no adjustment.
    if overall_rating is not None:
        if overall_rating >= 5:
            pts += 20
        elif overall_rating == 4:
            pts += 12
        elif overall_rating == 3:
            pts += 6
        elif overall_rating == 2:
            pts -= 3
        elif overall_rating <= 1:
            pts -= 10

    # Citation count from most recent inspection cycle
    c = citation_count if citation_count is not None else 4  # neutral fallback
    if c == 0:
        pts += 10
    elif c <= 3:
        pts += 5
    elif c <= 10:
        pts += 0
    elif c <= 20:
        pts -= 8
    else:
        pts -= 15

    return max(0, min(60, pts))


def price_component(
    facility_price_min: Optional[int],
    county_median_price: Optional[int],
) -> int:
    """
    PRICE signal — 0 to 40 points.

    Compares facility's lower-bound price to its county median for the
    same care type. Cheaper than median = higher score.

    Missing price OR missing benchmark = neutral 20 pts.
    """
    if not facility_price_min or not county_median_price or county_median_price <= 0:
        return 20  # neutral — treat as median-priced

    ratio = facility_price_min / county_median_price

    if ratio <= 0.70:
        return 40  # 30%+ cheaper than median
    elif ratio <= 0.85:
        return 32  # 15-30% cheaper
    elif ratio <= 0.95:
        return 26  # 5-15% cheaper
    elif ratio <= 1.05:
        return 20  # within 5% of median (neutral)
    elif ratio <= 1.15:
        return 14  # 5-15% over median
    elif ratio <= 1.30:
        return 8   # 15-30% over median
    else:
        return 4   # 30%+ over median


def calculate_value_score(
    overall_rating: Optional[int],
    citation_count: Optional[int],
    facility_price_min: Optional[int],
    county_median_price: Optional[int],
) -> int:
    """
    Final blended value score, 0-100.

    quality (0-60) + price (0-40) → clamped 0-100.
    """
    q = quality_component(overall_rating, citation_count)
    p = price_component(facility_price_min, county_median_price)
    return max(0, min(100, q + p))


# ── Self-test (run with: python value_score.py) ──────────────────────
if __name__ == "__main__":
    cases = [
        ("Top tier, deep discount",      5, 0,  3500, 5000, 100),
        ("Top tier, at median",          5, 0,  5000, 5000,  80),
        ("Top tier, premium-priced",     5, 0,  7000, 5000,  74),
        ("4★, clean, at median",         4, 0,  5000, 5000,  72),
        ("4★, 2 citations, at median",   4, 2,  5000, 5000,  67),
        ("3★, 5 citations, at median",   3, 5,  5000, 5000,  56),
        ("2★, 12 citations, +20% over",  2, 12, 6000, 5000,  27),
        ("1★, 25 citations, +30% over",  1, 25, 6500, 5000,  9),
        ("No CMS data, clean, cheap",    None, 0,  3500, 5000, 80),
        ("No CMS data, neutral, no benchmark", None, None, None, None, 50),
    ]
    print(f"{'CASE':45} {'GOT':>5} {'EXPECTED':>10}")
    print("-" * 65)
    for label, rating, citations, price, median, expected in cases:
        got = calculate_value_score(rating, citations, price, median)
        marker = "OK" if abs(got - expected) <= 3 else "FAIL"
        print(f"{label:45} {got:>5} {expected:>10}  {marker}")
