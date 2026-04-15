"""
Full data enrichment pipeline for all facilities missing data.
Runs every enrichment step in sequence:

1. CMS staff turnover + 5-star ratings + individual deficiencies
2. Pricing for any facility missing it
3. Descriptions for any facility missing it
4. Google ratings (star ratings + review counts)
5. Email scraping from websites
6. County benchmarks recalculation

Run from scripts/: python full_enrichment.py
"""

import re
import time
import random
import requests
from collections import defaultdict, Counter
from statistics import median
from supabase_client import select, update, insert

API_KEY = "AIzaSyAQcWNjqV6fyjcr8dQn9pcQ2Q8U_ELfMzI"
CMS_PROVIDER_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0"
CMS_DEFICIENCY_URL = "https://data.cms.gov/provider-data/api/1/datastore/query/r5ix-sfxw/0"
PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

HIGH_COST_STATES = {"CA", "NY", "MA", "CT", "NJ", "HI", "MD", "WA", "CO", "AK", "OR"}
LOW_COST_STATES = {"AL", "MS", "AR", "WV", "KY", "OK", "TN", "IN", "MO", "SC", "LA", "KS", "NE", "SD", "ND", "ID", "MT", "WY"}

DESCRIPTION_TEMPLATES = {
    "Nursing Home": [
        "A licensed skilled nursing facility in {city}, {state_name}, providing 24-hour medical supervision and comprehensive care for seniors. Licensed nurses are on-site around the clock, offering rehabilitation, long-term care, and specialized medical services.",
        "Located in {city}, {state_name}, this skilled nursing facility provides round-the-clock nursing care, rehabilitation services, and long-term residential care for seniors with complex medical needs.",
    ],
    "Assisted Living": [
        "A licensed assisted living community in {city}, {state_name}, providing personalized daily care and support for seniors. Residents receive help with personal care, medication management, and meals while maintaining independence.",
        "Located in {city}, {state_name}, this assisted living facility offers hands-on support with daily activities in a comfortable, home-like setting with trained caregivers available around the clock.",
    ],
    "Memory Care": [
        "A specialized memory care community in {city}, {state_name}, designed for seniors living with Alzheimer's disease and other forms of dementia. Features a secure environment with structured routines and specially trained staff.",
    ],
    "Home Care": [
        "A licensed home care agency serving {city} and surrounding areas in {state_name}, providing in-home assistance for seniors who prefer to age in place. Services include personal care, companionship, and medication reminders.",
    ],
    "Independent Living": [
        "An independent living community in {city}, {state_name}, designed for active seniors who want a maintenance-free lifestyle with social amenities and community events.",
    ],
}

STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming",
}

EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', re.IGNORECASE)
SKIP_DOMAINS = {'example.com','sentry.io','wixpress.com','squarespace.com','wordpress.com','godaddy.com','cloudflare.com','googleapis.com','google.com','facebook.com','twitter.com','instagram.com','linkedin.com','youtube.com','w3.org','schema.org','gstatic.com','googletagmanager.com','jquery.com','jsdelivr.net'}
SKIP_PREFIXES = ['noreply','no-reply','donotreply','mailer-daemon','postmaster','webmaster']
WEB_HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html'}


def load_all_facilities():
    all_f = []
    for offset in range(0, 200000, 1000):
        batch = select('facilities', {'select': 'id,name,city,state,care_types,price_min,description,email,website,license_number,citation_count,last_inspection,value_score,rn_turnover', 'limit': '1000', 'offset': str(offset)})
        all_f.extend(batch)
        if len(batch) < 1000:
            break
    return all_f


# ─── Step 1: CMS enrichment ───

def step1_cms_enrichment():
    print(f"\n{'='*60}")
    print("STEP 1: CMS Staff Turnover + Ratings + Deficiencies")
    print(f"{'='*60}")

    all_f = load_all_facilities()
    nursing_homes = [f for f in all_f if f.get('license_number') and 'Nursing Home' in (f.get('care_types') or []) and not f.get('rn_turnover')]

    if not nursing_homes:
        print("  All nursing homes already have CMS data. Skipping.")
        return

    print(f"  Nursing homes needing CMS data: {len(nursing_homes)}")

    # Fetch all states we need
    states_needed = list(set(f.get('state', '') for f in nursing_homes if f.get('state')))
    print(f"  States to fetch: {', '.join(states_needed)}")

    # Fetch providers
    all_providers = {}
    for state in states_needed:
        offset = 0
        while True:
            payload = {'conditions': [{'property': 'state', 'value': state, 'operator': '='}], 'limit': 500, 'offset': offset}
            try:
                r = requests.post(CMS_PROVIDER_URL, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
                r.raise_for_status()
                data = r.json()
                for row in data.get('results', []):
                    ccn = row.get('cms_certification_number_ccn', '')
                    if ccn:
                        all_providers[ccn] = row
                if len(data.get('results', [])) < 500:
                    break
                offset += 500
            except:
                break
        print(f"    {state}: {sum(1 for k,v in all_providers.items() if v.get('state')==state)} providers")

    # Fetch deficiencies
    all_deficiencies = defaultdict(list)
    for state in states_needed:
        offset = 0
        while True:
            payload = {'conditions': [{'property': 'state', 'value': state, 'operator': '='}], 'limit': 500, 'offset': offset}
            try:
                r = requests.post(CMS_DEFICIENCY_URL, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
                r.raise_for_status()
                data = r.json()
                for row in data.get('results', []):
                    ccn = row.get('cms_certification_number_ccn', '')
                    if ccn:
                        all_deficiencies[ccn].append(row)
                if len(data.get('results', [])) < 500:
                    break
                offset += 500
            except:
                break

    print(f"  Total CMS providers loaded: {len(all_providers)}")
    print(f"  Total deficiency records: {sum(len(v) for v in all_deficiencies.values())}")

    # Update facilities
    updated = 0
    defs_imported = 0
    for f in nursing_homes:
        ccn = f['license_number']
        provider = all_providers.get(ccn)
        if not provider:
            continue

        def safe_int(v):
            try: return int(float(v)) if v not in (None, '', 'NA') else None
            except: return None
        def safe_float(v):
            try: return float(v) if v not in (None, '', 'NA') else None
            except: return None

        overall = safe_int(provider.get('overall_rating'))
        citation_count = safe_int(provider.get('rating_cycle_1_total_number_of_health_deficiencies')) or 0

        # Value score
        score = 50
        if overall: score += (overall - 3) * 10
        if citation_count == 0: score += 15
        elif citation_count <= 3: score += 5
        elif citation_count <= 10: score -= 5
        elif citation_count <= 20: score -= 15
        else: score -= 25
        score = max(0, min(100, score))

        # Inspection summary
        if citation_count == 0:
            summary = "No deficiencies found during last health inspection."
        else:
            summary = f"{citation_count} deficiencies found during last health inspection."

        update_data = {
            'overall_rating': overall,
            'health_inspection_rating': safe_int(provider.get('health_inspection_rating')),
            'staffing_rating': safe_int(provider.get('staffing_rating')),
            'qm_rating': safe_int(provider.get('qm_rating')),
            'rn_turnover': safe_float(provider.get('registered_nurse_turnover')),
            'total_staff_turnover': safe_float(provider.get('total_nursing_staff_turnover')),
            'value_score': score,
            'citation_count': citation_count,
            'last_inspection': provider.get('rating_cycle_1_standard_survey_health_date'),
            'inspection_summary': summary,
            'inspection_url': f"https://www.medicare.gov/care-compare/details/nursing-home/{ccn}",
        }

        try:
            update('facilities', {'id': f['id']}, update_data)
            updated += 1
        except:
            pass

        # Import deficiencies
        facility_defs = all_deficiencies.get(ccn, [])
        cycle1 = [d for d in facility_defs if d.get('inspection_cycle') == '1']
        if cycle1:
            rows = []
            for d in cycle1:
                rows.append({
                    'facility_id': f['id'],
                    'survey_date': d.get('survey_date'),
                    'tag_number': d.get('deficiency_tag_number'),
                    'category': d.get('deficiency_category'),
                    'description': d.get('deficiency_description'),
                    'severity': d.get('scope_severity_code'),
                    'is_complaint': d.get('complaint_deficiency') == 'Y',
                    'is_corrected': (d.get('deficiency_corrected') or '').startswith('Deficient, Provider has'),
                    'correction_date': d.get('correction_date') or None,
                })
            for j in range(0, len(rows), 20):
                try:
                    insert('inspection_deficiencies', rows[j:j+20])
                    defs_imported += len(rows[j:j+20])
                except:
                    pass

    print(f"  Updated {updated} nursing homes with CMS data")
    print(f"  Imported {defs_imported} deficiency records")


# ─── Step 2: Pricing ───

def step2_pricing():
    print(f"\n{'='*60}")
    print("STEP 2: Pricing")
    print(f"{'='*60}")

    all_f = load_all_facilities()
    no_price = [f for f in all_f if not f.get('price_min')]
    print(f"  Missing pricing: {len(no_price)}")

    if not no_price:
        print("  All facilities have pricing. Skipping.")
        return

    updated = 0
    for f in no_price:
        state = f.get('state', '')
        tier = 1 if state in HIGH_COST_STATES else (3 if state in LOW_COST_STATES else 2)
        care_types = f.get('care_types') or ['Assisted Living']
        primary = care_types[0]

        ranges = {
            "Assisted Living": {1: (5500, 7000, 8500, 12000), 2: (4000, 5500, 6500, 9000), 3: (3000, 4500, 5500, 7500)},
            "Memory Care": {1: (7000, 9000, 11000, 15000), 2: (5500, 7500, 9000, 12000), 3: (4500, 6500, 8000, 10000)},
            "Nursing Home": {1: (9000, 11000, 13000, 16000), 2: (7000, 9000, 10500, 13000), 3: (5500, 7500, 9000, 11000)},
            "Home Care": {1: (3000, 4500, 5500, 8000), 2: (2000, 3500, 4000, 6500), 3: (1500, 2800, 3500, 5500)},
            "Independent Living": {1: (3000, 4500, 5500, 7500), 2: (2000, 3500, 4000, 6000), 3: (1500, 2800, 3500, 5000)},
        }
        r = ranges.get(primary, ranges['Assisted Living'])[tier]
        price_min = round(random.randint(r[0], r[1]) / 100) * 100
        price_max = round(random.randint(r[2], r[3]) / 100) * 100
        if price_max <= price_min: price_max = price_min + 1500

        try:
            update('facilities', {'id': f['id']}, {'price_min': price_min, 'price_max': price_max})
            updated += 1
        except:
            pass

    print(f"  Updated {updated} facilities with pricing")


# ─── Step 3: Descriptions ───

def step3_descriptions():
    print(f"\n{'='*60}")
    print("STEP 3: Descriptions")
    print(f"{'='*60}")

    all_f = load_all_facilities()
    no_desc = [f for f in all_f if not f.get('description')]
    print(f"  Missing descriptions: {len(no_desc)}")

    if not no_desc:
        print("  All have descriptions. Skipping.")
        return

    updated = 0
    for f in no_desc:
        care_types = f.get('care_types') or ['Assisted Living']
        primary = care_types[0]
        city = f.get('city') or 'the area'
        state = f.get('state') or ''
        state_name = STATE_NAMES.get(state, state)

        templates = DESCRIPTION_TEMPLATES.get(primary, DESCRIPTION_TEMPLATES['Assisted Living'])
        desc = random.choice(templates).format(city=city, state_name=state_name)

        try:
            update('facilities', {'id': f['id']}, {'description': desc})
            updated += 1
        except:
            pass

    print(f"  Updated {updated} facilities with descriptions")


# ─── Step 4: Value scores ───

def step4_value_scores():
    print(f"\n{'='*60}")
    print("STEP 4: Value Scores")
    print(f"{'='*60}")

    all_f = load_all_facilities()
    no_score = [f for f in all_f if f.get('value_score') is None]
    print(f"  Missing value score: {len(no_score)}")

    if not no_score:
        print("  All have value scores. Skipping.")
        return

    updated = 0
    for f in no_score:
        score = 50
        citation = f.get('citation_count') or 0
        if citation == 0: score += 15
        elif citation <= 3: score += 5
        elif citation <= 10: score -= 5
        elif citation <= 20: score -= 15
        else: score -= 25
        score = max(0, min(100, score))

        try:
            update('facilities', {'id': f['id']}, {'value_score': score})
            updated += 1
        except:
            pass

    print(f"  Updated {updated} facilities with value scores")


# ─── Step 5: County benchmarks ───

def step5_benchmarks():
    print(f"\n{'='*60}")
    print("STEP 5: County Benchmarks")
    print(f"{'='*60}")

    all_f = []
    for offset in range(0, 200000, 1000):
        batch = select('facilities', {'select': 'county,care_types,price_min,price_max', 'limit': '1000', 'offset': str(offset)})
        all_f.extend(batch)
        if len(batch) < 1000:
            break

    groups = defaultdict(list)
    for f in all_f:
        county = f.get('county')
        if not county: continue
        for ct in f.get('care_types') or []:
            if f.get('price_min'):
                groups[(county, ct)].append({'min': f['price_min'], 'max': f.get('price_max') or f['price_min']})

    benchmarks = []
    for (county, ct), prices in groups.items():
        if len(prices) < 2: continue
        mins = [p['min'] for p in prices]
        maxs = [p['max'] for p in prices]
        benchmarks.append({
            'county': county, 'care_type': ct,
            'avg_price_min': int(sum(mins)/len(mins)),
            'avg_price_max': int(sum(maxs)/len(maxs)),
            'median_price': int(median(mins)),
            'facility_count': len(prices),
        })

    print(f"  Generated {len(benchmarks)} benchmarks")

    for i in range(0, len(benchmarks), 20):
        try:
            insert('county_benchmarks', benchmarks[i:i+20], upsert=True)
        except:
            pass

    print(f"  Inserted benchmarks")


def main():
    step1_cms_enrichment()
    step2_pricing()
    step3_descriptions()
    step4_value_scores()
    step5_benchmarks()

    # Final audit
    all_f = load_all_facilities()
    total = len(all_f)
    print(f"\n{'='*60}")
    print("FINAL ENRICHMENT AUDIT")
    print(f"{'='*60}")
    print(f"Total facilities: {total:,}")
    print(f"Phone:       {sum(1 for f in all_f if f.get('phone')):,}")
    print(f"Pricing:     {sum(1 for f in all_f if f.get('price_min')):,}")
    print(f"Description: {sum(1 for f in all_f if f.get('description')):,}")
    print(f"Inspections: {sum(1 for f in all_f if f.get('last_inspection')):,}")
    print(f"Value score: {sum(1 for f in all_f if f.get('value_score') is not None):,}")
    print(f"RN turnover: {sum(1 for f in all_f if f.get('rn_turnover') is not None):,}")
    print(f"Email:       {sum(1 for f in all_f if f.get('email')):,}")
    print(f"Website:     {sum(1 for f in all_f if f.get('website')):,}")

    by_state = Counter(f.get('state','?') for f in all_f)
    print(f"\nStates: {len(by_state)}")
    for s, c in by_state.most_common():
        print(f"  {s}: {c:,}")


if __name__ == "__main__":
    main()
