"""
Recalculate value_score for ALL facilities using the blended
quality + price formula in value_score.py.

Use this after:
  - Updating the formula in value_score.py
  - Refreshing county_benchmarks
  - Importing a new state's facility data

Usage:
    cd scripts
    python recalculate_value_scores.py            # dry-run, prints stats
    python recalculate_value_scores.py --apply    # write to DB
    python recalculate_value_scores.py --apply --state CA   # one state only
"""

import argparse
import sys
import time
from collections import Counter

sys.path.insert(0, ".")  # so `from value_score import ...` works
from supabase_client import select, update
from value_score import calculate_value_score


def load_facilities(state: str | None = None) -> list[dict]:
    print(f"[load] querying facilities" + (f" in {state}" if state else " (all)"))
    all_f = []
    for offset in range(0, 200000, 1000):
        params = {
            "select": "id,name,county,state,care_types,price_min,"
                      "overall_rating,citation_count,value_score",
            "limit": "1000",
            "offset": str(offset),
        }
        if state:
            params["state"] = f"eq.{state.upper()}"
        batch = select("facilities", params)
        all_f.extend(batch)
        if len(batch) < 1000:
            break
    print(f"[load] {len(all_f):,} facilities loaded")
    return all_f


def load_benchmarks() -> dict[tuple[str, str], int]:
    """{(county, care_type): median_price}"""
    print("[load] querying county_benchmarks")
    rows = select("county_benchmarks", {
        "select": "county,care_type,median_price",
        "limit": "100000",
    })
    bm = {}
    for r in rows:
        if r.get("county") and r.get("care_type") and r.get("median_price"):
            bm[(r["county"], r["care_type"])] = r["median_price"]
    print(f"[load] {len(bm):,} county+care benchmarks loaded")
    return bm


def recalc(state: str | None = None, apply_changes: bool = False) -> None:
    facilities = load_facilities(state=state)
    benchmarks = load_benchmarks()

    if not facilities:
        print("Nothing to recompute.")
        return

    # Compute new scores; tally changes
    delta_buckets = Counter()  # buckets like "+10 to +20", "no change", etc.
    distribution = Counter()   # buckets of new score: 0-19, 20-39, etc.
    score_changes: list[tuple[str, int, int]] = []  # (id, old, new)

    benchmark_hits = 0
    benchmark_misses = 0

    for f in facilities:
        county = f.get("county")
        cares = f.get("care_types") or []
        county_median = None
        if county and cares:
            county_median = benchmarks.get((county, cares[0]))
            if county_median:
                benchmark_hits += 1
            else:
                benchmark_misses += 1

        new = calculate_value_score(
            f.get("overall_rating"),
            f.get("citation_count"),
            f.get("price_min"),
            county_median,
        )
        old = f.get("value_score")

        if old != new:
            score_changes.append((f["id"], old or 0, new))

        # Distribution bucket of NEW score
        bucket = f"{(new // 20) * 20:>2}-{(new // 20) * 20 + 19}"
        distribution[bucket] += 1

        # Delta bucket
        if old is None:
            delta_buckets["was null → set"] += 1
        else:
            d = new - old
            if d == 0:
                delta_buckets["unchanged"] += 1
            elif -3 <= d <= 3:
                delta_buckets["±1-3"] += 1
            elif d > 3:
                delta_buckets[f"+{4 if d <= 10 else (11 if d <= 20 else 21)}+"] += 1
            else:
                delta_buckets[f"-{4 if d >= -10 else (11 if d >= -20 else 21)}+"] += 1

    print()
    print("=" * 60)
    print("Distribution of NEW scores")
    print("=" * 60)
    for bucket in sorted(distribution.keys()):
        n = distribution[bucket]
        bar = "█" * int(n / max(distribution.values()) * 40)
        print(f"  {bucket}  {n:>6,}  {bar}")
    print()
    print("=" * 60)
    print("Score deltas (new - old)")
    print("=" * 60)
    for label, n in sorted(delta_buckets.items(), key=lambda x: -x[1]):
        print(f"  {label:20} {n:>6,}")
    print()
    print(f"  Benchmark hits:   {benchmark_hits:>6,}  (price component used)")
    print(f"  Benchmark misses: {benchmark_misses:>6,}  (neutral 20pts price)")
    print(f"  Total changes:    {len(score_changes):>6,}")
    print()

    if not apply_changes:
        print("DRY RUN — no writes. Re-run with --apply to commit.")
        # Show 10 sample changes
        print()
        print("Sample changes (first 10):")
        for fid, old, new in score_changes[:10]:
            sign = "+" if new > old else ""
            print(f"  {fid[:8]}…  {old:>3} → {new:>3}  ({sign}{new - old})")
        return

    # APPLY
    print(f"Applying {len(score_changes):,} updates...")
    written = 0
    failed = 0
    t0 = time.time()
    for i, (fid, _old, new) in enumerate(score_changes, 1):
        try:
            update("facilities", {"id": fid}, {"value_score": new})
            written += 1
        except Exception as e:
            failed += 1
            if failed <= 5:
                print(f"  fail {fid[:8]}: {e}")
        if i % 500 == 0:
            elapsed = time.time() - t0
            rate = i / elapsed
            eta = (len(score_changes) - i) / rate
            print(f"  [{i:>6}/{len(score_changes):>6}]  {rate:>5.1f}/s  ETA {eta:>5.0f}s")

    print()
    print(f"Done. Written: {written:,}   Failed: {failed:,}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Actually write to DB")
    ap.add_argument("--state", help="Limit to one state, e.g. CA")
    args = ap.parse_args()
    recalc(state=args.state, apply_changes=args.apply)
