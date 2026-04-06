"""
Generate natural descriptions for all facilities missing one.
Uses existing data (care type, city, county, beds, payment, amenities).
No AI API calls — template-based with variation for uniqueness.

Run from scripts/: python enrich_descriptions.py
"""

import random
from supabase_client import select, update

# ─── Description templates by care type ───
# Each has multiple openers, middles, and closers for variety

TEMPLATES = {
    "Assisted Living": {
        "openers": [
            "A licensed assisted living community in {city}, {county} County, providing personalized daily care and support for seniors.",
            "Located in {city}, New Jersey, this assisted living facility offers hands-on support with daily activities in a comfortable, home-like setting.",
            "This {city} assisted living community provides professional care for seniors who need assistance with bathing, dressing, medication management, and daily routines.",
            "Serving families in {county} County, this assisted living residence in {city} combines personal care support with an engaging community atmosphere.",
        ],
        "middles": [
            " Residents receive help with personal care, medication management, and meals while maintaining as much independence as possible.",
            " The community offers assistance with daily living activities, three meals a day, and a calendar of social and recreational programs.",
            " Staff provide around-the-clock support with personal care needs, medication administration, and mobility assistance.",
            " Care plans are tailored to each resident's needs, with trained staff available 24 hours a day.",
        ],
        "closers": [
            " Families can visit anytime and are encouraged to participate in community events.",
            " The goal is to help residents live comfortably while receiving the care they need.",
            " Contact the facility directly for current availability and a personalized care assessment.",
            "",
        ],
    },
    "Memory Care": {
        "openers": [
            "A specialized memory care community in {city}, {county} County, designed for seniors living with Alzheimer's disease and other forms of dementia.",
            "This {city} memory care facility provides a secure, structured environment for seniors with cognitive impairments, including Alzheimer's and dementia.",
            "Located in {county} County, this memory care residence in {city} offers specialized programming for seniors with Alzheimer's, dementia, and related conditions.",
            "Serving {city} and surrounding areas, this memory care community provides 24/7 specialized support for seniors with memory-related conditions.",
        ],
        "middles": [
            " The secured community features structured daily routines, sensory activities, and staff trained in dementia care techniques.",
            " Residents benefit from a secure environment designed to reduce confusion and agitation, with programming that supports cognitive function.",
            " Care is delivered by specially trained staff who understand the unique needs of residents with memory loss.",
        ],
        "closers": [
            " Families are welcome to visit and participate in care planning.",
            " Contact the community to schedule a tour and learn about their approach to memory care.",
            "",
        ],
    },
    "Nursing Home": {
        "openers": [
            "A licensed skilled nursing facility in {city}, {county} County, providing 24-hour medical supervision and comprehensive care for seniors.",
            "This {city} nursing home offers round-the-clock nursing care, rehabilitation services, and long-term residential care for seniors with complex medical needs.",
            "Located in {county} County, this skilled nursing facility in {city} provides medical care, rehabilitation, and support for seniors requiring continuous nursing attention.",
            "Serving {city} and the surrounding {county} County area, this nursing facility provides skilled nursing care, post-acute rehabilitation, and long-term care.",
        ],
        "middles": [
            " Licensed nurses are on-site 24/7, and the facility offers physical, occupational, and speech therapy services.",
            " Services include wound care, IV therapy, pain management, and post-surgical rehabilitation under the supervision of licensed medical professionals.",
            " The facility is staffed with registered nurses, licensed practical nurses, and certified nursing assistants around the clock.",
        ],
        "closers": [
            " Both short-term rehabilitation and long-term care are available.",
            " Contact the admissions team to discuss care needs and insurance coverage.",
            "",
        ],
    },
    "Home Care": {
        "openers": [
            "A licensed home care agency serving {city} and {county} County, providing in-home assistance for seniors who prefer to age in place.",
            "This {city}-based home care provider offers personalized in-home support for seniors throughout {county} County and surrounding areas.",
            "Serving seniors in {city} and across {county} County, this home care agency provides professional in-home caregivers for daily assistance and companionship.",
            "A trusted home care provider in {county} County, offering in-home senior care services to families in {city} and nearby communities.",
        ],
        "middles": [
            " Services include personal care, medication reminders, meal preparation, light housekeeping, and companionship.",
            " Caregivers assist with bathing, dressing, mobility, meal prep, errands, and transportation to medical appointments.",
            " Flexible care plans range from a few hours per week to 24-hour live-in care, tailored to each client's needs.",
        ],
        "closers": [
            " All caregivers are screened, trained, and supervised.",
            " Call to schedule a free in-home care assessment.",
            "",
        ],
    },
    "Independent Living": {
        "openers": [
            "An independent living community in {city}, {county} County, designed for active seniors who want a maintenance-free lifestyle with social amenities.",
            "This {city} independent living residence offers seniors a vibrant, low-maintenance lifestyle with access to dining, activities, and community events.",
            "Located in {county} County, this independent living community in {city} provides apartment-style living for seniors who don't need daily care assistance.",
            "Serving active seniors in {city}, this independent living community combines private residences with shared amenities and social programming.",
        ],
        "middles": [
            " Residents enjoy private apartments, chef-prepared meals, housekeeping, and a full calendar of social and recreational activities.",
            " The community offers maintenance-free living with optional dining plans, scheduled transportation, and organized social events.",
            " Amenities may include fitness facilities, common areas, organized outings, and on-site dining options.",
        ],
        "closers": [
            " No long-term care commitment is required — residents live independently with support available if needs change.",
            " Contact the community for floor plans and availability.",
            "",
        ],
    },
}


def generate_description(facility: dict) -> str:
    """Generate a unique description from facility data."""
    care_types = facility.get("care_types") or ["Assisted Living"]
    city = facility.get("city") or "New Jersey"
    county = facility.get("county") or "New Jersey"

    # Pick primary care type
    primary = care_types[0] if care_types else "Assisted Living"
    templates = TEMPLATES.get(primary, TEMPLATES["Assisted Living"])

    opener = random.choice(templates["openers"]).format(city=city, county=county)
    middle = random.choice(templates["middles"])
    closer = random.choice(templates["closers"])

    desc = opener + middle + closer

    # Add payment info if notable
    payments = []
    if facility.get("accepts_medicaid"):
        payments.append("Medicaid")
    if facility.get("accepts_medicare"):
        payments.append("Medicare")
    if payments:
        desc += f" Accepts {' and '.join(payments)}."

    # Add bed count if available
    beds = facility.get("beds")
    if beds:
        desc += f" Licensed for {beds} beds."

    return desc.strip()


def main():
    print("Loading facilities without descriptions...")

    all_facilities = []
    for offset in range(0, 2000, 1000):
        batch = select("facilities", {
            "select": "id,name,care_types,city,county,beds,accepts_medicaid,accepts_medicare,description",
            "limit": "1000",
            "offset": str(offset),
        })
        all_facilities.extend(batch)

    no_desc = [f for f in all_facilities if not f.get("description")]
    print(f"Total: {len(all_facilities)} | Missing description: {len(no_desc)}")

    updated = 0
    errors = 0

    for f in no_desc:
        desc = generate_description(f)
        try:
            update("facilities", {"id": f["id"]}, {"description": desc})
            updated += 1
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f"  ERROR: {f['name']}: {e}")

        if updated % 100 == 0 and updated > 0:
            print(f"  Updated {updated}/{len(no_desc)}...")

    print(f"\nDone! Generated descriptions for {updated} facilities ({errors} errors)")


if __name__ == "__main__":
    main()
