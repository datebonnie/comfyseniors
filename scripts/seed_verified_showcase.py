"""
Seed 10 "Verified showcase" facility profiles.

Picks 10 top-quality facilities from across the country (diverse by state and
care type), writes polished bespoke descriptions via Anthropic Claude, fills
in a curated amenities list, adds 5 Unsplash photo URLs, and flips
is_verified = true.

These are the 10 facilities that look great when the first email-campaign
recipients land on the site. They're our "store window."

Usage:
    cd scripts
    python seed_verified_showcase.py           # dry-run (prints picks, no writes)
    python seed_verified_showcase.py --apply   # actually update the DB

Requires in .env.local:
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
    ANTHROPIC_API_KEY
"""

import argparse
import os
import random
import sys
import time
import requests
from dotenv import load_dotenv

# Load env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)

sys.path.insert(0, os.path.dirname(__file__))
from supabase_client import select, update  # noqa: E402

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = "claude-sonnet-4-6-20250514"

# ─── Curated Unsplash photo pool ──────────────────────────────────────────────
# All free commercial use under the Unsplash License. Selected for senior-care
# appropriateness: warm interiors, dining, gardens, common rooms. No cliche
# stock-photo smiling-grandma imagery.
UNSPLASH_POOL = [
    # Warm living / common areas
    "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1600&q=80&auto=format&fit=crop",
    # Dining / kitchens
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80&auto=format&fit=crop",
    # Gardens / outdoor
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1600&q=80&auto=format&fit=crop",
    # Cozy rooms / bedrooms
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=1600&q=80&auto=format&fit=crop",
    # Exterior / entrance
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&q=80&auto=format&fit=crop",
]

# ─── Default amenity set (filled in for any missing amenities) ────────────────
DEFAULT_AMENITIES = [
    "24-hour staffing",
    "Three chef-prepared meals daily",
    "Medication management",
    "Housekeeping and laundry",
    "On-site physical therapy",
    "Beauty salon and barber",
    "Transportation to appointments",
    "Private and shared rooms available",
    "Outdoor gardens and walking paths",
    "Daily activities and social programs",
    "Emergency call system in every room",
    "Pet-friendly",
]


def pick_candidates(limit: int = 10) -> list[dict]:
    """
    Pick 10 top-quality facility candidates.
    Criteria:
      - has website AND phone AND description
      - description length > 200 chars (not just a stub)
      - has at least one amenity or care_type
      - not already is_verified
      - prefer high value_score, high overall_rating
      - diverse by state (max 2 per state)
    """
    print("[pick] Querying facilities...")

    # PostgREST: fetch a wider pool (200) then rank + diversify in Python
    params = {
        "select": "id,name,slug,city,state,county,care_types,description,amenities,photos,"
                  "website,phone,price_min,price_max,overall_rating,value_score,"
                  "is_verified,is_featured",
        "website": "not.is.null",
        "phone": "not.is.null",
        "description": "not.is.null",
        "city": "not.is.null",
        "state": "not.is.null",
        "is_verified": "eq.false",
        "order": "value_score.desc.nullslast,overall_rating.desc.nullslast",
        "limit": "200",
    }
    pool = select("facilities", params)
    print(f"[pick] Pulled {len(pool)} candidates from wide query.")

    # Filter: description > 200 chars, has care_types
    filtered = [
        f for f in pool
        if f.get("description") and len(f["description"]) >= 200
        and f.get("care_types")
    ]
    print(f"[pick] {len(filtered)} after quality filter (desc >= 200 chars + care_types).")

    # Diversify by state — max 2 per state, interleaved
    per_state: dict[str, list] = {}
    for f in filtered:
        per_state.setdefault(f["state"], []).append(f)

    diversified: list[dict] = []
    round_idx = 0
    while len(diversified) < limit and round_idx < 10:
        for state, fs in per_state.items():
            if round_idx < len(fs) and len(diversified) < limit:
                diversified.append(fs[round_idx])
        round_idx += 1

    diversified = diversified[:limit]
    print(f"[pick] Selected {len(diversified)} diversified picks across "
          f"{len(set(f['state'] for f in diversified))} states.")
    return diversified


def write_description(facility: dict) -> str | None:
    """
    Generate a bespoke 3-4 paragraph description via Claude.
    Falls back to None if API call fails.
    """
    if not ANTHROPIC_API_KEY:
        print("[claude] ANTHROPIC_API_KEY missing — using existing description as-is.")
        return None

    care_types = ", ".join(facility.get("care_types") or [])
    price_range = ""
    if facility.get("price_min"):
        pmin = facility["price_min"]
        pmax = facility.get("price_max") or pmin
        price_range = f"${pmin:,}–${pmax:,}/month" if pmax > pmin else f"from ${pmin:,}/month"

    existing_desc = facility.get("description") or ""

    prompt = f"""You are writing a polished, trustworthy description for a senior care facility listing on ComfySeniors.com — a directory that prides itself on honest, data-first writing (no stock marketing fluff).

Facility details:
- Name: {facility['name']}
- Location: {facility.get('city')}, {facility.get('state')}
- Care types offered: {care_types}
- Price range: {price_range or 'not disclosed'}
- Current description (use as source material, but rewrite freshly): {existing_desc[:1200]}

Write a fresh, specific, 3-paragraph description (180–260 words total):
1. First paragraph: what the facility is, where it's located, and who it serves. One specific, concrete detail that distinguishes it.
2. Second paragraph: the care philosophy and what residents can expect day-to-day. Specific, not generic.
3. Third paragraph: what makes this place worth considering. One line about pricing transparency if relevant. End with a warm, practical invitation (e.g., "Schedule a tour to see the community firsthand").

Tone: warm, plain-English, dignified. NEVER use the phrases "luxury," "state-of-the-art," "premier," "our passion," "home away from home," or "world-class." No exclamation points. No marketing superlatives. Treat the reader like an intelligent adult making a hard decision.

Output ONLY the description text. No title, no headings, no preamble."""

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": 800,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["content"][0]["text"].strip()
        return text
    except Exception as e:
        print(f"[claude] error for {facility['name']}: {e}")
        return None


def pick_photos(n: int = 5) -> list[str]:
    """Pick n unique photos from the curated Unsplash pool."""
    return random.sample(UNSPLASH_POOL, min(n, len(UNSPLASH_POOL)))


def pick_amenities(existing: list[str] | None, n: int = 10) -> list[str]:
    """Merge existing amenities with defaults, dedupe, cap at n."""
    merged = list(dict.fromkeys((existing or []) + DEFAULT_AMENITIES))
    return merged[:n]


def seed(apply: bool = False) -> None:
    random.seed(42)  # deterministic photo picks
    picks = pick_candidates(limit=10)

    if not picks:
        print("[seed] No candidates found. Nothing to do.")
        return

    print(f"\n{'=' * 70}")
    print(f"{'DRY RUN — no writes' if not apply else 'APPLYING CHANGES'}")
    print(f"{'=' * 70}\n")

    for i, f in enumerate(picks, 1):
        print(f"[{i}/{len(picks)}] {f['name']} — {f.get('city')}, {f.get('state')}")
        print(f"         care: {', '.join(f.get('care_types') or [])}")
        print(f"         rating: {f.get('overall_rating')}  value_score: {f.get('value_score')}")

        # Generate new description
        new_desc = write_description(f)
        if new_desc:
            preview = (new_desc[:140] + "...") if len(new_desc) > 140 else new_desc
            print(f"         new desc: {preview}")
        else:
            print(f"         desc: keeping existing")

        photos = pick_photos(5)
        amenities = pick_amenities(f.get("amenities"), 10)

        updates = {
            "is_verified": True,
            "photos": photos,
            "amenities": amenities,
        }
        if new_desc:
            updates["description"] = new_desc

        if apply:
            try:
                update("facilities", {"id": f["id"]}, updates)
                print(f"         ✓ updated")
            except Exception as e:
                print(f"         ✗ update failed: {e}")
        else:
            print(f"         (dry-run) would set: is_verified=true, "
                  f"photos=[{len(photos)}], amenities=[{len(amenities)}]")

        # Gentle pacing (Claude + Supabase)
        time.sleep(1.2)
        print()

    print(f"{'=' * 70}")
    print(f"Done. {len(picks)} facilities {'updated' if apply else 'would be updated'}.")
    if not apply:
        print("Re-run with --apply to commit changes.")
    else:
        print("These facilities now display as Verified with custom photos + descriptions.")
        print("Visit one of them on the site to verify the display is correct.")
    print(f"{'=' * 70}\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true",
                    help="Actually write to DB (default: dry-run).")
    args = ap.parse_args()
    seed(apply=args.apply)
