"""
Seed sample reviews for facilities in Supabase.
Run: python scripts/seed_reviews.py
"""

import random
from supabase_client import select, insert

REVIEW_TEMPLATES = [
    {"reviewer_name": "Sarah M.", "relationship": "daughter", "rating": 5, "body": "My mother has been here for 8 months and we couldn't be happier. The staff is attentive and genuinely caring. The activities program keeps her engaged and social. Worth every penny."},
    {"reviewer_name": "Robert K.", "relationship": "son", "rating": 4, "body": "Good facility overall. Dad's room is clean and comfortable. The food could be better — he says it's repetitive. But the nursing staff is excellent and responsive. Would recommend."},
    {"reviewer_name": "Maria G.", "relationship": "spouse", "rating": 5, "body": "After visiting a dozen facilities, we chose this one and it was the right decision. My husband is treated with dignity and respect. The memory care program is outstanding."},
    {"reviewer_name": "James T.", "relationship": "son", "rating": 3, "body": "It's adequate but not exceptional. Staff turnover seems high, which means my father has to constantly adjust to new caregivers. The building is well-maintained though."},
    {"reviewer_name": "Linda P.", "relationship": "daughter", "rating": 4, "body": "Mom has been here for over a year. The care is consistently good. Communication with family could be better — sometimes we have to chase down updates. But overall satisfied."},
    {"reviewer_name": "David W.", "relationship": "son", "rating": 2, "body": "We had high expectations but were disappointed. Staffing seems thin during evening hours, and it took too long for call bells to be answered. We're considering other options."},
    {"reviewer_name": "Patricia H.", "relationship": "daughter", "rating": 5, "body": "Exceptional care. The team goes above and beyond. My mother actually enjoys living here — she has friends, activities she loves, and caregivers who know her by name."},
    {"reviewer_name": "Michael R.", "relationship": "self", "rating": 4, "body": "I chose to move here after my wife passed. The community has been wonderful for helping me stay active and connected. The apartment is comfortable and the staff is friendly."},
    {"reviewer_name": "Jennifer L.", "relationship": "daughter", "rating": 3, "body": "The facility is fine for the price point. Don't expect luxury. The care is competent but not personalized. Good for families who need a reliable, no-frills option."},
    {"reviewer_name": "Thomas B.", "relationship": "son", "rating": 5, "body": "Five stars for the rehabilitation team. My father had hip surgery and the PT team had him walking again in three weeks. Professional, encouraging, and effective."},
    {"reviewer_name": "Susan C.", "relationship": "daughter", "rating": 4, "body": "We appreciate the transparency here. They were upfront about costs, care limitations, and what to expect. No surprises. My mom is well cared for."},
    {"reviewer_name": "Nancy D.", "relationship": "granddaughter", "rating": 1, "body": "Terrible experience. My grandmother's medication was missed twice in one week. When we complained, the response was dismissive. We moved her out within a month."},
]


def main():
    # Get all facilities
    facilities = select("faq_questions", {"select": "id", "limit": "1"})  # Quick connectivity check
    facilities = select("facilities", {"select": "id,name"})

    if not facilities:
        print("No facilities found. Run seed_facilities.py first.")
        return

    print(f"Found {len(facilities)} facilities. Generating reviews...")

    reviews = []
    for facility in facilities:
        # Each facility gets 2-5 random reviews
        num_reviews = random.randint(2, 5)
        selected = random.sample(REVIEW_TEMPLATES, min(num_reviews, len(REVIEW_TEMPLATES)))

        for template in selected:
            reviews.append({
                "facility_id": facility["id"],
                "reviewer_name": template["reviewer_name"],
                "relationship": template["relationship"],
                "rating": template["rating"],
                "body": template["body"],
                "is_published": True,
            })

    print(f"  Inserting {len(reviews)} reviews...")
    for i in range(0, len(reviews), 20):
        batch = reviews[i:i+20]
        try:
            result = insert("reviews", batch)
            print(f"  Batch {i//20 + 1}: {len(result)} reviews inserted")
        except Exception as e:
            print(f"  ERROR on batch {i//20 + 1}: {e}")

    print("Done!")


if __name__ == "__main__":
    main()
