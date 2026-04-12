"""
Pull Google star ratings and review counts for all facilities
using the Google Places API Text Search.

Searches each facility by name + city, gets the top result's
rating and userRatingCount, then creates a review record in
the reviews table with that aggregate data.

Run from scripts/: python import_google_ratings.py
"""

import time
import requests
from supabase_client import select, update, insert

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"


def search_place(name: str, city: str, zip_code: str) -> dict | None:
    """Search Google Places for a facility and return rating data."""
    query = f"{name} {city} NJ {zip_code}"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.rating,places.userRatingCount",
    }
    payload = {"textQuery": query, "maxResultCount": 1}

    r = requests.post(PLACES_URL, json=payload, headers=headers, timeout=15)
    if r.status_code != 200:
        return None

    places = r.json().get("places", [])
    if not places:
        return None

    place = places[0]
    rating = place.get("rating")
    count = place.get("userRatingCount", 0)

    if not rating or count == 0:
        return None

    return {"rating": rating, "review_count": count}


def main():
    print("Loading facilities...")
    all_facilities = []
    for offset in range(0, 3000, 1000):
        batch = select(
            "facilities",
            {
                "select": "id,name,city,zip",
                "limit": "1000",
                "offset": str(offset),
            },
        )
        all_facilities.extend(batch)

    print(f"Total facilities: {len(all_facilities)}")

    # Check which already have reviews
    existing_reviews = []
    for offset in range(0, 5000, 1000):
        batch = select(
            "reviews",
            {
                "select": "facility_id",
                "limit": "1000",
                "offset": str(offset),
            },
        )
        existing_reviews.extend(batch)

    has_reviews = {r["facility_id"] for r in existing_reviews}
    needs_rating = [f for f in all_facilities if f["id"] not in has_reviews]
    print(f"Already have reviews: {len(has_reviews)}")
    print(f"Need ratings: {len(needs_rating)}")

    updated = 0
    skipped = 0
    errors = 0
    request_count = 0

    for i, facility in enumerate(needs_rating):
        name = facility.get("name", "")
        city = facility.get("city", "")
        zip_code = facility.get("zip", "")

        try:
            result = search_place(name, city, zip_code)
            request_count += 1

            if result:
                # Create a single aggregate review record
                # representing the Google rating
                rating = round(result["rating"])
                rating = max(1, min(5, rating))  # Clamp to 1-5

                insert("reviews", [{
                    "facility_id": facility["id"],
                    "reviewer_name": "Google Reviews",
                    "relationship": "aggregate",
                    "rating": rating,
                    "body": f"Based on {result['review_count']} Google reviews with an average rating of {result['rating']:.1f} stars.",
                    "is_published": True,
                }])
                updated += 1
            else:
                skipped += 1

            # Rate limit
            time.sleep(0.15)

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  ERR: {name}: {e}")
            time.sleep(0.5)

        if (i + 1) % 100 == 0:
            print(f"  Progress: {i + 1}/{len(needs_rating)} — {updated} rated, {skipped} skipped, {errors} errors ({request_count} API calls)")

    print(f"\nDone!")
    print(f"  Facilities with ratings added: {updated}")
    print(f"  Skipped (no Google data): {skipped}")
    print(f"  Errors: {errors}")
    print(f"  API calls: {request_count}")


if __name__ == "__main__":
    main()
